const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

try {
  process.loadEnvFile?.();
} catch {
  // The server can still start without an .env file and use the OSM fallback.
}

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const requestWindows = new Map();
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(data));
}

function readJsonBody(request, maxLength = 8192) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxLength) {
        reject(new Error('Request body too large.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

function isRateLimited(request, limit = 30, bucket = 'default') {
  const now = Date.now();
  const key = `${request.socket.remoteAddress || 'unknown'}:${bucket}`;
  const windowMs = 15 * 60 * 1000;
  const record = requestWindows.get(key);
  if (!record || now - record.startedAt >= windowMs) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }
  record.count += 1;
  return record.count > limit;
}

async function classifyWasteImage(request, response) {
  if (isRateLimited(request, 8, 'waste-vision')) {
    sendJson(response, 429, { code: 'RATE_LIMITED', error: 'Bạn đã quét quá nhiều ảnh. Vui lòng thử lại sau 15 phút.' });
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 503, { code: 'VISION_NOT_CONFIGURED', error: 'AI thị giác trực tuyến chưa được cấu hình trên máy chủ.' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request, 6 * 1024 * 1024);
  } catch {
    sendJson(response, 400, { code: 'INVALID_IMAGE_REQUEST', error: 'Không đọc được dữ liệu ảnh. Hãy chọn ảnh nhỏ hơn rồi thử lại.' });
    return;
  }

  const imageMatch = body && typeof body.image === 'string'
    ? body.image.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/)
    : null;
  if (!imageMatch) {
    sendJson(response, 400, { code: 'INVALID_IMAGE', error: 'Ảnh phải là JPEG, PNG hoặc WebP hợp lệ.' });
    return;
  }

  const imageBytes = Buffer.from(imageMatch[2], 'base64');
  if (!imageBytes.length || imageBytes.length > 4 * 1024 * 1024) {
    sendJson(response, 413, { code: 'IMAGE_TOO_LARGE', error: 'Ảnh vẫn quá lớn sau khi thu nhỏ. Hãy chọn ảnh khác.' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const providerResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
        max_tokens: 350,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                'Phân loại vật thể/rác chính trong ảnh để hướng dẫn phân loại rác tại Việt Nam.',
                'Chỉ trả JSON hợp lệ với các trường wasteType, objectName, confidence, materialNote.',
                'wasteType phải là một trong: plastic, paper, metal, glass, battery, electronic, organic, container, snackPackaging, residual, unknown.',
                'Không đoán chất liệu nếu hình ảnh không cho thấy rõ. Chai/cốc chưa rõ chất liệu dùng container. Vỏ bánh/kẹo hoặc túi snack nhiều lớp dùng snackPackaging.',
                'Nếu ảnh không đủ rõ hoặc không xác định được vật thể chính, dùng unknown. Confidence là số từ 0 đến 1.',
                'objectName và materialNote phải ngắn gọn bằng tiếng Việt; materialNote có thể là chuỗi rỗng.'
              ].join(' ')
            },
            {
              type: 'image_url',
              image_url: { url: body.image, detail: 'high' }
            }
          ]
        }]
      }),
      signal: controller.signal
    });

    if (!providerResponse.ok) {
      sendJson(response, 502, { code: 'VISION_PROVIDER_ERROR', error: 'Dịch vụ AI không xử lý được ảnh. Hãy thử lại hoặc dùng phân loại thủ công.' });
      return;
    }

    const providerData = await providerResponse.json();
    const content = providerData.choices?.[0]?.message?.content;
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      sendJson(response, 502, { code: 'INVALID_VISION_RESPONSE', error: 'AI trả về kết quả không hợp lệ. Hãy thử lại.' });
      return;
    }
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      sendJson(response, 502, { code: 'INVALID_VISION_RESPONSE', error: 'AI trả về kết quả không hợp lệ. Hãy thử lại.' });
      return;
    }

    const allowedWasteTypes = new Set([
      'plastic', 'paper', 'metal', 'glass', 'battery', 'electronic',
      'organic', 'container', 'snackPackaging', 'residual', 'unknown'
    ]);
    const confidence = Number(result.confidence);
    if (!allowedWasteTypes.has(result.wasteType)
      || !Number.isFinite(confidence)
      || confidence < 0
      || confidence > 1) {
      sendJson(response, 502, { code: 'INVALID_VISION_RESPONSE', error: 'AI trả về kết quả phân loại không hợp lệ. Hãy thử lại.' });
      return;
    }

    sendJson(response, 200, {
      provider: 'OpenAI',
      classification: {
        wasteType: result.wasteType,
        objectName: typeof result.objectName === 'string' ? result.objectName.slice(0, 100) : '',
        confidence,
        materialNote: typeof result.materialNote === 'string' ? result.materialNote.slice(0, 200) : ''
      }
    });
  } catch {
    sendJson(response, 502, { code: 'VISION_UNAVAILABLE', error: 'Không kết nối được dịch vụ AI. Hãy thử lại hoặc dùng mô hình trên thiết bị.' });
  } finally {
    clearTimeout(timeout);
  }
}

function calculateDistanceMeters(first, second) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const arc = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(first.latitude)) * Math.cos(radians(second.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function mapPlace(place, origin) {
  const currentHours = place.currentOpeningHours || {};
  const regularHours = place.regularOpeningHours || {};
  let operationalStatus = 'unknown';
  if (place.businessStatus === 'CLOSED_PERMANENTLY') operationalStatus = 'inactive';
  else if (place.businessStatus === 'CLOSED_TEMPORARILY') operationalStatus = 'closed';
  else if (currentHours.openNow === true) operationalStatus = 'open';
  else if (currentHours.openNow === false) operationalStatus = 'closed';

  return {
    id: place.id || '',
    name: place.displayName?.text || 'Điểm thu gom / tái chế',
    address: place.formattedAddress || '',
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    distance: place.location
      ? calculateDistanceMeters(origin, place.location)
      : null,
    businessStatus: place.businessStatus || 'UNKNOWN',
    operationalStatus,
    openNow: typeof currentHours.openNow === 'boolean' ? currentHours.openNow : null,
    nextOpenTime: currentHours.nextOpenTime || '',
    nextCloseTime: currentHours.nextCloseTime || '',
    openingHours: currentHours.weekdayDescriptions || regularHours.weekdayDescriptions || [],
    phone: place.nationalPhoneNumber || '',
    website: place.websiteUri || '',
    mapsUrl: place.googleMapsUri || '',
    types: place.types || [],
    provider: 'Google Places',
    acceptanceConfirmed: false
  };
}

async function searchBatteryPlaces(request, response) {
  if (isRateLimited(request)) {
    sendJson(response, 429, { error: 'Quá nhiều lượt tìm kiếm. Vui lòng thử lại sau ít phút.' });
    return;
  }
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    sendJson(response, 503, { code: 'GOOGLE_PLACES_NOT_CONFIGURED', error: 'Google Places API chưa được cấu hình.' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: 'Dữ liệu tìm kiếm không hợp lệ.' });
    return;
  }

  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const radius = Math.min(50000, Math.max(500, Number(body.radius) || 5000));
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
    || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    sendJson(response, 400, { error: 'Cần tọa độ hợp lệ để tìm quanh vị trí.' });
    return;
  }

  const area = String(body.area || '').trim().slice(0, 100);
  const textQuery = area
    ? `cửa hàng điện thoại máy tính linh kiện điện tử, sửa điện tử, sửa xe máy và sửa ô tô gần ${area}`
    : 'cửa hàng điện thoại máy tính linh kiện điện tử, sửa điện tử, sửa xe máy và sửa ô tô gần vị trí này';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const googleResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.businessStatus',
          'places.currentOpeningHours.openNow',
          'places.currentOpeningHours.nextOpenTime',
          'places.currentOpeningHours.nextCloseTime',
          'places.currentOpeningHours.weekdayDescriptions',
          'places.regularOpeningHours.weekdayDescriptions',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.googleMapsUri',
          'places.types'
        ].join(',')
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'vi',
        regionCode: 'VN',
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude, longitude },
            radius
          }
        }
      }),
      signal: controller.signal
    });

    if (!googleResponse.ok) {
      const statusCode = googleResponse.status === 403 ? 502 : 502;
      sendJson(response, statusCode, { error: 'Google Places chưa thể trả kết quả. Kiểm tra API, billing và giới hạn key.' });
      return;
    }

    const data = await googleResponse.json();
    const origin = { latitude, longitude };
    const places = (data.places || [])
      .map((place) => mapPlace(place, origin))
      .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng))
      .filter((place) => place.distance <= radius)
      .sort((first, second) => (first.distance ?? Infinity) - (second.distance ?? Infinity));
    sendJson(response, 200, { source: 'Google Places', fetchedAt: new Date().toISOString(), places });
  } catch {
    sendJson(response, 502, { error: 'Không kết nối được Google Places. Hãy thử lại sau.' });
  } finally {
    clearTimeout(timeout);
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (requestUrl.pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, {
      ok: true,
      googlePlacesConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      visionConfigured: Boolean(process.env.OPENAI_API_KEY)
    });
    return;
  }
  if (requestUrl.pathname === '/api/places/batteries' && request.method === 'POST') {
    await searchBatteryPlaces(request, response);
    return;
  }
  if (requestUrl.pathname === '/api/classify-waste' && request.method === 'POST') {
    await classifyWasteImage(request, response);
    return;
  }
  if (requestUrl.pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'Không tìm thấy API.' });
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { error: 'Phương thức không được hỗ trợ.' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    sendJson(response, 400, { error: 'Đường dẫn không hợp lệ.' });
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(`${root}${path.sep}`) || !contentTypes[path.extname(filePath).toLowerCase()]) {
    sendJson(response, 404, { error: 'Không tìm thấy tệp.' });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()],
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  });
});

server.listen(port, host, () => {
  console.log(`GreenSpace running at http://${host}:${port}`);
});
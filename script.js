const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const mascotText = document.getElementById('mascotText');
const mascotButtons = document.querySelectorAll('[data-greet]');
const chatWidget = document.getElementById('chatWidget');
if (document.body.dataset.page === 'home' && chatWidget) chatWidget.classList.add('is-closed');
const openChatBtn = document.getElementById('openChatBtn');
const minimizeChatBtn = document.getElementById('minimizeChatBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const wasteImageInput = document.getElementById('wasteImageInput');
const wastePreview = document.getElementById('wastePreview');
const scanPlaceholder = document.getElementById('scanPlaceholder');
const analyzeWasteBtn = document.getElementById('analyzeWasteBtn');
const visionConsent = document.getElementById('visionConsent');
const wasteTypeSelect = document.getElementById('wasteTypeSelect');
const manualClassifyBtn = document.getElementById('manualClassifyBtn');
const scanResult = document.getElementById('scanResult');
const radarMapElement = document.getElementById('radarMap');
const radarStatus = document.getElementById('radarStatus');
const radarResults = document.getElementById('radarResults');
const radarRadius = document.getElementById('radarRadius');
const radiusValue = document.getElementById('radiusValue');
const locateMeBtn = document.getElementById('locateMeBtn');
const refreshPlacesBtn = document.getElementById('refreshPlacesBtn');
const batteryStatus = document.getElementById('batteryStatus');
const batteryPointsList = document.getElementById('batteryPoints');
const batteryUpdated = document.getElementById('batteryUpdated');
const refreshBatteryPointsBtn = document.getElementById('refreshBatteryPoints');
const batteryRadius = document.getElementById('batteryRadius');
const batteryRadiusValue = document.getElementById('batteryRadiusValue');
const batterySearchForm = document.getElementById('batterySearchForm');
const batteryAreaInput = document.getElementById('batteryAreaInput');
const batterySearchButton = document.getElementById('batterySearchButton');
const bikeRoutesList = document.getElementById('bikeRoutes');
const useNearestRental = document.getElementById('useNearestRental');
const chatWelcomeMessage = chatMessages?.querySelector('.message.bot');
if (chatWelcomeMessage) {
  chatWelcomeMessage.textContent = 'Chào bạn! Mình là Greenie, trợ lý của Green Space. Mình có thể giới thiệu website, hướng dẫn tìm công viên, phân loại rác, tìm nơi thu gom hoặc tra cứu xe đạp. Bạn cần mình giúp gì?';
}

function addMapsServiceStrip() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const strip = document.createElement('aside');
  strip.className = 'maps-service-strip';
  strip.setAttribute('aria-label', 'Green Space sử dụng Google Maps cho tìm kiếm và chỉ đường');

  const content = document.createElement('div');
  content.className = 'container maps-service-inner';

  const brand = document.createElement('div');
  brand.className = 'maps-service-brand';
  const icon = document.createElement('span');
  icon.className = 'maps-service-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '↗';
  const brandText = document.createElement('span');
  brandText.className = 'maps-service-brand-text';
  const label = document.createElement('small');
  label.textContent = 'TÌM KIẾM & CHỈ ĐƯỜNG';
  const name = document.createElement('strong');
  name.textContent = 'Google Maps';
  brandText.append(label, name);
  brand.append(icon, brandText);

  const description = document.createElement('p');
  description.className = 'maps-service-description';
  description.textContent = 'Mở nhanh địa điểm và lộ trình từ Green Space bằng Google Maps.';

  const action = document.createElement('a');
  action.className = 'maps-service-action';
  action.href = 'https://www.google.com/maps/search/?api=1&query=địa điểm xanh Quận 1 Quận 3 Thành phố Hồ Chí Minh';
  action.target = '_blank';
  action.rel = 'noopener noreferrer';
  action.textContent = 'Mở Google Maps';
  action.setAttribute('aria-label', 'Mở tìm kiếm Green Space trên Google Maps trong tab mới');

  content.append(brand, description, action);
  strip.append(content);
  topbar.insertAdjacentElement('afterend', strip);
}

addMapsServiceStrip();

const responses = {
  park: 'Quận 1 có Công viên Tao Đàn rất đẹp cho buổi dạo bộ, còn Quận 3 thì Vườn hoa Lê Văn Tám rất phù hợp cho không gian thư giãn, đọc sách và đi cùng gia đình.',
  pin: 'Mình chưa thể xác nhận điểm nào đang nhận pin trực tiếp. Hãy mở mục “Điểm thu gom pin”, bật định vị để xem dữ liệu bản đồ mới nhất và kiểm tra với điểm nhận trước khi đi nhé.',
  bike: 'Hệ thống xe đạp công cộng được bố trí theo tuyến xanh, ít giao thông và nhiều cây xanh, rất phù hợp cho di chuyển ngắn trong khu vực Quận 1 và Quận 3.',
  default: 'Mình có thể gợi ý các công viên xanh, điểm thu gom pin và tuyến xe đạp gần bạn. Hãy hỏi: “Công viên nào đẹp?”, “Thu gom pin ở đâu?” hoặc “Xe đạp gần đây?”'
};

const wasteTypes = {
  plastic: {
    name: 'Nhựa',
    destination: 'Thùng tái chế',
    advice: 'Làm sạch, để ráo và phân loại riêng trước khi bỏ vào thùng tái chế.'
  },
  container: {
    name: 'Chai/cốc — cần xác nhận chất liệu',
    destination: 'Điểm thu hồi phù hợp với ký hiệu vật liệu',
    advice: 'Mô hình chỉ nhận diện hình dáng, không biết chai/cốc là nhựa, thủy tinh hay vật liệu khác. Kiểm tra ký hiệu trên sản phẩm và hướng dẫn phân loại tại địa phương trước khi bỏ vào thùng tái chế.'
  },
  snackPackaging: {
    name: 'Vỏ bánh/kẹo, bao bì snack',
    destination: 'Rác còn lại nếu là túi màng ghép không có điểm thu hồi riêng',
    advice: 'Làm sạch vụn thức ăn và để khô. Bao bì snack thường làm từ nhiều lớp vật liệu nên không tái chế chung như chai nhựa; kiểm tra hướng dẫn địa phương hoặc điểm thu hồi bao bì màng ghép.'
  },
  paper: {
    name: 'Giấy',
    destination: 'Thùng giấy tái chế',
    advice: 'Giữ giấy khô, gấp gọn; giấy dính dầu mỡ nên bỏ vào rác còn lại.'
  },
  metal: {
    name: 'Kim loại',
    destination: 'Thùng tái chế',
    advice: 'Làm sạch lon/vật dụng và bỏ vào điểm thu gom tái chế phù hợp.'
  },
  glass: {
    name: 'Thủy tinh',
    destination: 'Điểm thu gom thủy tinh',
    advice: 'Bọc kín nếu bị vỡ và không bỏ chung với rác tái chế dễ gây thương tích.'
  },
  battery: {
    name: 'Pin',
    destination: 'Điểm thu gom pin chuyên dụng',
    advice: 'Không bỏ pin vào rác sinh hoạt. Hãy mang đến điểm thu gom pin.',
    link: '#recycling'
  },
  electronic: {
    name: 'Rác điện tử',
    destination: 'Điểm thu gom rác điện tử',
    advice: 'Không bỏ vào thùng rác thường; giữ riêng và tìm đơn vị thu gom chuyên dụng.'
  },
  organic: {
    name: 'Rác hữu cơ',
    destination: 'Thùng rác hữu cơ/ủ compost',
    advice: 'Tách riêng thức ăn thừa và rác nhà bếp để ủ compost nếu có điều kiện.'
  },
  residual: {
    name: 'Rác còn lại',
    destination: 'Thùng rác sinh hoạt',
    advice: 'Đóng gói gọn và bỏ đúng thùng rác sinh hoạt tại nơi bạn ở.'
  }
};

const bikeRouteCatalog = {
  '1': [
    {
      name: 'Vòng công viên và bờ sông',
      start: 'Công viên Tao Đàn, Quận 1, Thành phố Hồ Chí Minh',
      startPoint: { lat: 10.7737, lng: 106.6920 },
      stops: [
        'Dinh Độc Lập, Quận 1, Thành phố Hồ Chí Minh',
        'Bến Bạch Đằng, Quận 1, Thành phố Hồ Chí Minh',
        'Công trường Mê Linh, Quận 1, Thành phố Hồ Chí Minh'
      ],
      description: 'Vòng trung tâm qua mảng xanh và khu vực ven sông.'
    },
    {
      name: 'Vòng di sản trung tâm',
      start: 'Dinh Độc Lập, Quận 1, Thành phố Hồ Chí Minh',
      startPoint: { lat: 10.7770, lng: 106.6953 },
      stops: [
        'Công viên Tao Đàn, Quận 1, Thành phố Hồ Chí Minh',
        'Bưu điện Trung tâm Sài Gòn, Quận 1, Thành phố Hồ Chí Minh',
        'Nhà hát Thành phố Hồ Chí Minh, Quận 1, Thành phố Hồ Chí Minh'
      ],
      description: 'Các điểm tham quan gần nhau, phù hợp một chuyến đi ngắn.'
    }
  ],
  '3': [
    {
      name: 'Vòng hồ Con Rùa và công viên',
      start: 'Công viên Lê Văn Tám, Quận 3, Thành phố Hồ Chí Minh',
      startPoint: { lat: 10.7886, lng: 106.6917 },
      stops: [
        'Hồ Con Rùa, Quận 3, Thành phố Hồ Chí Minh',
        'Công viên Tao Đàn, Quận 1, Thành phố Hồ Chí Minh',
        'Công viên Lê Văn Tám, Quận 3, Thành phố Hồ Chí Minh'
      ],
      description: 'Kết nối hai công viên với một điểm dừng nổi bật ở Quận 3.'
    },
    {
      name: 'Vòng Tân Định',
      start: 'Công viên Lê Văn Tám, Quận 3, Thành phố Hồ Chí Minh',
      startPoint: { lat: 10.7886, lng: 106.6917 },
      stops: [
        'Chợ Tân Định, Quận 3, Thành phố Hồ Chí Minh',
        'Nhà thờ Tân Định, Quận 3, Thành phố Hồ Chí Minh',
        'Hồ Con Rùa, Quận 3, Thành phố Hồ Chí Minh'
      ],
      description: 'Một vòng qua các điểm quen thuộc quanh khu Tân Định.'
    }
  ]
};

let selectedBikeRouteDistrict = '1';

let radarPlaces = [];
let userOrigin = null;
let originLabel = 'vị trí hiện tại của bạn';
let locationOutsideArea = false;
let selectedMode = document.body.dataset.defaultMode || 'walk';
let selectedRadius = Number(radarRadius?.value || batteryRadius?.value || 2000);
let placesRequestFailed = false;
let placesSearchTimer;
let radarMap;
let radarPlaceLayer;
let radarRadiusCircle;
let radarOriginMarker;
let radarTileLayer;
let radarUsingFallbackTiles = false;
let detectorPromise;
let currentImageUrl;
let radarRequestId = 0;
let placesRequestId = 0;
let batteryRequestId = 0;
let batteryManualSearchId = 0;
let batteryRefreshTimer;
let batteryStatusTimer;
let currentBatteryPoints = [];
let lastNominatimRequest = 0;
let radarDataSource = 'Overpass';
let radarDataTimestamp = '';
const nominatimCache = new Map();
const routeDistanceCache = new Map();

function showWasteResult(type, source = '') {
  const waste = wasteTypes[type];
  if (!waste) return;

  scanResult.className = 'scan-result is-success';
  scanResult.replaceChildren();

  const title = document.createElement('strong');
  title.textContent = `${source ? `${source}: ` : ''}${waste.name} → ${waste.destination}`;
  const advice = document.createElement('span');
  advice.textContent = ` ${waste.advice}${source ? ' AI chỉ đưa ra gợi ý; hãy xác nhận chất liệu trước khi phân loại.' : ''}`;
  scanResult.append(title, advice);

  if (waste.link) {
    const link = document.createElement('a');
    link.href = waste.link;
    link.textContent = ' Xem điểm thu gom';
    scanResult.append(link);
  }
}

function loadExternalScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Không thể tải thư viện nhận diện ảnh.'));
    document.head.append(script);
  });
}

function getWasteDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      await loadExternalScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
      await loadExternalScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
      await window.tf.ready();
      return window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
    })().catch((error) => {
      detectorPromise = null;
      throw error;
    });
  }

  return detectorPromise;
}

function classifyDetectedObject(className) {
  const name = className.toLowerCase();
  if (name === 'wine glass') return 'glass';
  if (['bottle', 'cup'].includes(name)) return 'container';
  if (name === 'book') return 'paper';
  if (['banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake'].includes(name)) return 'organic';
  if ([
    'cell phone', 'laptop', 'keyboard', 'mouse', 'remote', 'tv',
    'microwave', 'oven', 'toaster', 'refrigerator', 'hair drier'
  ].includes(name)) return 'electronic';
  return null;
}

function prepareWasteImageForUpload() {
  const maxDimension = 1280;
  const scale = Math.min(1, maxDimension / Math.max(wastePreview.naturalWidth, wastePreview.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(wastePreview.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(wastePreview.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không thể chuẩn bị ảnh để gửi nhận diện.');
  context.drawImage(wastePreview, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

async function classifyWasteImageOnline() {
  const image = prepareWasteImageForUpload();
  const response = await fetch('/api/classify-waste', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'AI trực tuyến chưa thể phân tích ảnh.');
  }
  if (!data.classification || typeof data.classification.wasteType !== 'string') {
    throw new Error('AI trực tuyến trả về kết quả không hợp lệ.');
  }
  return data.classification;
}

function appendScanNote(message, className = '') {
  const note = document.createElement('p');
  if (className) note.className = className;
  note.textContent = message;
  scanResult.append(note);
}

function onWasteImageSelected() {
  const file = wasteImageInput.files[0];
  if (!file) return;
  wasteImageInput.value = '';
  if (!file.type.startsWith('image/')) {
    scanResult.className = 'scan-result is-warning';
    scanResult.textContent = 'Tệp này không phải định dạng ảnh được hỗ trợ. Hãy chụp ảnh mới hoặc chọn JPG/PNG/WebP.';
    analyzeWasteBtn.disabled = true;
    return;
  }

  if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
  currentImageUrl = URL.createObjectURL(file);
  const imageUrl = currentImageUrl;
  wastePreview.src = imageUrl;
  wastePreview.hidden = false;
  scanPlaceholder.hidden = true;
  scanResult.className = 'scan-result';
  scanResult.textContent = 'Đang tải ảnh…';
  analyzeWasteBtn.disabled = true;
  wastePreview.decode().then(() => {
    if (currentImageUrl !== imageUrl) return;
    analyzeWasteBtn.disabled = false;
    scanResult.textContent = 'Ảnh đã sẵn sàng. Chọn “Quét ảnh” để nhận diện vật thể.';
  }).catch(() => {
    if (currentImageUrl !== imageUrl) return;
    scanResult.className = 'scan-result is-warning';
    scanResult.textContent = 'Trình duyệt không đọc được ảnh này. Hãy thử chụp lại hoặc chọn ảnh JPG/PNG.';
  });
}

async function analyzeWasteImage() {
  if (!currentImageUrl || !wastePreview.naturalWidth) {
    scanResult.className = 'scan-result is-warning';
    scanResult.textContent = 'Chụp ảnh hoặc chọn ảnh hợp lệ trước khi quét.';
    return;
  }

  analyzeWasteBtn.disabled = true;
  analyzeWasteBtn.textContent = 'Đang quét…';
  scanResult.className = 'scan-result';
  scanResult.textContent = 'Đang chuẩn bị ảnh. Nếu AI trực tuyến đã được cấu hình, ảnh thu nhỏ sẽ được gửi qua máy chủ để phân tích.';

  let onlineFallbackReason = '';
  try {
    if (!visionConsent?.checked) {
      onlineFallbackReason = 'Chưa bật đồng ý gửi ảnh đến AI bên ngoài; đang dùng mô hình trên thiết bị.';
    } else if (location.protocol === 'file:') {
      onlineFallbackReason = 'AI trực tuyến yêu cầu mở website qua máy chủ cục bộ.';
    } else {
      scanResult.textContent = 'Đang gửi ảnh đã thu nhỏ đến AI trực tuyến để phân tích.';
      const classification = await classifyWasteImageOnline();
      if (classification.wasteType !== 'unknown' && wasteTypes[classification.wasteType]) {
        const confidence = Math.round(classification.confidence * 100);
        const objectName = classification.objectName?.trim();
        const source = `AI thị giác${objectName ? ` nhận diện ${objectName}` : ' phân loại'} (${confidence}%)`;
        showWasteResult(classification.wasteType, source);
        if (confidence < 60) scanResult.className = 'scan-result is-warning';
        if (classification.materialNote) appendScanNote(classification.materialNote);
        if (confidence < 60) appendScanNote('Độ tin cậy thấp; hãy kiểm tra lại vật liệu và xác nhận hướng dẫn trước khi bỏ rác.');
        return;
      }
      onlineFallbackReason = 'AI trực tuyến chưa xác định chắc chắn được loại rác.';
    }
  } catch (error) {
    onlineFallbackReason = error instanceof Error ? error.message : 'AI trực tuyến chưa thể phân tích ảnh.';
  }

  try {
    scanResult.className = 'scan-result';
    scanResult.replaceChildren();
    scanResult.textContent = 'AI trực tuyến chưa dùng được; đang thử mô hình nhận diện trên thiết bị.';
    const detector = await getWasteDetector();
    const predictions = await detector.detect(wastePreview);
    const detectedObjects = predictions
      .filter((prediction) => prediction.score >= 0.35)
      .sort((first, second) => second.score - first.score);
    const match = detectedObjects
      .map((prediction) => ({ ...prediction, wasteType: classifyDetectedObject(prediction.class) }))
      .find((prediction) => prediction.wasteType);

    if (match) {
      showWasteResult(match.wasteType, `Nhận diện ${match.class} (${Math.round(match.score * 100)}%)`);
      appendScanNote(`Kết quả từ mô hình trên thiết bị; chưa phải AI trực tuyến. ${onlineFallbackReason}`);
    } else {
      scanResult.className = 'scan-result is-warning';
      scanResult.replaceChildren();
      const message = document.createElement('p');
      const detectedSummary = detectedObjects.length
        ? ` Mô hình thấy ${detectedObjects.slice(0, 3).map((prediction) => `${prediction.class} (${Math.round(prediction.score * 100)}%)`).join(', ')} nhưng chưa thể xác định nhóm rác.`
        : ' Mô hình không nhận ra vật thể trong ảnh.';
      message.textContent = `${detectedSummary} Mô hình không nhận diện chắc chắn vỏ bánh/bao bì hoặc vật thể ngoài bộ nhãn của nó; hãy chọn loại bên dưới để xem hướng dẫn. ${onlineFallbackReason}`;
      const packagingButton = document.createElement('button');
      packagingButton.type = 'button';
      packagingButton.className = 'secondary-btn';
      packagingButton.textContent = 'Chọn vỏ bánh/bao bì snack';
      packagingButton.addEventListener('click', () => {
        wasteTypeSelect.value = 'snackPackaging';
        showWasteResult('snackPackaging', 'Bạn chọn');
      });
      scanResult.append(message, packagingButton);
    }
  } catch (error) {
    scanResult.className = 'scan-result is-warning';
    scanResult.textContent = `${onlineFallbackReason} ${error instanceof Error && error.message.includes('Không thể tải thư viện')
      ? 'Không tải được mô hình nhận diện trên thiết bị. Kiểm tra kết nối mạng rồi thử lại; hoặc chọn loại rác bên dưới.'
      : 'Cũng không thể quét ảnh trên thiết bị. Hãy thử ảnh JPG/PNG khác hoặc chọn loại rác bên dưới.'}`;
  } finally {
    analyzeWasteBtn.disabled = false;
    analyzeWasteBtn.textContent = 'Quét ảnh';
  }
}

function distanceInMeters(from, to) {
  const earthRadius = 6371000;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(to.lat - from.lat);
  const longitudeDelta = toRadians(to.lng - from.lng);
  const arc = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function formatDistance(meters) {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;
}

function directionsUrl(place) {
  const travelModes = { walk: 'walking', bike: 'bicycling', bus: 'transit' };
  const params = new URLSearchParams({
    api: '1',
    origin: `${userOrigin.lat},${userOrigin.lng}`,
    destination: `${place.lat},${place.lng}`,
    travelmode: travelModes[selectedMode]
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function costingForMode(mode) {
  return mode === 'bike' ? 'bicycle' : 'pedestrian';
}

async function getRoutedDistance(place) {
  const costing = costingForMode(selectedMode);
  const cacheKey = `${costing}:${userOrigin.lat},${userOrigin.lng}:${place.lat},${place.lng}`;
  if (routeDistanceCache.has(cacheKey)) return routeDistanceCache.get(cacheKey);

  let result;
  let timeout;
  try {
    const route = {
      locations: [
        { lat: userOrigin.lat, lon: userOrigin.lng },
        { lat: place.lat, lon: place.lng }
      ],
      costing,
      units: 'kilometers'
    };
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(route))}`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Routing service is unavailable.');
    const data = await response.json();
    const summary = data.trip?.legs?.[0]?.summary;
    if (!summary || !Number.isFinite(summary.length)) throw new Error('No route found.');
    result = { meters: summary.length * 1000, seconds: summary.time, estimated: false };
  } catch {
    const straightLine = distanceInMeters(userOrigin, place);
    result = { meters: straightLine * 1.25, seconds: null, estimated: true };
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  routeDistanceCache.set(cacheKey, result);
  return result;
}

async function renderRadarResults() {
  const requestId = ++radarRequestId;
  if (!radarResults || !radarStatus) return;
  if (!userOrigin) {
    radarResults.replaceChildren();
    radarStatus.textContent = 'Hãy cho phép định vị để tìm địa điểm quanh bạn.';
    return;
  }

  const modePlaces = radarPlaces
    .filter((place) => place.type === selectedMode)
    .map((place) => ({ ...place, directDistance: distanceInMeters(userOrigin, place) }))
    .filter((place) => place.directDistance <= selectedRadius * 1.7)
    .sort((first, second) => first.directDistance - second.directDistance)
    .slice(0, 12);

  radarResults.replaceChildren();
  if (radarPlaceLayer) radarPlaceLayer.clearLayers();

  if (modePlaces.length) {
    radarStatus.textContent = 'Đang tính quãng đường theo mạng lưới đường…';
  }

  const nearbyPlaces = (await Promise.all(modePlaces.map(async (place) => ({
    ...place,
    route: await getRoutedDistance(place)
  })))).filter((place) => place.route.meters <= selectedRadius)
    .sort((first, second) => first.route.meters - second.route.meters);

  if (requestId !== radarRequestId) return;

  nearbyPlaces.forEach((place) => {
    if (radarPlaceLayer) {
      const popup = document.createElement('strong');
      popup.textContent = place.name;
      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: 'radar-pin',
          html: `<span>${place.icon}</span>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        })
      }).bindPopup(popup);
      radarPlaceLayer.addLayer(marker);
    }

    const item = document.createElement('li');
    item.className = 'radar-result';
    const icon = document.createElement('span');
    icon.className = 'radar-result-icon';
    icon.textContent = place.icon;
    const copy = document.createElement('span');
    copy.className = 'radar-result-copy';
    const name = document.createElement('strong');
    name.textContent = place.name;
    const distance = document.createElement('small');
    const travelLabel = selectedMode === 'bike' ? 'Đạp xe' : selectedMode === 'bus' ? 'Đi bộ đến trạm' : 'Đi bộ';
    const routeTime = place.route.seconds ? ` · ${Math.max(1, Math.round(place.route.seconds / 60))} phút` : '';
    const estimateNote = place.route.estimated ? ' · ước tính' : '';
    distance.textContent = `${travelLabel} ${formatDistance(place.route.meters)}${routeTime}${estimateNote}`;
    const kind = document.createElement('small');
    kind.className = 'radar-place-kind';
    kind.textContent = place.kind;
    const details = document.createElement('small');
    details.className = 'radar-place-details';
    const detailParts = [
      place.address || 'Chưa có địa chỉ trên OpenStreetMap',
      place.openingHours ? `Giờ mở cửa: ${place.openingHours}` : null,
      place.operator ? `Đơn vị: ${place.operator}` : null,
      place.phone ? `Điện thoại: ${place.phone}` : null,
      place.website ? `Website: ${place.website}` : null,
      place.updatedAt ? `OSM sửa: ${formatOsmTimestamp(place.updatedAt)}` : null
    ].filter(Boolean);
    details.textContent = detailParts.join(' · ');
    const directions = document.createElement('a');
    directions.href = directionsUrl(place);
    directions.target = '_blank';
    directions.rel = 'noopener noreferrer';
    directions.textContent = 'Chỉ đường';
    copy.append(name, kind, distance, details);
    item.append(icon, copy, directions);
    radarResults.append(item);
  });

  if (nearbyPlaces.length) {
    const areaNote = locationOutsideArea ? ' Vị trí của bạn ngoài Quận 1/3; kết quả lấy quanh vị trí hiện tại.' : '';
    const sourceNote = radarDataSource.includes('Nominatim')
      ? ` Nguồn ${radarDataSource}; kết quả có thể lưu cache tối đa 15 phút, không có timestamp đồng bộ.`
      : ` Dữ liệu OSM đồng bộ${radarDataTimestamp ? ` ${formatOsmTimestamp(radarDataTimestamp)}` : ' (không có timestamp)'}; không xác nhận trạm đang hoạt động hoặc còn xe.`;
    radarStatus.textContent = `Tìm thấy ${nearbyPlaces.length} gợi ý quanh ${originLabel} theo quãng đường tuyến trong bán kính ${formatDistance(selectedRadius)}.${sourceNote}${areaNote}`;
  } else {
    const serviceNote = placesRequestFailed ? ' Dịch vụ tìm địa điểm không phản hồi; chưa thể xác minh kết quả.' : '';
    const areaNote = locationOutsideArea ? ' Vị trí của bạn ngoài Quận 1/3; vẫn đang tìm quanh vị trí hiện tại.' : '';
    const radiusNote = selectedRadius < 20000 ? ' Thử tăng bán kính tìm kiếm.' : '';
    const noRouteNote = modePlaces.length ? ' Có điểm trên bản đồ nhưng chưa xác định được tuyến đường phù hợp.' : '';
    const sourceNote = !placesRequestFailed
      ? radarDataSource.includes('Nominatim')
        ? ` Nguồn ${radarDataSource}; có thể lưu cache tối đa 15 phút và không có timestamp đồng bộ.`
        : ` Nguồn OpenStreetMap${radarDataTimestamp ? ` · đồng bộ ${formatOsmTimestamp(radarDataTimestamp)}` : ''}.`
      : '';
    radarStatus.textContent = `Chưa tìm thấy gợi ý${modePlaces.length ? '' : ` được ghi nhận`} quanh ${originLabel} trong bán kính ${formatDistance(selectedRadius)}.${radiusNote}${noRouteNote}${serviceNote}${sourceNote}${areaNote}`;

    const empty = document.createElement('li');
    empty.className = 'radar-empty';
    const message = document.createElement('p');
    message.textContent = placesRequestFailed
      ? 'Hiện chưa kết nối được dịch vụ bản đồ, nên chưa thể xác nhận có trạm gần bạn hay không.'
      : modePlaces.length
        ? 'Có địa điểm được ghi nhận gần đây nhưng chưa tính được tuyến đường đến đó.'
        : `OpenStreetMap chưa ghi nhận ${selectedMode === 'bike' ? 'trạm thuê hoặc bãi đỗ xe đạp' : selectedMode === 'bus' ? 'trạm xe buýt' : 'công viên'} trong phạm vi này. Điều đó không khẳng định ngoài thực tế không có địa điểm; dữ liệu không cho biết trạm xe đạp còn xe hay đang hoạt động.`;
    const actions = document.createElement('div');
    actions.className = 'radar-empty-actions';
    const mapsSearch = document.createElement('a');
    const searchTerm = selectedMode === 'bike' ? 'trạm xe đạp công cộng' : selectedMode === 'bus' ? 'trạm xe buýt' : 'công viên';
    const mapsQuery = `${searchTerm} gần ${userOrigin.lat},${userOrigin.lng}`;
    mapsSearch.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
    mapsSearch.target = '_blank';
    mapsSearch.rel = 'noopener noreferrer';
    mapsSearch.textContent = 'Tìm thêm trên Google Maps';
    actions.append(mapsSearch);
    if (selectedRadius < 20000 && radarRadius) {
      const expandSearch = document.createElement('button');
      expandSearch.type = 'button';
      expandSearch.textContent = 'Tìm trong bán kính 20 km';
      expandSearch.addEventListener('click', () => {
        radarRadius.value = radarRadius.max;
        updateRadius(radarRadius.value);
      });
      actions.append(expandSearch);
    }
    empty.append(message, actions);
    radarResults.append(empty);
  }
}

function getBikeRouteStart(route) {
  if (!useNearestRental?.checked) return { value: route.start, label: route.start };

  const nearestRental = radarPlaces
    .filter((place) => place.type === 'bike' && place.kind === 'Trạm xe đạp công cộng')
    .sort((first, second) =>
      distanceInMeters(route.startPoint, first) - distanceInMeters(route.startPoint, second)
    )[0];

  if (!nearestRental) return { value: route.start, label: route.start };
  return {
    value: `${nearestRental.lat},${nearestRental.lng}`,
    label: nearestRental.name
  };
}

function getBikeTourUrl(route, start) {
  const params = new URLSearchParams({
    api: '1',
    origin: start.value,
    destination: start.value,
    waypoints: route.stops.join('|'),
    travelmode: 'bicycling'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function renderBikeRoutes() {
  if (!bikeRoutesList) return;
  bikeRoutesList.replaceChildren();

  (bikeRouteCatalog[selectedBikeRouteDistrict] || []).forEach((route) => {
    const start = getBikeRouteStart(route);
    const card = document.createElement('article');
    card.className = 'bike-route-card';

    const heading = document.createElement('div');
    heading.className = 'bike-route-card-heading';
    const title = document.createElement('h3');
    title.textContent = route.name;
    const stopCount = document.createElement('span');
    stopCount.className = 'bike-route-stop-count';
    stopCount.textContent = `${route.stops.length} điểm dừng`;
    heading.append(title, stopCount);

    const description = document.createElement('p');
    description.className = 'bike-route-description';
    description.textContent = route.description;

    const startLabel = document.createElement('p');
    startLabel.className = 'bike-route-start';
    startLabel.textContent = `Xuất phát và kết thúc: ${start.label}`;

    const stops = document.createElement('ol');
    stops.className = 'bike-route-stops';
    route.stops.forEach((stop) => {
      const item = document.createElement('li');
      item.textContent = stop.split(',')[0];
      stops.append(item);
    });

    const link = document.createElement('a');
    link.className = 'bike-route-link';
    link.href = getBikeTourUrl(route, start);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Mở lộ trình xe đạp';

    card.append(heading, description, startLabel, stops, link);
    bikeRoutesList.append(card);
  });
}

function placeTypeFromTags(tags) {
  if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.landuse === 'recreation_ground') return 'walk';
  if (tags.amenity === 'bicycle_rental' || tags.amenity === 'bicycle_parking'
    || ['yes', 'designated'].includes(tags.bicycle_rental)
    || tags['rental:bicycle'] === 'yes'
    || tags['service:bicycle:rental'] === 'yes') return 'bike';
  if (tags.highway === 'bus_stop' || tags.amenity === 'bus_station' || (tags.public_transport === 'platform' && tags.bus === 'yes')) return 'bus';
  return null;
}

function formatOsmTimestamp(timestamp) {
  if (!timestamp) return 'Thời điểm cập nhật không có trong dữ liệu';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Thời điểm cập nhật không có trong dữ liệu';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function formatOsmAddress(tags) {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  return [street, tags['addr:suburb'], tags['addr:city']].filter(Boolean).join(', ')
    || tags['addr:full']
    || '';
}

function buildNearbyQuery(radius, lat, lon, mode) {
  const around = `(around:${radius},${lat},${lon})`;
  const selectors = {
    walk: [
      `node${around}["leisure"~"^(park|garden)$"]`,
      `way${around}["leisure"~"^(park|garden)$"]`,
      `relation${around}["leisure"~"^(park|garden)$"]`,
      `way${around}["landuse"="recreation_ground"]`
    ],
    bike: [
      `nwr${around}["amenity"~"^(bicycle_rental|bicycle_parking)$"]`,
      `nwr${around}["bicycle_rental"~"^(yes|designated)$"]`,
      `nwr${around}["rental:bicycle"="yes"]`,
      `nwr${around}["service:bicycle:rental"="yes"]`
    ],
    bus: [
      `node${around}["highway"="bus_stop"]`,
      `node${around}["amenity"="bus_station"]`,
      `way${around}["amenity"="bus_station"]`,
      `node${around}["public_transport"="platform"]["bus"="yes"]`
    ]
  };

  return `[out:json][timeout:25];(${selectors[mode].join(';')};);out center meta;`;
}

async function loadNominatimPlaces(mode, radius, lat, lon) {
  const cacheKey = `${mode}:v2:${radius}:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = nominatimCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) return cached.places;

  const waitMs = Math.max(0, 1100 - (Date.now() - lastNominatimRequest));
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastNominatimRequest = Date.now();

  const latitudeDelta = radius / 111320;
  const longitudeDelta = radius / (111320 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: { walk: 'park', bike: 'bicycle rental', bus: 'bus stop' }[mode],
    limit: '20',
    viewbox: `${lon - longitudeDelta},${lat + latitudeDelta},${lon + longitudeDelta},${lat - latitudeDelta}`,
    bounded: '1',
    addressdetails: '1',
    extratags: '1'
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let data;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}.`);
    data = await response.json();
  } finally {
    clearTimeout(timeout);
  }
  const allowedTypes = {
    walk: ['park', 'garden', 'recreation_ground'],
    bike: ['bicycle_rental', 'bicycle_parking'],
    bus: ['bus_stop', 'bus_station']
  }[mode];
  const places = data
    .filter((item) => allowedTypes.includes(item.type) && (item.name?.trim() || mode !== 'walk'))
    .map((item) => {
      const kind = mode === 'walk' ? 'Công viên' : mode === 'bike' ? 'Điểm xe đạp công cộng' : 'Trạm xe buýt';
      const mappedLocation = item.address?.road || item.display_name.split(',')[0];
      return {
        name: item.name?.trim() || `${kind} · ${mappedLocation}`,
        type: mode,
        kind,
        icon: mode === 'walk' ? '🌳' : mode === 'bike' ? '🚲' : '🚌',
        lat: Number(item.lat),
        lng: Number(item.lon),
        address: item.display_name,
        openingHours: item.extratags?.opening_hours || '',
        operator: item.extratags?.operator || '',
        phone: item.extratags?.phone || '',
        website: item.extratags?.website || '',
        updatedAt: ''
      };
    }).filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));
  const uniquePlaces = [...new Map(places.map((place) => [
    `${place.type}:${place.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}`,
    place
  ])).values()];
  nominatimCache.set(cacheKey, { timestamp: Date.now(), places: uniquePlaces });
  return uniquePlaces;
}

async function fetchOverpass(query) {
  const endpoints = [
    'https://overpass.osm.ch/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter'
  ];
  let lastError;

  for (let index = 0; index < endpoints.length; index += 2) {
    const controllers = endpoints.slice(index, index + 2).map(() => new AbortController());
    const requests = endpoints.slice(index, index + 2).map(async (endpoint, endpointIndex) => {
      const controller = controllers[endpointIndex];
      const timeout = setTimeout(() => controller.abort(), 7000);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Overpass returned ${response.status}.`);
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    });

    try {
      return await Promise.any(requests);
    } catch (error) {
      lastError = error;
    } finally {
      controllers.forEach((controller) => controller.abort());
    }
  }

  throw lastError || new Error('No Overpass endpoint responded.');
}

async function loadNearbyPlaces() {
  if (!userOrigin || !radarStatus || !radarResults) return;

  const requestId = ++placesRequestId;
  const radius = Math.min(20000, Math.max(1000, selectedRadius));
  const lat = userOrigin.lat;
  const lon = userOrigin.lng;
  const mode = selectedMode;
  const query = buildNearbyQuery(radius, lat, lon, mode);

  radarStatus.textContent = `Đang tìm địa điểm quanh ${originLabel}…`;
  radarResults.replaceChildren();
  if (radarPlaceLayer) radarPlaceLayer.clearLayers();
  try {
    const data = await fetchOverpass(query);
    if (requestId !== placesRequestId) return;
    const livePlaces = data.elements.map((element) => {
      const tags = element.tags || {};
      const type = placeTypeFromTags(tags);
      const point = element.center || element;
      if (!type || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return null;
      const kind = type === 'walk'
        ? (tags.leisure === 'garden' ? 'Vườn công cộng' : 'Công viên')
        : type === 'bike'
          ? (tags.amenity === 'bicycle_parking' ? 'Bãi đỗ xe đạp'
            : 'Trạm xe đạp công cộng')
          : (tags.amenity === 'bus_station' ? 'Bến xe buýt' : 'Trạm xe buýt');
      return {
        name: tags.name || (type === 'walk' ? 'Công viên gần bạn' : type === 'bike' ? 'Điểm xe đạp công cộng' : 'Trạm xe buýt'),
        type,
        kind,
        icon: type === 'walk' ? '🌳' : type === 'bike' ? '🚲' : '🚌',
        lat: point.lat,
        lng: point.lon,
        address: formatOsmAddress(tags),
        openingHours: tags.opening_hours || '',
        operator: tags.operator || tags.network || '',
        phone: tags.phone || tags['contact:phone'] || '',
        website: tags.website || tags['contact:website'] || '',
        updatedAt: element.timestamp || ''
      };
    }).filter(Boolean);

    const uniquePlaces = [...new Map(livePlaces.map((place) => [
      `${place.type}:${place.name.toLowerCase()}:${place.lat.toFixed(5)}:${place.lng.toFixed(5)}`,
      place
    ])).values()]
      .sort((first, second) => distanceInMeters(userOrigin, first) - distanceInMeters(userOrigin, second))
      .slice(0, 40);

    radarPlaces = uniquePlaces;
    placesRequestFailed = false;
    if (mode === 'bike' && !radarPlaces.some((place) => place.type === 'bike')) {
      radarDataSource = 'Overpass + Nominatim';
      radarDataTimestamp = '';
      try {
        radarPlaces = await loadNominatimPlaces(mode, radius, lat, lon);
        if (requestId !== placesRequestId) return;
      } catch {
        placesRequestFailed = true;
        radarPlaces = [];
      }
    } else {
      radarDataSource = 'Overpass';
      radarDataTimestamp = data.osm3s?.timestamp_osm_base || '';
    }
    routeDistanceCache.clear();
  } catch {
    if (requestId === placesRequestId) {
      try {
        radarPlaces = await loadNominatimPlaces(mode, radius, lat, lon);
        if (requestId !== placesRequestId) return;
        radarDataSource = 'Nominatim';
        radarDataTimestamp = '';
        placesRequestFailed = false;
        routeDistanceCache.clear();
      } catch {
        if (requestId === placesRequestId) {
          placesRequestFailed = true;
          radarPlaces = [];
          radarDataTimestamp = '';
        }
      }
    }
  }

  if (requestId !== placesRequestId) return;
  if (bikeRoutesList) renderBikeRoutes();
  renderRadarResults();
}

function buildBatteryQuery(radius, lat, lon) {
  const around = `(around:${radius},${lat},${lon})`;
  const selectors = [
    `nwr${around}["amenity"~"^(recycling|waste_transfer_station|waste_disposal)$"]`,
    `nwr${around}["shop"~"^(scrap_yard|waste|mobile_phone|computer|electronics|computer_parts|car_parts|car_repair|motorcycle|motorcycle_repair|bicycle|bicycle_repair|repair|vehicle|tyres)$"]`,
    `nwr${around}["craft"~"^(electronics_repair|computer|mechanic|bicycle_repair)$"]`,
    `nwr${around}["name"~"(phone|mobile|laptop|computer|electronic|repair|mechanic|bicycle|motorcycle|điện thoại|máy tính|linh kiện|sửa|sửa xe|xe máy|xe đạp)",i]`,
    `nwr${around}["industrial"="scrap_yard"]`,
    `nwr${around}["recycling_type"="centre"]`
  ];
  return `[out:json][timeout:15];(${selectors.join(';')};);out center tags;`;
}

function batteryDirectionsUrl(place) {
  if (place.mapsUrl) return place.mapsUrl;
  const params = new URLSearchParams({
    api: '1',
    origin: `${userOrigin.lat},${userOrigin.lng}`,
    destination: `${place.lat},${place.lng}`,
    travelmode: 'walking'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function batterySearchUrl() {
  const area = batteryAreaInput?.value.trim();
  const query = area
    ? `cửa hàng điện thoại máy tính linh kiện, sửa chữa điện tử, sửa xe máy ô tô, bãi phế liệu gần ${area}`
    : userOrigin
      ? `cửa hàng điện thoại máy tính linh kiện, sửa chữa điện tử, sửa xe máy ô tô, bãi phế liệu gần ${userOrigin.lat},${userOrigin.lng}`
      : 'cửa hàng điện thoại máy tính linh kiện, sửa chữa điện tử, sửa xe máy ô tô, bãi phế liệu Quận 1 Quận 3 Thành phố Hồ Chí Minh';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getBatteryAcceptance(tags) {
  const batteryValues = [
    tags['recycling:batteries'],
    tags['disposal:batteries'],
    tags.disposal === 'batteries' ? 'yes' : '',
    tags.recycling === 'batteries' ? 'yes' : '',
    tags.waste === 'batteries' ? 'yes' : ''
  ].map((value) => String(value || '').toLowerCase()).filter(Boolean);

  if (batteryValues.some((value) => /^(yes|only|designated|collection)$/.test(value))) {
    return { confirmed: true, label: 'OSM có ghi nhận nhận pin' };
  }

  const electronicsValues = [
    tags['recycling:electrical_appliances'],
    tags['recycling:small_appliances'],
    tags['recycling:electronics']
  ].map((value) => String(value || '').toLowerCase());
  const recyclingValue = String(tags.recycling || '').toLowerCase();
  const searchableName = String(tags.name || tags.brand || tags.operator || '');
  const nameLooksLikeCandidate = /(phone|mobile|laptop|computer|electronic|repair|mechanic|bicycle|motorcycle|điện thoại|máy tính|linh kiện|sửa|sửa xe|xe máy|xe đạp)/i.test(searchableName);
  const shopLooksLikeCandidate = /^(scrap_yard|waste|mobile_phone|computer|electronics|computer_parts|car_parts|car_repair|motorcycle|motorcycle_repair|bicycle|bicycle_repair|repair|vehicle|tyres)$/.test(tags.shop || '');
  const electronicsShop = ['mobile_phone', 'computer', 'electronics', 'computer_parts'].includes(tags.shop)
    || (tags.shop === 'repair' && /^(computer|mobile_phone|electronics)$/.test(tags.repair || ''))
    || (tags.craft === 'electronics_repair')
    || (tags.shop === 'repair' && nameLooksLikeCandidate);
  const repairShop = ['car_repair', 'motorcycle_repair', 'repair'].includes(tags.shop)
    || /^(computer|mechanic|electronics_repair|bicycle_repair)$/.test(tags.craft || '')
    || nameLooksLikeCandidate
    || shopLooksLikeCandidate;
  const facilityLabel = electronicsShop || repairShop
    ? 'Cửa hàng/sửa chữa · cần hỏi có nhận pin'
    : tags.shop === 'scrap_yard' || tags.industrial === 'scrap_yard'
    ? 'Vựa phế liệu · cần xác nhận loại nhận'
    : tags.amenity === 'waste_transfer_station'
      ? 'Trạm trung chuyển rác · cần xác nhận loại nhận'
      : tags.amenity === 'waste_disposal'
        ? 'Điểm tập kết rác · cần xác nhận loại nhận'
        : 'Cơ sở tái chế · cần xác nhận loại nhận';
  const hasElectronicTags = electronicsValues.some((value) => /^(yes|only|designated)$/.test(value))
    || /electronic|electrical_appliances|small_appliances|scrap_metal|battery/.test(recyclingValue);
  const isCollectionFacility = tags.amenity === 'recycling'
    || tags.recycling_type === 'centre'
    || tags.amenity === 'waste_transfer_station'
    || tags.amenity === 'waste_disposal'
    || tags.shop === 'scrap_yard'
    || tags.shop === 'waste'
    || shopLooksLikeCandidate
    || ['car_parts', 'motorcycle', 'bicycle'].includes(tags.shop)
    || electronicsShop
    || repairShop
    || tags.industrial === 'scrap_yard'
    || hasElectronicTags
    || Boolean(tags.shop)
    || Boolean(tags.craft)
    || nameLooksLikeCandidate;
  if (!isCollectionFacility) return null;

  const refusesBatteries = batteryValues.some((value) => /^(no|none|false|0)$/.test(value));
  return {
    confirmed: false,
    label: refusesBatteries ? `${facilityLabel}; OSM ghi không nhận pin` : facilityLabel
  };
}

function getBatteryLifecycleStatus(tags) {
  const closedValue = String(tags.closed || '').toLowerCase();
  if (/^(yes|true|permanent|permanently)$/.test(closedValue)) return 'inactive';

  const inactiveTag = Object.entries(tags).some(([key, value]) =>
    /^(disused|abandoned|closed|was):(amenity|shop|recycling|recycling:batteries|disposal:batteries)$/.test(key)
    && !/^(no|false|0)$/i.test(String(value))
  ) || /^(disused|abandoned|closed)$/i.test(String(tags.lifecycle || ''));
  return inactiveTag ? 'inactive' : '';
}

function getBatteryOpeningStatus(place) {
  if (place.provider === 'Google Places') {
    const nextOpenTime = place.nextOpenTime ? formatBatteryTime(place.nextOpenTime) : '';
    const nextCloseTime = place.nextCloseTime ? formatBatteryTime(place.nextCloseTime) : '';
    if (place.businessStatus === 'CLOSED_PERMANENTLY') {
      return { state: 'inactive', label: 'Đã đóng cửa', note: 'Google Places ghi nhận cơ sở đã đóng vĩnh viễn.' };
    }
    if (place.businessStatus === 'CLOSED_TEMPORARILY') {
      return { state: 'closed', label: 'Đang đóng tạm thời', note: 'Google Places ghi nhận cơ sở tạm thời đóng cửa.' };
    }
    if (place.openNow === true) {
      return {
        state: 'open',
        label: 'Đang mở',
        note: nextCloseTime
          ? `Theo Google Places, mở đến ${nextCloseTime}.`
          : 'Trạng thái hiện tại từ Google Places.'
      };
    }
    if (place.openNow === false) {
      return {
        state: 'closed',
        label: 'Đã đóng cửa',
        note: nextOpenTime
          ? `Theo Google Places, mở lại ${nextOpenTime}.`
          : 'Trạng thái hiện tại từ Google Places.'
      };
    }
    return { state: 'unknown', label: 'Chưa có dữ liệu giờ', note: 'Google Places chưa cung cấp giờ hoạt động; hãy kiểm tra trên Maps hoặc gọi trước khi tới.' };
  }

  if (place.lifecycleStatus === 'inactive') {
    return { state: 'inactive', label: 'Đã ngừng hoạt động', note: 'Điểm được gắn cờ ngừng hoạt động trên OpenStreetMap.' };
  }
  if (!place.openingHours) {
    return { state: 'unknown', label: 'Chưa có dữ liệu giờ', note: 'OpenStreetMap chưa ghi giờ hoạt động; hãy kiểm tra trên Maps hoặc gọi trước khi tới.' };
  }
  if (typeof window.opening_hours !== 'function') {
    return { state: 'unknown', label: 'Chưa xác định', note: 'Không tải được bộ đọc giờ mở cửa.' };
  }

  try {
    const hours = new window.opening_hours(place.openingHours, {
      lat: place.lat,
      lon: place.lng,
      address: { country_code: 'vn', state: 'Ho Chi Minh City' }
    }, { locale: 'vi' });
    if (hours.getUnknown()) {
      return { state: 'unknown', label: 'Chưa xác định', note: 'Lịch có điều kiện nên không thể xác nhận trạng thái lúc này.' };
    }

    const isOpen = hours.getState();
    const nextChange = hours.getNextChange();
    return {
      state: isOpen ? 'open' : 'closed',
      label: isOpen ? 'Đang mở' : 'Đã đóng cửa',
      note: nextChange
        ? `${isOpen ? 'Đóng' : 'Mở'} tiếp theo lúc ${new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(nextChange)} · theo giờ OSM.`
        : 'Theo giờ được ghi trên OpenStreetMap.',
      nextChange
    };
  } catch {
    return { state: 'unknown', label: 'Chưa xác định', note: 'Giờ mở cửa trên bản đồ chưa đọc được.' };
  }
}

function formatBatteryTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(date);
}

function updateBatteryStatusSummary() {
  if (!batteryStatus || !currentBatteryPoints.length) return;
  const counts = currentBatteryPoints.reduce((result, place) => {
    const state = place.openingStatus?.state || 'unknown';
    result[state] = (result[state] || 0) + 1;
    return result;
  }, {});
  batteryStatus.textContent = `Đang mở ${counts.open || 0} · Đã đóng ${((counts.closed || 0) + (counts.inactive || 0))} · Thiếu giờ ${counts.unknown || 0} · ${currentBatteryPoints.length} điểm`;
}

function refreshBatteryOpeningStatuses() {
  if (!batteryPointsList || !currentBatteryPoints.length) return;
  currentBatteryPoints.forEach((place) => {
    place.openingStatus = getBatteryOpeningStatus(place);
  });
  batteryPointsList.querySelectorAll('.battery-point').forEach((item) => {
    const place = currentBatteryPoints[Number(item.dataset.pointIndex)];
    if (!place) return;
    const badge = item.querySelector('.battery-state');
    const note = item.querySelector('.battery-state-note');
    badge.className = `battery-state is-${place.openingStatus.state}`;
    badge.textContent = place.openingStatus.label;
    note.textContent = place.openingStatus.note;
  });
  updateBatteryStatusSummary();
}

function renderBatteryPoints(points, sourceTimestamp, sourceName = 'OpenStreetMap') {
  batteryPointsList.replaceChildren();
  currentBatteryPoints = points.slice(0, 40);
  if (!points.length) {
    const empty = document.createElement('li');
    empty.className = 'battery-empty';
    empty.append(`Chưa tìm thấy địa điểm có dữ liệu bản đồ phù hợp trong bán kính ${formatDistance(selectedRadius)}. Điều này không có nghĩa là quanh bạn không có cửa hàng hoặc nơi sửa chữa. `);
    const explanation = document.createElement('small');
    explanation.textContent = window.location.protocol === 'file:'
      ? 'Trang đang được mở trực tiếp từ tệp trên máy tính nên API Google Places không hoạt động; OpenStreetMap cũng chỉ trả về địa điểm đã được gắn tag. Hãy mở bằng máy chủ GreenSpace hoặc tìm trực tiếp trên Google Maps.'
      : sourceName.includes('Google Places chưa cấu hình')
        ? 'Google Places chưa được cấu hình cho máy chủ này; OpenStreetMap chỉ có thể hiện những cửa hàng đã được gắn tag.'
        : sourceName.includes('Google Places tạm thời không khả dụng')
          ? 'Google Places hiện không kết nối được; OpenStreetMap chỉ có thể hiện những cửa hàng đã được gắn tag.'
          : 'Dữ liệu bản đồ có thể thiếu cửa hàng địa phương hoặc tag sửa chữa. Hãy kiểm tra thêm trên Google Maps.';
    explanation.style.display = 'block';
    explanation.style.marginTop = '6px';
    empty.append(explanation);
    const actions = document.createElement('div');
    actions.className = 'battery-empty-actions';
    const search = document.createElement('a');
    search.href = batterySearchUrl();
    search.target = '_blank';
    search.rel = 'noopener noreferrer';
    search.textContent = 'Tìm cửa hàng và nơi sửa chữa trên Google Maps';
    actions.append(search);
    if (selectedRadius < Number(batteryRadius?.max || 50000) && batteryRadius) {
      const expand = document.createElement('button');
      expand.type = 'button';
      expand.textContent = `Tìm trong ${Number(batteryRadius.max) / 1000} km`;
      expand.addEventListener('click', () => {
        batteryRadius.value = batteryRadius.max;
        updateRadius(batteryRadius.value);
      });
      actions.append(expand);
    }
    empty.append(actions);
    batteryPointsList.append(empty);
    batteryStatus.textContent = 'Chưa có kết quả bản đồ';
  } else {
    currentBatteryPoints.forEach((place, index) => {
      place.openingStatus = getBatteryOpeningStatus(place);
      const item = document.createElement('li');
      item.className = 'battery-point';
      item.dataset.pointIndex = String(index);
      const content = document.createElement('span');
      content.className = 'battery-point-copy';
      const name = document.createElement('strong');
      name.textContent = place.name;
      const status = document.createElement('span');
      status.className = `battery-state is-${place.openingStatus.state}`;
      status.textContent = place.openingStatus.label;
      const statusNote = document.createElement('small');
      statusNote.className = 'battery-state-note';
      statusNote.textContent = `${place.acceptance?.label || 'Cần xác nhận có nhận pin'}. ${place.openingStatus.note}`;
      const details = document.createElement('small');
      const detailParts = [
        place.address || 'Chưa có địa chỉ cụ thể',
        `Cách khoảng ${formatDistance(place.distance)}`,
        place.openingHours?.length
          ? `Giờ mở cửa: ${Array.isArray(place.openingHours) ? place.openingHours.join(' · ') : place.openingHours}`
          : null,
        place.operator ? `Đơn vị: ${place.operator}` : null,
        place.phone ? `Điện thoại: ${place.phone}` : null,
        place.website ? `Website: ${place.website}` : null,
        place.updatedAt ? `Sửa lần cuối: ${formatOsmTimestamp(place.updatedAt)}` : 'Chưa có ngày sửa'
      ].filter(Boolean);
      details.textContent = detailParts.join(' · ');
      content.append(name, status, statusNote, details);
      const directions = document.createElement('a');
      directions.href = batteryDirectionsUrl(place);
      directions.target = '_blank';
      directions.rel = 'noopener noreferrer';
      directions.textContent = 'Chỉ đường';
      item.append(content, directions);
      if (place.openingStatus.state === 'unknown') {
        const hoursLookup = document.createElement('a');
        const mapsQuery = `${place.name} ${place.address || ''}`.trim();
        hoursLookup.href = place.mapsUrl
          || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
        hoursLookup.target = '_blank';
        hoursLookup.rel = 'noopener noreferrer';
        hoursLookup.textContent = 'Kiểm tra giờ trên Maps';
        item.append(hoursLookup);
      }
      batteryPointsList.append(item);
    });
    const shownCount = currentBatteryPoints.length;
    updateBatteryStatusSummary();
    if (points.length > shownCount) {
      batteryUpdated.textContent = `Đang hiển thị ${shownCount} điểm gần nhất trong bán kính ${formatDistance(selectedRadius)}.`;
    }
  }

  const morePlaces = document.createElement('li');
  morePlaces.className = 'battery-more-places';
  morePlaces.append('Tìm thêm cửa hàng hoặc nơi sửa chữa trên Google Maps: ');
  const search = document.createElement('a');
  search.href = batterySearchUrl();
  search.target = '_blank';
  search.rel = 'noopener noreferrer';
  search.textContent = 'Mở tìm kiếm gần vị trí';
  morePlaces.append(search);
  batteryPointsList.append(morePlaces);

  batteryUpdated.textContent = sourceName === 'Google Places'
    ? `Nguồn Google Places · truy vấn lúc ${formatOsmTimestamp(sourceTimestamp)}. Kết quả khớp tìm kiếm; gọi xác nhận điểm có nhận pin trước khi mang tới.`
    : sourceTimestamp
      ? `Nguồn ${sourceName} · đồng bộ ${formatOsmTimestamp(sourceTimestamp)}. Trạng thái theo giờ/tag OSM; gọi xác nhận điểm có nhận pin.`
      : `Nguồn ${sourceName} · không có timestamp đồng bộ. Kết quả chỉ tham khảo; gọi xác nhận điểm có nhận pin.`;
}

async function loadGoogleBatteryPlaces(radius) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch('/api/places/batteries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: userOrigin.lat,
        longitude: userOrigin.lng,
        radius,
        area: batteryAreaInput?.value.trim() || ''
      }),
      signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'Google Places is unavailable.');
      error.code = data.code || 'GOOGLE_PLACES_UNAVAILABLE';
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadBatteryPoints() {
  if (!batteryPointsList || !batteryStatus || !batteryUpdated || !refreshBatteryPointsBtn) return;
  if (!userOrigin) {
    batteryStatus.textContent = 'Cần vị trí';
    batteryPointsList.textContent = 'Cho phép định vị hoặc nhập khu vực để tìm điểm xung quanh.';
    return;
  }

  const requestId = ++batteryRequestId;
  const query = buildBatteryQuery(selectedRadius, userOrigin.lat, userOrigin.lng);
  batteryStatus.textContent = 'Đang cập nhật…';
  batteryPointsList.innerHTML = '<li>Đang dò cửa hàng và cơ sở sửa chữa từ các thẻ địa điểm OpenStreetMap quanh bạn…</li>';
  batteryUpdated.textContent = 'Đang tìm song song trên OpenStreetMap và Google Places (nếu máy chủ đã cấu hình).';
  refreshBatteryPointsBtn.disabled = true;

  try {
    const [googleResult, osmResult] = await Promise.allSettled([
      loadGoogleBatteryPlaces(selectedRadius),
      fetchOverpass(query)
    ]);
    if (requestId !== batteryRequestId) return;

    const googleData = googleResult.status === 'fulfilled' ? googleResult.value : null;
    const data = osmResult.status === 'fulfilled' ? osmResult.value : null;
    const googleFallbackNote = googleResult.status === 'rejected'
      ? googleResult.reason.code === 'GOOGLE_PLACES_NOT_CONFIGURED'
        ? 'Google Places chưa cấu hình'
        : 'Google Places tạm thời không khả dụng'
      : '';
    const googlePoints = (googleData?.places || []).map((place) => ({
      name: place.name,
      address: place.address,
      acceptance: {
        confirmed: false,
        label: 'Cửa hàng/sửa chữa · cần hỏi có nhận pin'
      },
      category: 'repair-shop',
      operator: '',
      openingHours: place.openingHours || [],
      lifecycleStatus: '',
      businessStatus: place.businessStatus,
      openNow: place.openNow,
      nextOpenTime: place.nextOpenTime,
      nextCloseTime: place.nextCloseTime,
      mapsUrl: place.mapsUrl,
      provider: 'Google Places',
      phone: place.phone,
      website: place.website,
      updatedAt: '',
      lat: place.lat,
      lng: place.lng,
      distance: place.distance
    }));
    const osmPoints = (data?.elements || []).map((element) => {
      const tags = element.tags || {};
      const point = element.center || element;
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return null;
      const acceptance = getBatteryAcceptance(tags);
      if (!acceptance) return null;
      return {
        name: tags.name || tags.operator || 'Cơ sở tái chế hoặc thu hồi phế liệu',
        address: formatOsmAddress(tags),
        acceptance,
        category: acceptance.label.startsWith('Cửa hàng/sửa chữa') ? 'repair-shop' : 'recycling',
        operator: tags.operator || '',
        openingHours: tags.opening_hours || tags['opening_hours:collection'] || tags['opening_hours:recycling'] || '',
        lifecycleStatus: getBatteryLifecycleStatus(tags),
        phone: tags.phone || tags['contact:phone'] || '',
        website: tags.website || tags['contact:website'] || '',
        updatedAt: element.timestamp || '',
        lat: point.lat,
        lng: point.lon,
        distance: distanceInMeters(userOrigin, { lat: point.lat, lng: point.lon })
      };
    }).filter((place) => place && place.distance <= selectedRadius);
    let points = [...googlePoints, ...osmPoints];
    const sources = [];
    if (googlePoints.length) sources.push('Google Places');
    if (osmPoints.length) sources.push('OpenStreetMap');
    let sourceName = sources.join(' + ') || 'OpenStreetMap';

    const nominatimPoints = await loadNominatimBatteryPlaces(selectedRadius, userOrigin.lat, userOrigin.lng);
    if (requestId !== batteryRequestId) return;
    points = [...points, ...nominatimPoints];
    if (nominatimPoints.length) {
      sources.push('Nominatim');
      sourceName = sources.join(' + ');
    }

    let uniquePoints = [...new Map(points.map((place) => [
      `${place.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}:${place.lat.toFixed(5)}:${place.lng.toFixed(5)}`,
      place
    ])).values()]
      .sort((first, second) => first.distance - second.distance);

    if (googleFallbackNote) {
      sourceName = `${sourceName} · ${googleFallbackNote}`;
    }
    if (requestId !== batteryRequestId) return;

    uniquePoints.sort((first, second) => {
      const rank = { open: 0, unknown: 1, closed: 2, inactive: 3 };
      const categoryDifference = Number(second.category === 'repair-shop') - Number(first.category === 'repair-shop');
      const statusDifference = rank[getBatteryOpeningStatus(first).state] - rank[getBatteryOpeningStatus(second).state];
      return categoryDifference || statusDifference || first.distance - second.distance;
    });
    const sourceTimestamp = data?.osm3s?.timestamp_osm_base || googleData?.fetchedAt || '';
    renderBatteryPoints(uniquePoints, sourceTimestamp, sourceName);
  } catch {
    if (requestId === batteryRequestId) {
      batteryStatus.textContent = 'Chưa cập nhật được';
      batteryPointsList.replaceChildren();
      const item = document.createElement('li');
      item.append('OpenStreetMap không phản hồi; chưa thể xác minh điểm pin. ');
      const search = document.createElement('a');
      search.href = batterySearchUrl();
      search.target = '_blank';
      search.rel = 'noopener noreferrer';
      search.textContent = 'Tìm trên Google Maps';
      item.append(search);
      batteryPointsList.append(item);
      batteryUpdated.textContent = 'Không thể xác minh độ mới của dữ liệu trong lần tải này.';
    }
  } finally {
    if (requestId === batteryRequestId) refreshBatteryPointsBtn.disabled = false;
  }
}

async function loadNominatimBatteryPlaces(radius, lat, lon) {
  const latitudeDelta = radius / 111320;
  const longitudeDelta = radius / (111320 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
  const searchTerms = ['điện thoại', 'máy tính', 'sửa chữa'];
  const cacheKey = `${lat.toFixed(3)}:${lon.toFixed(3)}:${radius}`;
  const cached = nominatimCache.get(`battery:${cacheKey}`);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) return cached.places;
  const results = [];

  for (const term of searchTerms) {
    const waitMs = Math.max(0, 1100 - (Date.now() - lastNominatimRequest));
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastNominatimRequest = Date.now();
    const params = new URLSearchParams({
      format: 'jsonv2',
      q: term,
      limit: '20',
      viewbox: `${lon - longitudeDelta},${lat + latitudeDelta},${lon + longitudeDelta},${lat - latitudeDelta}`,
      bounded: '1',
      addressdetails: '1',
      extratags: '1',
      'accept-language': 'vi'
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        signal: controller.signal
      });
      if (!response.ok) continue;
      results.push(...await response.json());
    } catch {
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  const uniqueResults = [...new Map(results.map((item) => [
    `${item.lat}:${item.lon}:${item.name || item.display_name}`,
    item
  ])).values()];
  const places = uniqueResults.map((item) => {
    const tags = item.extratags || {};
    const place = {
      name: item.name?.trim() || item.display_name.split(',')[0] || 'Cơ sở tái chế gần đây',
      address: item.display_name || '',
      acceptance: {
        confirmed: false,
        label: 'Cửa hàng/sửa chữa · cần hỏi có nhận pin'
      },
      category: 'repair-shop',
      operator: tags.operator || '',
      openingHours: tags.opening_hours || '',
      lifecycleStatus: getBatteryLifecycleStatus(tags),
      phone: tags.phone || tags['contact:phone'] || '',
      website: tags.website || tags['contact:website'] || '',
      updatedAt: '',
      lat: Number(item.lat),
      lng: Number(item.lon)
    };
    place.distance = distanceInMeters(userOrigin, place);
    return place;
  }).filter((place) => Number.isFinite(place.lat)
    && Number.isFinite(place.lng)
    && place.distance <= radius);
  nominatimCache.set(`battery:${cacheKey}`, { timestamp: Date.now(), places });
  return places;
}

async function searchBatteryArea(event) {
  event.preventDefault();
  const query = batteryAreaInput.value.trim();
  if (!query) {
    batteryAreaInput.focus();
    return;
  }

  const searchId = ++batteryManualSearchId;
  ++batteryRequestId;
  batteryStatus.textContent = 'Đang tìm khu vực…';
  batteryPointsList.textContent = `Đang xác định “${query}”…`;
  batterySearchButton.disabled = true;
  batteryUpdated.textContent = 'Đang tìm vị trí trên OpenStreetMap…';

  const waitMs = Math.max(0, 1100 - (Date.now() - lastNominatimRequest));
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastNominatimRequest = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      q: query,
      limit: '1',
      addressdetails: '1',
      'accept-language': 'vi'
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}.`);
    const matches = await response.json();
    if (searchId !== batteryManualSearchId) return;
    if (!matches.length) {
      batteryStatus.textContent = 'Không tìm thấy khu vực';
      batteryPointsList.textContent = 'Hãy thử nhập tên quận, phường hoặc địa chỉ cụ thể hơn.';
      batteryUpdated.textContent = 'Không tìm thấy khu vực trên OpenStreetMap.';
      return;
    }

    userOrigin = { lat: Number(matches[0].lat), lng: Number(matches[0].lon) };
    originLabel = matches[0].name || query;
    locationOutsideArea = userOrigin.lat < 10.75
      || userOrigin.lat > 10.81
      || userOrigin.lng < 106.65
      || userOrigin.lng > 106.73;
    loadBatteryPoints();
  } catch {
    if (searchId === batteryManualSearchId) {
      batteryStatus.textContent = 'Không tìm được khu vực';
      batteryPointsList.textContent = 'Dịch vụ tìm địa chỉ chưa phản hồi. Hãy thử lại hoặc bật định vị.';
      batteryUpdated.textContent = 'Không thể xác minh khu vực tìm kiếm.';
    }
  } finally {
    clearTimeout(timeout);
    if (searchId === batteryManualSearchId) batterySearchButton.disabled = false;
  }
}

if (refreshBatteryPointsBtn) refreshBatteryPointsBtn.addEventListener('click', loadBatteryPoints);
if (batterySearchForm) batterySearchForm.addEventListener('submit', searchBatteryArea);
function scheduleBatteryRefresh() {
  clearInterval(batteryRefreshTimer);
  clearInterval(batteryStatusTimer);
  batteryRefreshTimer = setInterval(() => {
    if (!document.hidden) loadBatteryPoints();
  }, 30 * 60 * 1000);
  batteryStatusTimer = setInterval(() => {
    if (!document.hidden) refreshBatteryOpeningStatuses();
  }, 60 * 1000);
}

function initializeRadarMap() {
  if (!radarMapElement || !userOrigin) return;
  if (!window.L) {
    radarMapElement.innerHTML = '<p class="map-fallback">Không tải được bản đồ. Danh sách địa điểm vẫn có thể dùng bên dưới.</p>';
    loadNearbyPlaces();
    return;
  }

  radarMapElement.replaceChildren();
  radarMap = L.map(radarMapElement).setView([userOrigin.lat, userOrigin.lng], 14);
  radarTileLayer = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors, tiles by openstreetmap.de',
    maxZoom: 19
  }).addTo(radarMap);
  radarUsingFallbackTiles = false;
  let tileErrors = 0;
  radarTileLayer.on('tileerror', () => {
    tileErrors += 1;
    if (tileErrors < 3 || radarUsingFallbackTiles) return;
    radarUsingFallbackTiles = true;
    radarMap.removeLayer(radarTileLayer);
    radarTileLayer = L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors, tiles by MemoMaps',
      maxZoom: 19
    }).addTo(radarMap);
  });
  radarPlaceLayer = L.layerGroup().addTo(radarMap);
  radarRadiusCircle = L.circle([userOrigin.lat, userOrigin.lng], {
    radius: selectedRadius,
    color: '#2d7f54',
    weight: 2,
    fillColor: '#79b98a',
    fillOpacity: 0.12
  }).addTo(radarMap);
  radarOriginMarker = L.circleMarker([userOrigin.lat, userOrigin.lng], {
    radius: 7,
    color: '#fff',
    weight: 3,
    fillColor: '#1f633f',
    fillOpacity: 1
  }).addTo(radarMap).bindPopup('Tâm tìm kiếm mặc định');
}

if (wasteImageInput && analyzeWasteBtn && manualClassifyBtn && wasteTypeSelect) {
  wasteImageInput.addEventListener('change', onWasteImageSelected);
  analyzeWasteBtn.addEventListener('click', analyzeWasteImage);
  manualClassifyBtn.addEventListener('click', () => {
    showWasteResult(wasteTypeSelect.value, 'Phân loại thủ công');
  });
}

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedMode = button.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach((modeButton) => {
      const isActive = modeButton === button;
      modeButton.classList.toggle('is-active', isActive);
      modeButton.setAttribute('aria-pressed', String(isActive));
    });
    loadNearbyPlaces();
  });
});

function updateRadius(value) {
  selectedRadius = Number(value);
  if (radiusValue) {
    radiusValue.textContent = selectedRadius >= 1000
      ? `${selectedRadius / 1000} km`
      : `${selectedRadius} m`;
  }
  if (batteryRadiusValue) {
    batteryRadiusValue.textContent = selectedRadius >= 1000
      ? `${selectedRadius / 1000} km`
      : `${selectedRadius} m`;
  }
  if (radarRadiusCircle) radarRadiusCircle.setRadius(selectedRadius);
  clearTimeout(placesSearchTimer);
  placesSearchTimer = setTimeout(() => {
    if (radarMapElement) loadNearbyPlaces();
    if (batteryPointsList) loadBatteryPoints();
  }, 300);
}

if (radarRadius) radarRadius.addEventListener('input', () => updateRadius(radarRadius.value));
if (batteryRadius) batteryRadius.addEventListener('input', () => updateRadius(batteryRadius.value));

if (bikeRoutesList) {
  document.querySelectorAll('[data-bike-route-district]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedBikeRouteDistrict = button.dataset.bikeRouteDistrict;
      document.querySelectorAll('[data-bike-route-district]').forEach((option) => {
        const selected = option === button;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      renderBikeRoutes();
    });
  });
  useNearestRental.addEventListener('change', renderBikeRoutes);
  renderBikeRoutes();
}

function locateUser() {
  if (!radarMapElement && !batteryPointsList) return;
  if (!navigator.geolocation) {
    if (radarStatus) radarStatus.textContent = 'Trình duyệt không hỗ trợ định vị. Không thể tìm vị trí người dùng.';
    if (radarMapElement) radarMapElement.innerHTML = '<p class="map-fallback">Trình duyệt không hỗ trợ định vị. Hãy thử bằng trình duyệt khác.</p>';
    if (batteryStatus) batteryStatus.textContent = 'Trình duyệt không hỗ trợ định vị';
    if (batteryUpdated) batteryUpdated.textContent = 'Cần vị trí để tìm điểm thu gom pin quanh bạn.';
    return;
  }

  if (locateMeBtn) {
    locateMeBtn.disabled = true;
    locateMeBtn.textContent = 'Đang định vị…';
  }
  if (radarStatus) radarStatus.textContent = 'Đang xin quyền truy cập vị trí…';
  if (batteryStatus) batteryStatus.textContent = 'Đang xin quyền vị trí…';
  if (radarOriginMarker) radarOriginMarker.bindPopup('Đang chờ quyền vị trí…').openPopup();
  navigator.geolocation.getCurrentPosition((position) => {
    userOrigin = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    locationOutsideArea = userOrigin.lat < 10.75
      || userOrigin.lat > 10.81
      || userOrigin.lng < 106.65
      || userOrigin.lng > 106.73;
    originLabel = 'vị trí hiện tại của bạn';
    if (radarMap) {
      radarMap.setView([userOrigin.lat, userOrigin.lng], 15);
      radarRadiusCircle.setLatLng([userOrigin.lat, userOrigin.lng]);
      radarOriginMarker.setLatLng([userOrigin.lat, userOrigin.lng]);
      radarOriginMarker.bindPopup('Vị trí của bạn');
    } else if (radarMapElement) {
      initializeRadarMap();
    }
    if (locateMeBtn) {
      locateMeBtn.disabled = false;
      locateMeBtn.textContent = 'Định vị lại';
    }
    routeDistanceCache.clear();
    if (radarMapElement) loadNearbyPlaces();
    loadBatteryPoints();
    if (batteryPointsList) scheduleBatteryRefresh();
  }, () => {
    if (locateMeBtn) {
      locateMeBtn.disabled = false;
      locateMeBtn.textContent = 'Thử định vị lại';
    }
    if (!userOrigin) {
      if (radarStatus) radarStatus.textContent = 'Chưa có quyền truy cập vị trí. Hãy cho phép định vị để tìm địa điểm quanh bạn.';
      if (radarMapElement) radarMapElement.innerHTML = '<p class="map-fallback">Bản đồ sẽ hiển thị quanh vị trí của bạn sau khi bạn cho phép định vị.</p>';
      if (batteryStatus) batteryStatus.textContent = 'Chưa có quyền vị trí';
      if (batteryUpdated) batteryUpdated.textContent = 'Cho phép định vị để tìm điểm thu gom pin gần bạn.';
    } else {
      if (radarStatus) radarStatus.textContent = 'Không cập nhật được vị trí. Đang giữ vị trí gần nhất đã xác định.';
      if (batteryStatus) batteryStatus.textContent = 'Đang giữ vị trí gần nhất';
    }
  }, {
    enableHighAccuracy: true,
    timeout: 60000,
    maximumAge: 0
  });
}

if (locateMeBtn) locateMeBtn.addEventListener('click', locateUser);
if (document.body.dataset.page !== 'home' && (radarMapElement || batteryPointsList)) locateUser();

if (refreshPlacesBtn) {
  refreshPlacesBtn.addEventListener('click', async () => {
    if (!userOrigin) {
      locateUser();
      return;
    }
    refreshPlacesBtn.disabled = true;
    refreshPlacesBtn.textContent = 'Đang cập nhật…';
    try {
      await loadNearbyPlaces();
    } finally {
      refreshPlacesBtn.disabled = false;
      refreshPlacesBtn.textContent = 'Cập nhật kết quả';
    }
  });
}

function addMessage(text, type = 'bot', action) {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  if (action) {
    const link = document.createElement('a');
    link.className = 'message-action';
    link.href = action.href;
    link.textContent = action.label;
    message.appendChild(link);
  }
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addChatSuggestions() {
  if (!chatMessages || chatMessages.querySelector('.chat-suggestions')) return;

  const suggestions = [
    'Tôi cần trợ giúp',
    'Trang web này là gì?',
    'Hướng dẫn tôi cách sử dụng',
    'Tôi muốn tìm điểm thu gom pin',
    'Vỏ bánh ăn xong phân loại thế nào?'
  ];
  const panel = document.createElement('section');
  panel.className = 'chat-suggestions';
  panel.setAttribute('aria-label', 'Câu hỏi gợi ý');

  const heading = document.createElement('strong');
  heading.className = 'chat-suggestions-title';
  heading.textContent = 'Bạn có thể hỏi';
  const list = document.createElement('div');
  list.className = 'chat-suggestions-list';

  suggestions.forEach((question) => {
    const item = document.createElement('div');
    item.className = 'chat-suggestion';
    const fillButton = document.createElement('button');
    fillButton.type = 'button';
    fillButton.className = 'chat-suggestion-question';
    fillButton.textContent = question;
    fillButton.setAttribute('aria-label', `Điền câu hỏi: ${question}`);
    fillButton.addEventListener('click', () => {
      chatInput.value = question;
      chatInput.focus();
    });

    const sendButton = document.createElement('button');
    sendButton.type = 'button';
    sendButton.className = 'chat-suggestion-send';
    sendButton.textContent = 'Gửi';
    sendButton.setAttribute('aria-label', `Gửi câu hỏi: ${question}`);
    sendButton.addEventListener('click', () => {
      chatInput.value = question;
      sendChat();
    });

    item.append(fillButton, sendButton);
    list.append(item);
  });

  panel.append(heading, list);
  chatMessages.append(panel);
}

const chatContext = { topic: null, district: null };

function normalizeChatText(text) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function getTopicReply(topic, district) {
  if (topic === 'park') {
    if (district === '1') {
      return {
        text: 'Nếu bạn ở Quận 1, Công viên Tao Đàn là lựa chọn dễ bắt đầu cho đi dạo và nghỉ chân. Giờ mở cửa, tiện ích tại chỗ có thể thay đổi, nên bạn nhớ kiểm tra trước khi đi nhé.',
        action: { href: 'parks.html#park-list', label: 'Xem công viên' }
      };
    }
    if (district === '3') {
      return {
        text: 'Ở Quận 3, Vườn hoa Lê Văn Tám là một điểm xanh phù hợp để thư giãn và đi dạo. Nếu bạn cần chọn theo khoảng cách, mở bản đồ và bật định vị nhé.',
        action: { href: 'parks.html#park-list', label: 'Xem công viên' }
      };
    }
    return {
      text: 'Website giới thiệu Công viên Tao Đàn ở Quận 1 và Vườn hoa Lê Văn Tám ở Quận 3. Bạn đang ở quận nào để mình gợi ý đúng điểm?',
      action: { href: 'parks.html#park-list', label: 'Khám phá công viên' }
    };
  }

  if (topic === 'battery') {
    return {
      text: `Mở trang thu gom pin${district ? ` và chọn khu vực Quận ${district}` : ', bật định vị'} để xem điểm được ghi nhận gần bạn. Dữ liệu bản đồ chưa xác nhận điểm đang nhận pin, nên hãy liên hệ trước khi ghé.`,
      action: { href: 'recycling.html', label: 'Tìm điểm thu gom pin' }
    };
  }

  if (topic === 'bike') {
    return {
      text: `Mở bản đồ trạm xe đạp${district ? ` tại Quận ${district}` : ' gần bạn'} và bật định vị nếu cần. Dữ liệu cộng đồng không hiển thị chắc chắn xe hoặc chỗ đỗ còn trống.`,
      action: { href: 'bikes.html', label: 'Mở bản đồ xe đạp' }
    };
  }

  if (topic === 'waste') {
    return {
      text: 'Bạn đang muốn phân loại món đồ nào? Mình có thể hướng dẫn với nhựa, giấy, kim loại, thủy tinh, pin, rác điện tử và rác hữu cơ.',
      action: { href: 'tools.html', label: 'Mở công cụ phân loại' }
    };
  }

  return {
    text: 'Mình có thể cùng bạn tìm công viên, điểm thu gom pin, trạm xe đạp hoặc cách phân loại rác. Bạn đang cần hỗ trợ việc nào, ở Quận 1 hay Quận 3?',
    action: { href: 'tools.html', label: 'Xem các công cụ xanh' }
  };
}

function getReply(input) {
  const normalized = normalizeChatText(input).trim();
  const districtMatch = normalized.match(/\b(?:quan|q)\s*(1|3)\b/);
  if (districtMatch) chatContext.district = districtMatch[1];

  if (/^(xin chao|chao|hello|hi|hey)\b/.test(normalized)) {
    return {
      text: 'Chào bạn, Greenie đây! Mình có thể giới thiệu website hoặc giúp bạn tìm công viên, phân loại rác, tìm nơi thu gom và tra cứu xe đạp. Bạn muốn bắt đầu từ đâu?',
      action: { href: 'tools.html', label: 'Khám phá công cụ xanh' }
    };
  }

  if (/ban (co the )?(giup|ho tro|tro giup)( toi)?( duoc)?( khong| gi)?|giup toi voi|toi can (giup do|tro giup|su tro giup)|toi muon duoc giup/.test(normalized)) {
    return {
      text: 'Được chứ! Bạn cứ nói điều bạn đang cần. Mình có thể hướng dẫn cách dùng Green Space, gợi ý công viên ở Quận 1 và Quận 3, phân loại rác, tìm cơ sở thu gom hoặc xem thông tin xe đạp.',
      action: { href: 'index.html', label: 'Khám phá Green Space' }
    };
  }

  if (/trang web nay|website nay|green space la gi|web nay de lam gi|trang web nay de lam gi|website de lam gi|web co chuc nang gi|trang web co gi/.test(normalized)) {
    return {
      text: 'Green Space là website hỗ trợ lựa chọn sống xanh tại Quận 1 và Quận 3, TP.HCM. Bạn có thể khám phá công viên, tìm cơ sở tái chế hoặc bãi phế liệu để hỏi về việc nhận pin/rác điện tử, phân loại rác bằng công cụ, và xem thông tin xe đạp công cộng.',
      action: { href: 'index.html', label: 'Về trang chủ' }
    };
  }

  if (/cach su dung|huong dan su dung|dung web the nao|bat dau tu dau|lam sao de dung|chi toi cach/.test(normalized)) {
    return {
      text: 'Bạn có thể chọn mục trên thanh điều hướng: “Công viên xanh” để khám phá địa điểm, “Điểm thu gom pin” để tìm cơ sở tái chế/phế liệu và gọi xác nhận, “Công cụ xanh” để phân loại rác hoặc dùng radar, và “Xe đạp công cộng” để tra cứu điểm xe. Khi được hỏi, hãy cho phép định vị hoặc nhập khu vực.',
      action: { href: 'index.html', label: 'Xem các mục trên website' }
    };
  }

  if (/ban co the lam gi|ban lam duoc gi|ban giup duoc gi|chuc nang cua ban|ho tro nhung gi|ban biet lam gi/.test(normalized)) {
    return {
      text: 'Mình có thể trò chuyện và hướng dẫn các tính năng Green Space: công viên, phân loại và tái chế rác, tìm cơ sở thu gom, cùng thông tin xe đạp tại Quận 1 và Quận 3. Mình không thể xác nhận trực tiếp giờ mở cửa, chỗ trống hay cơ sở có nhận một loại rác cụ thể nếu dữ liệu không có.',
      action: { href: 'tools.html', label: 'Mở công cụ xanh' }
    };
  }

  if (/ban khoe khong|hom nay the nao|ban the nao|how are you/.test(normalized)) {
    return { text: 'Cảm ơn bạn đã hỏi! Greenie vẫn luôn sẵn sàng hỗ trợ 😊 Còn bạn, hôm nay mình có thể giúp gì?' };
  }

  if (/noi chuyen voi toi|tam su|toi dang buon|toi buon qua|chan qua|toi thay met|xin loi/.test(normalized)) {
    return {
      text: 'Mình sẵn sàng lắng nghe và trò chuyện cùng bạn. Nếu bạn muốn, hãy kể thêm điều đang khiến bạn bận tâm; hoặc mình có thể gợi ý một hoạt động nhẹ nhàng như đi dạo ở công viên gần bạn.'
    };
  }

  if (/cam on|thanks|thank you/.test(normalized)) {
    return { text: 'Rất vui được giúp bạn 😊 Bạn cứ hỏi thêm về website, công viên, phân loại rác, điểm thu gom hoặc xe đạp bất cứ lúc nào nhé.' };
  }

  if (/^(tam biet|hen gap lai|bye|goodbye)\b/.test(normalized)) {
    return { text: 'Tạm biệt bạn! Chúc bạn có một ngày thật xanh. Khi cần, Greenie luôn sẵn sàng hỗ trợ nhé.' };
  }

  if (/ban la ai|ten gi|ai tao ra ban|ban la tro ly gi/.test(normalized)) {
    return {
      text: 'Mình là Greenie, trợ lý tự động của Green Space. Mình được thiết kế để trò chuyện và hướng dẫn các chủ đề, tiện ích sống xanh trên website; mình không phải nhân viên trực tuyến.',
      action: { href: 'index.html', label: 'Về Green Space' }
    };
  }

  const asksHowToSort = /phan loai|tai che|xu ly/.test(normalized);
  const wasteKeywords = {
    plastic: /nhua|chai nhua|tui nilon/,
    paper: /giay|bia carton|thung carton/,
    metal: /kim loai|lon nhom|vo hop/,
    glass: /thuy tinh|chai thuy tinh/,
    battery: /pin|ac quy/,
    electronic: /dien tu|dien thoai|sac|tai nghe/,
    organic: /huu co|thuc an|vo rau|ba thua/,
    residual: /rac con lai|rac sinh hoat/
  };
  const wasteKey = Object.keys(wasteKeywords).find((key) => wasteKeywords[key].test(normalized));
  const topics = [];

  if (/cong vien|vuon hoa|tao dan|le van tam|di dao|khong gian xanh|park/.test(normalized)) {
    topics.push('park');
  }
  if (/xe dap|dap xe|bike|tram xe/.test(normalized)) {
    topics.push('bike');
  }
  if (asksHowToSort || /rac thai|phan loai|tai che/.test(normalized)) {
    if (wasteKey !== 'battery' || asksHowToSort) topics.push('waste');
  } else if (wasteKey && wasteKey !== 'battery') {
    topics.push('waste');
  }
  if (/pin|battery|ac quy|thu gom pin/.test(normalized) && !(asksHowToSort && wasteKey === 'battery')) {
    topics.push('battery');
  }

  const distinctTopics = [...new Set(topics)];
  if (distinctTopics.length > 1) {
    const topicNames = { park: 'công viên', bike: 'xe đạp', waste: 'phân loại rác', battery: 'thu gom pin' };
    const options = distinctTopics.map((topic) => topicNames[topic]).join(' hay ');
    return { text: `Bạn đang hỏi ${options}. Bạn muốn mình trả lời phần nào trước?` };
  }

  const topic = distinctTopics[0];
  if (topic) chatContext.topic = topic;

  if (topic === 'waste') {
    if (wasteKey) {
      const waste = wasteTypes[wasteKey];
      return {
        text: `${waste.name}: ${waste.advice}`,
        action: { href: 'tools.html', label: 'Mở công cụ phân loại' }
      };
    }
    return getTopicReply('waste', chatContext.district);
  }

  if (topic) return getTopicReply(topic, chatContext.district);

  if (chatContext.topic && /o do|gan day|gan toi|cu the hon|noi ro hon|con quan|con o|the nao|vay sao/.test(normalized)) {
    return getTopicReply(chatContext.topic, chatContext.district);
  }

  if (chatContext.topic && districtMatch) return getTopicReply(chatContext.topic, chatContext.district);

  if (/goi y|tu van|nen lam gi|muon song xanh/.test(normalized)) {
    return {
      text: 'Nếu muốn bắt đầu ngay, bạn có thể đi bộ ở một công viên gần mình, mang pin cũ đến điểm thu gom chuyên dụng, hoặc thử xe đạp cho chặng ngắn. Bạn muốn mình giúp chọn phương án nào?',
      action: { href: 'parks.html', label: 'Xem các lựa chọn xanh' }
    };
  }

  return {
    text: 'Xin lỗi, mình chưa hiểu rõ ý bạn hoặc câu hỏi này nằm ngoài thông tin mình đang hỗ trợ. Bạn thử hỏi theo cách khác nhé — mình có thể trò chuyện cơ bản, hướng dẫn dùng Green Space, gợi ý công viên, phân loại rác, tìm nơi thu gom hoặc tra cứu xe đạp ở Quận 1 và Quận 3.',
    action: { href: 'tools.html', label: 'Xem các công cụ xanh' }
  };
}

function sendChat() {
  const value = chatInput.value.trim();
  if (!value) return;

  chatMessages.querySelector('.chat-suggestions')?.remove();
  addMessage(value, 'user');
  chatInput.value = '';

  setTimeout(() => {
    const reply = getReply(value);
    addMessage(reply.text, 'bot', reply.action);
  }, 350);
}

function openChat() {
  chatWidget.classList.remove('is-closed', 'is-minimized');
  openChatBtn.setAttribute('aria-expanded', 'true');
  chatInput.focus();
}

openChatBtn.addEventListener('click', openChat);
minimizeChatBtn.addEventListener('click', () => {
  chatWidget.classList.toggle('is-minimized');
  openChatBtn.setAttribute('aria-expanded', String(!chatWidget.classList.contains('is-minimized')));
});
closeChatBtn.addEventListener('click', () => {
  chatWidget.classList.add('is-closed');
  chatWidget.classList.remove('is-minimized');
  openChatBtn.setAttribute('aria-expanded', 'false');
});

document.querySelectorAll('a[href="#chatbot"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    openChat();
  });
});

sendBtn.addEventListener('click', sendChat);
addChatSuggestions();
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendChat();
  }
});

mascotButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.greet;
    const question = button.dataset.question;
    const answer = responses[key] || responses.default;
    mascotText.textContent = question
      ? `Bạn hỏi: ${question} ${answer}`
      : answer;
  });
});
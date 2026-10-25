# Green Space

## Google Places battery search

The battery, e-waste, and scrap-recycling finder calls Google Places through the local Node server. The API key stays on the server and is never sent to browser JavaScript.

1. Install Node.js 20.12 or newer.
2. In Google Cloud, enable Places API (New) and billing. Create a server key restricted to the Places API and the server's IP where possible.
3. Copy `.env.example` to `.env` and set `GOOGLE_MAPS_API_KEY`.
4. Run `npm start` from this directory and open `http://127.0.0.1:3000/recycling.html`.

Without a configured key, the page falls back to OpenStreetMap and labels that source. Google Places results are search matches; verify that a location actually accepts batteries before visiting.

## Waste image classification

The scan tool can use OpenAI vision through the local Node server. After the user checks the explicit consent box, the browser resizes the image before sending it to `/api/classify-waste`; the server keeps the API key private and returns a constrained waste category with a confidence score. API usage may incur provider charges. Do not upload private or sensitive images.

1. Set `OPENAI_API_KEY` in `.env` to an API key enabled for the OpenAI API. Never put this key in browser code or share it in chat.
2. Optionally set `OPENAI_VISION_MODEL`; the default is `gpt-4o-mini`.
3. Run `npm start` and open `http://127.0.0.1:3000/tools.html`. Cloud classification does not work from a `file://` URL.
4. To test from a phone on the same Wi-Fi, set `HOST=0.0.0.0` in `.env`, allow the chosen port through the computer firewall, and open `http://<computer-LAN-IP>:3000/tools.html` on the phone. Keep this development server on a trusted network only.

If the vision API is not configured or unavailable, the page explicitly falls back to its limited on-device object detector. No image model guarantees correct classification of every object or material; check the suggested category and confidence before sorting.
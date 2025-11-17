
// const axios = require('axios');

// const url = 'https://global.api.murf.ai/v1/speech/stream';
// const data = {
// "voiceId": "en-UK-ruby",
//   "style": "Calm",
//   "text": "Seeing the 240 minutes of unproductive time really gave me a pause, Ritesh. I was a little disappointed to see that familiar cycle of 'testing just for fun' leading to porn, masturbation, and then excessive scrolling until 3 am creep in again. ",
//   "multiNativeLocale": "en-US",
//   "model": "FALCON",
//   "format": "MP3",
//   "sampleRate": 24000,
//   "channelType": "MONO"
// };

// const config = {
//   method: 'post',
//   url: url,
//   headers: {
//     'Content-Type': 'application/json',
//     'api-key': 'YOUR_API_KEY'
//   },
//   data: data,
//   responseType: 'stream'
// };

// axios(config)
//   .then((response) => {
//     // Handle streaming response
//     response.data.on('data', (chunk) => {
//       // Process audio chunks as they arrive
//       console.log('Received audio chunk:', chunk.length, 'bytes');
//     });

//     response.data.on('end', () => {
//       console.log('Stream ended');
//     });
//   })
//   .catch((error) => {
//     console.log(error);
//   });

// murfWS.js
require("dotenv").config();
const WebSocket = require("ws");

function setupMurfProxy(server) {
  const frontendWSS = new WebSocket.Server({ server });

  frontendWSS.on("connection", (client) => {
    console.log("[WS] Frontend connected");

    client.on("message", async (msg) => {
      const { text } = JSON.parse(msg);
      if (!text) return;

      // 1 connection per request works for Murf (stateless)
      const murfWS = new WebSocket(
        `wss://global.api.murf.ai/v1/speech/stream-input` +
        `?api-key=${process.env.MURF_API_KEY}` +
        `&model=FALCON&format=WAV&sample_rate=24000&channel_type=MONO`
      );

      murfWS.onopen = () => {
        console.log("[MURF] Connected");

        // 1. Send voice config
        murfWS.send(JSON.stringify({
          voice_config: {
            voiceId: "en-UK-ruby",
            multiNativeLocale: "",
            style: "Calm",
            rate: 0,
            pitch: 0,
            variation: 1
          }
        }));

        // 2. Send text
        murfWS.send(JSON.stringify({
          text,
          end: true
        }));

      };

      // Step 3: Murf → Frontend
      murfWS.onmessage = (event) => {
        client.send(event.data);
      };

      murfWS.onclose = () => console.log("[MURF] Closed");
      murfWS.onerror = (err) => console.error("[MURF ERROR]", err.message);
    });
  });

  console.log("[WS] Murf proxy ready");
}

module.exports = setupMurfProxy;

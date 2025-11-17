class MurfTTS {
  constructor() {
    this.ws = new WebSocket("ws://localhost:8080");
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.firstChunk = true;

    this.ws.onopen = () => console.log("[MURF] Connected");

    this.ws.onmessage = (event) => {
      let msg;

      // backend sends JSON strings
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.warn("Non JSON chunk from Murf");
        return;
      }

      if (msg.audio) {
        this.handleAudio(msg.audio);
      }

      if (msg.final) {
        console.log("Murf finished");
        this.firstChunk = true;
      }
    };

    this.ws.onclose = () => console.log("[MURF] Closed");
  }

  handleAudio(base64Chunk) {
    const raw = atob(base64Chunk);

    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }

    let pcmData = bytes;

    if (this.firstChunk) {
      pcmData = bytes.slice(44); // remove WAV header once
      this.firstChunk = false;
    }

    this.audioCtx.decodeAudioData(pcmData.buffer.slice(0))
      .then((buffer) => {
        const src = this.audioCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(this.audioCtx.destination);
        src.start();
      })
      .catch((err) => console.error("Decode ERR:", err));
  }

  speak(text) {
    if (!this.ws || this.ws.readyState !== 1) {
      console.error("WS not ready");
      return;
    }

    this.ws.send(JSON.stringify({ text }));
  }

  stop() {
    this.firstChunk = true;
    this.audioCtx.close();
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export const murf = new MurfTTS();

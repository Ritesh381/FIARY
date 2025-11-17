export const loadVoices = () => {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
};

export const speakText = async (text, key, setSpeakingKey, utteranceRef) => {
  window.speechSynthesis.cancel();

  const sanitizedText = text.replace(
    /([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu,
    ""
  );

  const utterance = new SpeechSynthesisUtterance(sanitizedText);

  const voices = await loadVoices();
  // console.log("Available voices:", voices);

  const preferredVoice = voices.find(v =>
    v.name.includes("Google US English")
  );

  if (!preferredVoice) {
    console.warn("Google US English voice is NOT available on this device.");
  }

  utterance.voice = preferredVoice || voices[0];

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  utteranceRef.current = utterance;
  setSpeakingKey(key);

  utterance.onend = () => {
    setSpeakingKey(null);
    utteranceRef.current = null;
  };

  window.speechSynthesis.speak(utterance);
};



export const stopSpeaking = (setSpeakingKey, utteranceRef) => {
  window.speechSynthesis.cancel();
  setSpeakingKey(null);
  utteranceRef.current = null;
};

// import { murf } from "../lib/MurfEngine";

// export const speakText = async (text, key, setSpeakingKey, utteranceRef) => {
//   const sanitized = text.replace(
//     /([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu,
//     ""
//   );

//   setSpeakingKey(key);
//   utteranceRef.current = true;

//   murf.speak(sanitized);
// };

// export const stopSpeaking = (setSpeakingKey, utteranceRef) => {
//   murf.stop();
//   setSpeakingKey(null);
//   utteranceRef.current = null;
// };
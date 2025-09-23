export const speakText = (text, key, setSpeakingKey, utteranceRef) => {
  // Stop any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.name.includes("Google US English") || v.name.includes("Microsoft")) ||
    voices[0];
  if (preferredVoice) utterance.voice = preferredVoice;

  // Tune params
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Store ref & update key
  utteranceRef.current = utterance;
  setSpeakingKey(key);

  // Reset when finished
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

export const speakText = (text, key, setSpeakingKey, utteranceRef) => {
  window.speechSynthesis.cancel();

  // Remove emojis but keep punctuation
  const sanitizedText = text.replace(
    /([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu,
    ""
  );

  const utterance = new SpeechSynthesisUtterance(sanitizedText);

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find(
      (v) =>
        v.name.includes("Google US English") ||
        v.name.includes("Microsoft")
    ) || voices[0];
  if (preferredVoice) utterance.voice = preferredVoice;

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

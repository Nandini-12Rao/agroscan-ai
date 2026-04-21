import { Lang, ttsLang } from "./i18n";

export const speak = (text: string, lang: Lang) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = ttsLang(lang);
  utter.rate = 0.95;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
};

export const stopSpeaking = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

// SpeechRecognition wrapper
export const createRecognition = (lang: Lang) => {
  const SR =
    (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;
  if (!SR) return null;
  const r = new SR();
  r.lang = ttsLang(lang);
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r as SpeechRecognition;
};

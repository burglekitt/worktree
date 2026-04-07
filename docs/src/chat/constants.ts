export const ALLOWED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemma-4-26b-a4b-it",
];

// TODO confirm that these are truly free
export const FREE_MODELS = [
  { label: "Gemini 2.5 Flash (free)", value: "gemini-2.5-flash" },
  { label: "Gemini 2.5 Flash Lite (free)", value: "gemini-2.5-flash-lite" },
  { label: "Gemma 4 (open source, free)", value: "gemma-4-26b-a4b-it" },
];

export const DEFAULT_MODEL = FREE_MODELS[0].value;

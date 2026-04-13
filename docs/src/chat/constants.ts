export const ALLOWED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
] as const;

export type AllowedModel = (typeof ALLOWED_MODELS)[number];

export const FREE_MODELS: ReadonlyArray<{
  label: string;
  value: AllowedModel;
}> = [
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
  { label: "Gemini 2.5 Flash Lite (fastest)", value: "gemini-2.5-flash-lite" },
  { label: "Gemini 3 Flash (preview)", value: "gemini-3-flash-preview" },
];

export const DEFAULT_MODEL: AllowedModel = FREE_MODELS[0].value;

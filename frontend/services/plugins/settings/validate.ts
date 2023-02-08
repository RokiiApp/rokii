import type { pluginSchema } from "@/plugins";

const VALID_TYPES = new Set(["string", "number", "bool", "option"]);

const validSetting = ({ type, options }: any) => {
  // General validation of settings
  if (!type || !VALID_TYPES.has(type)) return false;

  // Type-specific validations
  if (type === "option") return Array.isArray(options) && options.length;

  return true;
};

export const validate = ({ settings }: pluginSchema) => {
  if (!settings) return true;
  return Object.values(settings).every(validSetting);
};

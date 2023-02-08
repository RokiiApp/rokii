const prefix = process.env.VITE_DEV_SERVER_URL;

export const themes = [
  {
    value: `${prefix}dist/main/css/themes/light.css`,
    label: "Light",
  },
  {
    value: `${prefix}dist/main/css/themes/dark.css`,
    label: "Dark",
  },
] as const;

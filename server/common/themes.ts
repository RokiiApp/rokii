const prefix = process.env.VITE_DEV_SERVER_URL;

export const themes = [
  {
    value: `${prefix}/themes/light.css`,
    label: "Light",
  },
  {
    value: `${prefix}/themes/dark.css`,
    label: "Dark",
  },
] as const;

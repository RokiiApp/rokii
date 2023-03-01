import React from "react";
import ReactDOM from "react-dom/client";
import { ipcRenderer } from "electron";

import * as config from "common/config";
import { Events } from "common/constants/events";

import { Roki } from "./components/Roki";
import "./globals.css";

window.React = React;

/**
 * Change current theme
 *
 * @param src Absolute path to new theme css file
 */
const changeTheme = (src: string) => {
  (document.getElementById("roki-theme") as HTMLLinkElement).href = src;
};

// Set theme from config
changeTheme(config.get("theme"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Roki />
  </React.StrictMode>
);

import("@/services/plugins/initializePlugins").then((module) =>
  module.initializePlugins()
);

ipcRenderer.on(Events.UpdateDownloaded, () => {
  new Notification("Roki: update is ready to install", {
    body: "New version is downloaded and will be automatically installed on quit",
  });
});

// Handle `updateTheme` event from main process
ipcRenderer.on(Events.UpdateTheme, (_, theme) => changeTheme(theme));

import React from "react";
import ReactDOM from "react-dom/client";

import * as config from "common/config";
import { CHANNELS } from "common/constants/events";
import { on } from "common/ipc";

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

on(CHANNELS.UpdateDownloaded, () => {
  new Notification("Roki: update is ready to install", {
    body: "New version is downloaded and will be automatically installed on quit",
  });
});

// Handle `updateTheme` event from main process
on(CHANNELS.UpdateTheme, (_, theme) => changeTheme(theme))

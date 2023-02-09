import React from "react";
import ReactDOM from "react-dom/client";
import * as config from "common/config";
import { on } from "@/services/rpc";
import Cerebro from "./components/Cerebro";
import "./globals.css";
import { initializePlugins } from "@/services/plugins/initializePlugins";

window.React = React;

/**
 * Change current theme
 *
 * @param src Absolute path to new theme css file
 */
const changeTheme = (src: string) => {
  (document.getElementById("cerebro-theme") as HTMLLinkElement).href = src;
};

// Set theme from config
changeTheme(config.get("theme"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Cerebro />
  </React.StrictMode>
);

initializePlugins();

// Handle `showTerm` rpc event and replace search term with payload
// on("showTerm", );

on(
  "update-downloaded",
  () =>
    new Notification("Cerebro: update is ready to install", {
      body: "New version is downloaded and will be automatically installed on quit",
    })
);

// Handle `updateTheme` rpc event and change current theme
on("updateTheme", changeTheme);

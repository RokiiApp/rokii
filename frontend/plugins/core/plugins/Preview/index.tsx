import type { PluginInfo } from "../types";

import { useState } from "react";
// @ts-ignore
import { KeyboardNav, KeyboardNavItem } from "@cerebroapp/cerebro-ui";
import { ActionButton } from "./ActionButton";
import { Description } from "./Description";
import { Settings } from "./Settings";

import { client } from "@/services/plugins/index";
import styles from "./styles.module.css";
import * as format from "../utils/format";

enum PluginAction {
  install = "install",
  uninstall = "uninstall",
  update = "update",
}

type PreviewProps = {
  onComplete: Function;
  plugin: PluginInfo;
};

export const Preview = ({ onComplete, plugin }: PreviewProps) => {
  const [runningAction, setRunningAction] = useState<PluginAction | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const onCompleteAction = () => {
    setRunningAction(null);
    onComplete();
  };

  const getPluginAction =
    (pluginName: string, runningActionName: PluginAction) => async () => {
      setRunningAction(runningActionName);
      await client[runningActionName](pluginName);
      onCompleteAction();
    };

  const {
    name,
    version,
    description,
    repo,
    isInstalled,
    isDebugging,
    installedVersion,
    isUpdateAvailable,
  } = plugin;

  const githubRepo = repo && repo.match(/^.+github.com\/([^\/]+\/[^\/]+).*?/);
  const settings = plugin?.settings || null;
  return (
    <div className={styles.preview} key={name}>
      <h2>{`${format.name(name)} (${version})`}</h2>

      <p>{format.description(description)}</p>
      <KeyboardNav>
        <div className={styles.header}>
          {settings && (
            <KeyboardNavItem onSelect={() => setShowSettings((prev) => !prev)}>
              Settings
            </KeyboardNavItem>
          )}

          {showSettings && <Settings name={name} settings={settings} />}

          {!isInstalled && !isDebugging && (
            <ActionButton
              onSelect={getPluginAction(name, PluginAction.install)}
              text={
                runningAction === PluginAction.install
                  ? "Installing..."
                  : "Install"
              }
            />
          )}

          {isInstalled && (
            <ActionButton
              onSelect={getPluginAction(name, PluginAction.uninstall)}
              text={
                runningAction === PluginAction.uninstall
                  ? "Uninstalling..."
                  : "Uninstall"
              }
            />
          )}

          {isUpdateAvailable && (
            <ActionButton
              onSelect={getPluginAction(name, PluginAction.update)}
              text={
                runningAction === PluginAction.update
                  ? "Updating..."
                  : `Update (${installedVersion} → ${version})`
              }
            />
          )}

          {githubRepo && (
            <KeyboardNavItem
              onSelect={() => setShowDescription((prev) => !prev)}
            >
              Details
            </KeyboardNavItem>
          )}
        </div>
      </KeyboardNav>

      {showDescription && githubRepo && (
        <Description repoName={githubRepo[1]} />
      )}
    </div>
  );
};

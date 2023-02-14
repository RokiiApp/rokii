import { useState, useEffect } from "react";
import PropTypes from "prop-types";
// @ts-ignore
import { KeyboardNav, KeyboardNavItem } from "@cerebroapp/cerebro-ui";
import ReactMarkdown from "react-markdown";

import ActionButton from "./ActionButton.js";
import Settings from "./Settings";
import getReadme from "../getReadme";
import styles from "./styles.module.css";
import * as format from "../format";
import { client } from "@/services/plugins/index.js";

function Description({ repoName }: { repoName: string }) {
  const isRelative = (src: string) => !src.match(/^(https?:|data:)/);

  const urlTransform = (src: string) => {
    if (isRelative(src))
      return `http://raw.githubusercontent.com/${repoName}/master/${src}`;
    return src;
  };

  const [readme, setReadme] = useState<string>("");

  useEffect(() => {
    getReadme(repoName).then(setReadme);
  }, []);

  if (!readme) return null;

  return (
    <ReactMarkdown
      className={styles.markdown}
      transformImageUri={(src) => urlTransform(src)}
    >
      {readme}
    </ReactMarkdown>
  );
}

type PluginAction = "install" | "uninstall" | "update" | null;

function Preview({
  onComplete,
  plugin,
}: {
  onComplete: () => void;
  plugin: any;
}) {
  const [runningAction, setRunningAction] = useState<PluginAction>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const onCompleteAction = () => {
    setRunningAction(null);
    onComplete();
  };

  const pluginAction =
    (pluginName: string, runningActionName: PluginAction) => (): any =>
      [
        setRunningAction(runningActionName),
        runningActionName && client[runningActionName](pluginName),
      ];

  const {
    name,
    version,
    description,
    repo,
    isInstalled = false,
    isDebugging = false,
    installedVersion,
    isUpdateAvailable = false,
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
              action={pluginAction(name, "install")}
              text={runningAction === "install" ? "Installing..." : "Install"}
              onComplete={onCompleteAction}
            />
          )}

          {isInstalled && (
            <ActionButton
              action={pluginAction(name, "uninstall")}
              text={
                runningAction === "uninstall" ? "Uninstalling..." : "Uninstall"
              }
              onComplete={onCompleteAction}
            />
          )}

          {isUpdateAvailable && (
            <ActionButton
              action={pluginAction(name, "update")}
              text={
                runningAction === "update"
                  ? "Updating..."
                  : `Update (${installedVersion} → ${version})`
              }
              onComplete={onCompleteAction}
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
      {showDescription && <Description repoName={githubRepo[1]} />}
    </div>
  );
}

Preview.propTypes = {
  plugin: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default Preview;

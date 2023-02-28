import { useState } from "react";
import PropTypes from "prop-types";
// @ts-ignore
import { FormComponents } from "@cerebroapp/cerebro-ui";
import { themes } from "common/themes";

import Hotkey from "./Hotkey";
import countries from "./countries";
import styles from "./styles.module.css";

const { Select, Checkbox, Wrapper, Text } = FormComponents;

function Settings({ get, set }: typeof import("common/config")) {
  const [state, setState] = useState(() => ({
    hotkey: get("hotkey"),
    showInTray: get("showInTray"),
    country: get("country"),
    theme: get("theme"),
    proxy: get("proxy"),
    developerMode: get("developerMode"),
    cleanOnHide: get("cleanOnHide"),
    selectOnShow: get("selectOnShow"),
    pluginsSettings: get("plugins"),
    openAtLogin: get("openAtLogin"),
  }));

  const changeConfig = (key: any, value: any) => {
    set(key, value);
    setState((prevState) => ({ ...prevState, [key]: value }));
  };

  return (
    <div className={styles.settings}>
      <Wrapper
        label="Hotkey"
        description="Type your global shortcut for Roki in this input"
      >
        <Hotkey
          hotkey={state.hotkey}
          onChange={(key) => changeConfig("hotkey", key)}
        />
      </Wrapper>
      <Select
        label="Country"
        description="Choose your country so Roki can better choose currency, language, etc."
        value={countries.find((c) => c.value === state.country)}
        options={countries}
        onChange={(value: any) => changeConfig("country", value)}
      />
      <Select
        label="Theme"
        value={themes.find((t) => t.value === state.theme)}
        options={themes}
        onChange={(value: any) => changeConfig("theme", value)}
      />
      <Text
        type="text"
        label="Proxy"
        value={state.proxy}
        onChange={(value: any) => changeConfig("proxy", value)}
      />
      <Checkbox
        label="Open at login"
        value={state.openAtLogin}
        onChange={(value: any) => changeConfig("openAtLogin", value)}
      />
      <Checkbox
        label="Show in menu bar"
        value={state.showInTray}
        onChange={(value: any) => changeConfig("showInTray", value)}
      />
      <Checkbox
        label="Developer Mode"
        value={state.developerMode}
        onChange={(value: any) => changeConfig("developerMode", value)}
      />
      <Checkbox
        label="Clean results on hide"
        value={state.cleanOnHide}
        onChange={(value: any) => changeConfig("cleanOnHide", value)}
      />
      <Checkbox
        label="Select input on show"
        value={state.selectOnShow}
        onChange={(value: any) => changeConfig("selectOnShow", value)}
      />
    </div>
  );
}

Settings.propTypes = {
  get: PropTypes.func.isRequired,
  set: PropTypes.func.isRequired,
};

export default Settings;

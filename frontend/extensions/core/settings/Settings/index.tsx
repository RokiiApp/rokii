import type { SettingsHandler, SettingsSchema } from '@rokii/types';

import { useState } from 'react';
import { FormComponents } from '@rokii/ui';
import { themes } from 'common/themes';

import Hotkey from './Hotkey';
import styles from './styles.module.css';

const { Select, Checkbox, Wrapper, Text } = FormComponents;

function Settings ({ get, set }: SettingsHandler) {
  const [state, setState] = useState(() => ({
    hotkey: get('hotkey'),
    showInTray: get('showInTray'),
    country: get('country'),
    theme: get('theme'),
    proxy: get('proxy'),
    developerMode: get('developerMode'),
    cleanOnHide: get('cleanOnHide'),
    hideOnBlur: get('hideOnBlur'),
    selectOnShow: get('selectOnShow'),
    pluginsSettings: get('plugins'),
    openAtLogin: get('openAtLogin')
  }));

  const changeConfig = <T extends keyof SettingsSchema>(key: T, value: SettingsSchema[T]) => {
    set(key, value);
    setState((prevState) => ({ ...prevState, [key]: value }));
  };

  return (
    <div className={styles.settings}>
      <Wrapper
        label='Hotkey'
        description='Type your global shortcut for Rokii in this input'
      >
        <Hotkey
          hotkey={state.hotkey}
          onChange={(key) => changeConfig('hotkey', key)}
        />
      </Wrapper>
      <Select
        label='Theme'
        value={themes.find((t) => t.value === state.theme)}
        options={themes}
        onChange={(newValue) => newValue && changeConfig('theme', newValue.value)}
      />
      <Text
        type='text'
        label='Proxy'
        value={state.proxy}
        onChange={(value: string) => changeConfig('proxy', value)}
      />
      <Checkbox
        label='Open at login'
        value={state.openAtLogin}
        onChange={(value: boolean) => changeConfig('openAtLogin', value)}
      />
      <Checkbox
        label='Show in menu bar'
        value={state.showInTray}
        onChange={(value: boolean) => changeConfig('showInTray', value)}
      />
      <Checkbox
        label='Developer Mode'
        value={state.developerMode}
        onChange={(value: boolean) => changeConfig('developerMode', value)}
      />
      <Checkbox
        label='Hide window on blur'
        value={state.hideOnBlur}
        onChange={(value: boolean) => changeConfig('hideOnBlur', value)}
      />
      <Checkbox
        label='Clean results on hide'
        value={state.cleanOnHide}
        onChange={(value: boolean) => changeConfig('cleanOnHide', value)}
      />
      <Checkbox
        label='Select input on show'
        value={state.selectOnShow}
        onChange={(value: boolean) => changeConfig('selectOnShow', value)}
      />
    </div>
  );
}

export default Settings;

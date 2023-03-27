import type { PluginResult } from '@rokii/types';
import type { Script, ScriptMode } from './types';

import { app } from '@electron/remote';

import { RokiStore } from '@/state/rokiStore';
import { search, shellCommand } from '@rokii/utils';
import { scriptsWatcher } from './ScriptsWatcher';

const searchMatchingScripts = (scriptsArray: Script[], term: string) => {
  return search(scriptsArray, term.split(' ')[0], (script) => script.keyword + ' ' + script.title + ' ' + script.subtitle);
};

const getArgs = (term: string) => {
  return term.replace(term.split(' ')[0], '').trim();
};

const onSelectFactory = (script: Script, term: string, navigate: any) => {
  const args = getArgs(term);

  const scriptHandlers: Record<ScriptMode, PluginResult['onSelect']> = {
    plugin: (e) => {
      const route = args ? script.keyword + '/' + encodeURI(args) : script.keyword;
      navigate('/script/' + route);
      e.preventDefault();
    },

    background: async (e) => {
      const commandResult = await shellCommand(script.content + (args || ''), { cwd: app.getPath('home') });
      new Notification(script.title, { body: commandResult as string });
      e.preventDefault();
    }
  };

  return script.mode ? scriptHandlers[script.mode] : scriptHandlers.background;
};

const normalizeCommandToDisplayResult = (command: Script): PluginResult => {
  const { keyword, title, subtitle } = command;
  return {
    title,
    subtitle: subtitle || 'Rokii',
    term: keyword + ' ',
    icon: './favicon.ico'
  };
};

export const displayScripts = (term: string, addResult: RokiStore['addResult'], nav: any) => {
  const scripts = scriptsWatcher.getScripts();

  searchMatchingScripts(scripts, term).forEach((command) => {
    const { title } = command;

    addResult(title, {
      ...normalizeCommandToDisplayResult(command),
      onSelect: onSelectFactory(command, term, nav)
    });
  });
};

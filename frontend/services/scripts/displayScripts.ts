import type { PluginResult } from '@rokii/types';
import type { Script, ScriptMode } from './types';

import { app } from '@electron/remote';

import { RokiStore } from '@/state/rokiStore';
import { search, shellCommand } from '@rokii/utils';
import { scriptsWatcher } from './ScriptsWatcher';

const searchMatchingCommands = (commandsArray: Script[], term: string) => {
  return search(commandsArray, term.split(' ')[0], (command) => command.keyword + ' ' + command.name);
};

const getArgs = (term: string) => {
  return term.replace(term.split(' ')[0], '').trim();
};

const onSelectFactory = (script: Script, term: string, navigate: any) => {
  const args = getArgs(term);

  const scriptHandlers: Record<ScriptMode, PluginResult['onSelect']> = {
    plugin: (e) => {
      const route = args ? script.keyword + '/' + encodeURI(args) : script.keyword;
      navigate('/command/' + route);
      e.preventDefault();
    },

    background: async (e) => {
      const commandResult = await shellCommand(script.content + (args || ''), { cwd: app.getPath('home') });
      new Notification(script.name, { body: commandResult as string });
      e.preventDefault();
    }
  };

  return script.mode ? scriptHandlers[script.mode] : scriptHandlers.background;
};

const normalizeCommandToDisplayResult = (command: Script): PluginResult => {
  const { keyword, name } = command;
  return {
    title: name,
    subtitle: 'Rokii',
    term: keyword + ' ',
    icon: './favicon.ico'
  };
};

export const displayScripts = (term: string, addResult: RokiStore['addResult'], nav: any) => {
  const commands = scriptsWatcher.getScripts();

  searchMatchingCommands(commands, term).forEach((command) => {
    const { name } = command;

    addResult(name, {
      ...normalizeCommandToDisplayResult(command),
      onSelect: onSelectFactory(command, term, nav)
    });
  });
};

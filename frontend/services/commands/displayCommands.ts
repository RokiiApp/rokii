import type { Command, CommandMode } from './types';
import { RokiStore } from '@/state/rokiStore';
import { search, shellCommand } from '@rokii/utils';
import { app } from '@electron/remote';
import { PluginResult } from '@rokii/types';
import { getCommands } from './getCommands';

const searchMatchingCommands = (commandsArray: Command[], term: string) => {
  return search(commandsArray, term.split(' ')[0], (command) => command.keyword + ' ' + command.name);
};

const getArgs = (term: string) => {
  return term.replace(term.split(' ')[0], '').trim();
};

const onSelectFactory = (command: Command, term: string, navigate: any) => {
  const args = getArgs(term);

  const commandHandlers: Record<CommandMode, PluginResult['onSelect']> = {
    statusbar: (e) => {
      e.preventDefault();
    },

    plugin: (e) => {
      navigate('/command/' + command.keyword);
      e.preventDefault();
    },

    background: (e) => {
      shellCommand(command.command + (args || ''), {
        cwd: app.getPath('home')
      });
      e.preventDefault();
    }
  };

  return command.mode ? commandHandlers[command.mode] : commandHandlers.background;
};

export const displayCommands = (term: string, addResult: RokiStore['addResult'], nav: any) => {
  const commands = getCommands();

  searchMatchingCommands(commands, term).forEach((command) => {
    const { keyword, name } = command;
    addResult(name, {
      icon: '/favicon.ico',
      title: name,
      subtitle: 'Rokii',
      term: keyword + ' ',
      onSelect: onSelectFactory(command, term, nav)
    });
  });
};

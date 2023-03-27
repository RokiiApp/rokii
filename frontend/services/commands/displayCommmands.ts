import { RokiStore } from '@/state/rokiStore';
import { search } from '@rokii/utils';
import { ExternalModuleImporter } from '../ExternalModuleImporter';
import { commandsWatcher } from './CommandsWatcher';
import { CommandInfo } from './types';

const searchMatchingCommands = (commandsArray: CommandInfo[], term: string) => {
  return search(commandsArray, term.split(' ')[0], (command) => `${command.title} ${command.subtitle}`);
};

const onSelectFactory = (command: CommandInfo, navigate: any) => {
  switch (command.mode) {
    case 'page':
      return () => navigate('/command/' + encodeURI(command.path));
    case 'background':
    default:
      return () => ExternalModuleImporter.importModule(command.path).then(({ module }) => module.default());
  }
};

export const displayCommands = (term: string, addResult: RokiStore['addResult'], nav: any) => {
  const commands = commandsWatcher.getCommands();

  searchMatchingCommands(commands, term).forEach((command) => {
    addResult(command.title, {
      ...command,
      onSelect: onSelectFactory(command, nav)
    });
  });
};

import commands from '@/plugins/commands/Rokii.json';
import { getCreatedCommands } from './getCreatedCommands';
import { Command } from './types';

export const getCommands = () => [...commands, ...getCreatedCommands()] as Command[];

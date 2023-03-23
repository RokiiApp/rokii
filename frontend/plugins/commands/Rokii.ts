import { Command } from '@/services/commands/types';

export const commands: Command[] = [
  {
    keyword: 'run',
    name: 'Run command',
    mode: 'plugin',
    command: ''
  },
  {
    keyword: 'explorer',
    name: 'Open Explorer',
    command: 'explorer '
  },
  {
    keyword: 'mute',
    name: 'Mute/Unmute',
    command: 'powershell.exe -NoProfile -c $obj = new-object -com wscript.shell ; $obj.SendKeys([char]173)'
  }
];

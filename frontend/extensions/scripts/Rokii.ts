import { Script } from '@/services/scripts/types';

export const scripts: Script[] = [
  {
    keyword: 'run',
    name: 'Run command',
    mode: 'plugin',
    content: ''
  },
  {
    keyword: 'explorer',
    name: 'Open Explorer',
    content: 'explorer '
  },
  {
    keyword: 'mute',
    name: 'Mute/Unmute',
    content: 'powershell.exe -NoProfile -c $obj = new-object -com wscript.shell ; $obj.SendKeys([char]173)'
  }
];

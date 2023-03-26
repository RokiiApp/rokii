import { Script } from '@/services/scripts/types';

export const scripts: Script[] = [
  {
    keyword: 'run',
    title: 'Run command',
    mode: 'plugin',
    content: ''
  },
  {
    keyword: 'explorer',
    title: 'Open Explorer',
    content: 'explorer '
  },
  {
    keyword: 'mute',
    title: 'Mute/Unmute',
    content: 'powershell.exe -NoProfile -c $obj = new-object -com wscript.shell ; $obj.SendKeys([char]173)'
  }
];

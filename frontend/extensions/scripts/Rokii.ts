import { Script } from '@/services/scripts/types';

export const scripts: Script[] = [
  {
    keyword: 'cmd',
    title: 'Run command',
    subtitle: 'Terminal',
    mode: 'plugin',
    content: ''
  },
  {
    keyword: 'start',
    title: 'Start application',
    content: 'start '
  },
  {
    keyword: 'explorer',
    title: 'Explorer',
    subtitle: 'Open',
    content: 'explorer '
  },
  {
    keyword: 'recycle',
    title: 'Recycle Bin',
    subtitle: 'Open',
    content: 'start shell:recyclebinfolder'
  },
  {
    keyword: 'mute',
    title: 'Mute/Unmute',
    subtitle: 'Audio',
    content: 'powershell.exe -NoProfile -c $obj = new-object -com wscript.shell ; $obj.SendKeys([char]173)'
  },
  {
    keyword: 'vup',
    title: 'Volume Up',
    subtitle: 'Audio',
    content: 'powershell.exe -NoProfile -c $obj = new-object -com wscript.shell ; $obj.SendKeys([char]175)'
  },
  {
    keyword: 'vdo',
    title: 'Volume Down',
    subtitle: 'Audio',
    content: 'powershell.exe -NoProfile -c $obj = new-object -com wscript.shell ; $obj.SendKeys([char]174)'
  }
];

import type { PluginModule } from '@rokii/types';

import { app } from '@electron/remote';
import { search } from '@rokii/utils';
import icon from '../icon.png';

const KEYWORDS = ['Quit', 'Exit'];

const subtitle = 'Quit from RoKii';
const onSelect = () => app.quit();

export const fn: PluginModule['fn'] = ({ term, display }) => {
  const isMatch = search(KEYWORDS, term).length > 0;
  if (!isMatch) return;

  const title = KEYWORDS[0];

  const result = {
    icon,
    title,
    subtitle,
    onSelect,
    term: title
  };

  display(result);
};

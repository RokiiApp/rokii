import type { PluginModule } from '@rokii/types';

import { app } from '@electron/remote';
import { search } from '@rokii/utils';

import icon from '../icon.png';

const NAME = 'RoKii Version';
const order = 9;
const KEYWORDS = [NAME, 'ver', 'version'];

/**
 * Plugin to show app settings in results list
 */
const plugin: PluginModule['fn'] = ({ term, display }) => {
  const match = search(KEYWORDS, term).length > 0;
  if (!match) return;

  const result = {
    order,
    icon,
    title: NAME,
    getPreview: () => (
      <div>
        <strong>{app.getVersion()}</strong>
      </div>
    ),
    term: NAME
  };

  display(result);
};

export { NAME as name, plugin as fn, icon };

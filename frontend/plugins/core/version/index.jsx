import icon from '../icon.png'
import { app } from "@electron/remote"
// Settings plugin name
const NAME = 'Cerebro Version'

// Settings plugins in the end of list
const order = 9

// Phrases that used to find settings plugins
const KEYWORDS = [
  NAME,
  'ver',
  'version'
]

/**
 * Plugin to show app settings in results list
 *
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const versionPlugin = ({ term, display, actions }) => {
  const found = true;

  if (found) {
    const results = [{
      order,
      icon,
      title: NAME,
      term: NAME,
      getPreview: () => (<div><strong>{app.getVersion()}</strong></div>),
      onSelect: (event) => {
        event.preventDefault()
        actions.replaceTerm(NAME)
      }
    }]
    display(results)
  }
}

export default { name: NAME, fn: versionPlugin }

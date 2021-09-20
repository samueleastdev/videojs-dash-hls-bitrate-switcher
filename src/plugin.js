import videojs from 'video.js';
import { version as VERSION } from '../package.json';

const Plugin = videojs.getPlugin('plugin');

const MenuButton = videojs.getComponent('MenuButton');

import { PlayBackRatesBtn } from './items.js';

// Default options for the plugin.
const defaults = {};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class DashHlsBitrateSwitcher extends Plugin {
  /**
   * Create a DashHlsBitrateSwitcher plugin instance.
   *
   * @param  {Player} player
   *         A Video.js Player instance.
   *
   * @param  {Object} [options]
   *         An optional options object.
   *
   *         While not a core part of the Video.js plugin architecture, a
   *         second argument of options is a convenient way to accept inputs
   *         from your plugin's caller.
   */
  constructor(player, options) {

    super(player);

    const self = this;

    this.options = videojs.mergeOptions(defaults, options);

    this.player.ready(() => {
      this.player.addClass('vjs-dash-hls-bitrate-switcher');
    });

    this.player.one(((videojs.browser.IS_IOS) ? 'canplaythrough' : 'loadedmetadata'), function(_event) {

      if (['application/vnd.apple.mpegurl', 'application/x-mpegURL', 'application/dash+xml'].includes(this.currentType())) {

        self.init(this.qualityLevels());

      }

    });

  }

  sortProperties(obj) {

    obj = obj.levels_;

    // convert object into array
    const sortable = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sortable.push(obj[key]);
      }
    }

    // sort items by value
    sortable.sort(function(a, b) {
      if (b.hasOwnProperty('height')) {
        return a.height - b.height;
      }

      if (b.hasOwnProperty('bandwidth')) {
        return a.bandwidth - b.bandwidth;
      }
    });

    return sortable.reverse();
  }

  formatBps(bits) {

    let i = -1;

    const byteUnits = [' kbps', ' Mbps', ' Gbps', ' Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];

    do {
      bits = bits / 1024;
      i++;
    } while (bits > 1024);

    return Math.max(bits, 0.1).toFixed(1) + byteUnits[i];

  }

  formatRendition(preset) {

    // Pass all other checks now lets use the correct functionality
    let presetText = '';

    if (preset.hasOwnProperty('height')) {

      presetText = preset.height + 'p';

    } else {

      presetText = Math.round(preset.bandwidth / 1000) + 'k';

    }

    return presetText;

  }

  init(levels) {
    const self = this;

    class RatesButton extends MenuButton {
      constructor(player, options) {
        super(player, options);
      }
      buildCSSClass() {
        return `vjs-icon-cog ${super.buildCSSClass()}`;
      }
      buildWrapperCSSClass() {
        return `vjs-dash-hls-bitrate-switcher-menu ${super.buildWrapperCSSClass()}`;
      }
      createItems(items = []) {

        const qualityLevels = self.sortProperties(levels);

        qualityLevels.forEach(level => {

          items.push(new PlayBackRatesBtn(this.player(), {
            levels: qualityLevels,
            label: `${self.formatRendition(level)}, ${self.formatBps(level.bitrate)}`,
            height: level.height
          }));
        });

        return items;

      }
    }

    videojs.registerComponent('RatesButton', RatesButton);
    this.player.getChild('controlBar').addChild('RatesButton');

  }
}

// Define default values for the plugin's `state` object here.
DashHlsBitrateSwitcher.defaultState = {};

// Include the version number.
DashHlsBitrateSwitcher.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('dashHlsBitrateSwitcher', DashHlsBitrateSwitcher);

export default DashHlsBitrateSwitcher;

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

    this.player.on('loadstart', function(_event) {
      if (this.getChild('controlBar').getChild('RatesButton')) {
        this.getChild('controlBar').removeChild('RatesButton');
        self.qualityLevels.off('change');
      }

      this.one(((videojs.browser.IS_IOS) ? 'canplaythrough' : 'loadedmetadata'), function(_evt) {
        if (['application/vnd.apple.mpegurl', 'application/x-mpegURL', 'application/dash+xml'].includes(this.currentType())) {
          self.qualityLevels = this.qualityLevels();
          if (self.qualityLevels.levels_.length > 1) {
            self.init();
          }
        }
      });

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

  formatRendition(level) {

    if (level.hasOwnProperty('height')) {

      if (level.height) {
        return `${level.height}p, ${this.formatBps(level.bitrate)}`;
      }
      return '';

    } else {

      return `${this.formatBps(level.bitrate)}`;

    }

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
      updateSelected(item) {

        this.items.forEach(child => {
          if (item.bitrate === parseInt(child.el().getAttribute('data-bitrate'))) {
            child.addClass('vjs-selected');
          } else {
            child.removeClass('vjs-selected');
          }
        });

      }
      createItems(items = []) {

        const qualityLevels = self.sortProperties(self.qualityLevels);

        qualityLevels.forEach(level => {
          // bitrate need to be set
          if (level.bitrate) {
            items.push(new PlayBackRatesBtn(this.player(), {
              levels: qualityLevels,
              label: `${self.formatRendition(level)}`,
              bitrate: level.bitrate,
              type: level.bitrate
            }));
          }

        });

        return items;

      }
    }

    videojs.registerComponent('RatesButton', RatesButton);

    const comps = self.player.getChild('controlBar').children().length;

    if (self.player.getChild('controlBar').getChild('fullscreenToggle')) {

      self.player.getChild('controlBar').addChild('ratesButton', {}, (comps - 1));

    } else {

      self.player.getChild('controlBar').addChild('ratesButton', {}, comps);

    }
    // Listen to change events for when the player selects a new quality level
    self.qualityLevels.on('change', function() {
      self.player.getChild('controlBar').getChild('ratesButton').updateSelected(self.qualityLevels[self.qualityLevels.selectedIndex]);
      self.player.playbackRateSwitched = self.qualityLevels[self.qualityLevels.selectedIndex];
      self.player.trigger('playbackRateSwitched');
    });

    // Set initial value
    self.player.getChild('controlBar').getChild('ratesButton').updateSelected(self.qualityLevels[self.qualityLevels.selectedIndex]);

  }
}

// Define default values for the plugin's `state` object here.
DashHlsBitrateSwitcher.defaultState = {};

// Include the version number.
DashHlsBitrateSwitcher.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('dashHlsBitrateSwitcher', DashHlsBitrateSwitcher);

export default DashHlsBitrateSwitcher;

import videojs from 'video.js';
import { version as VERSION } from '../package.json';

const Plugin = videojs.getPlugin('plugin');

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

    this.options = videojs.mergeOptions(defaults, options);

    this.player.ready(() => {
      this.player.addClass('vjs-dash-hls-bitrate-switcher');
    });

    if (['application/vnd.apple.mpegurl', 'application/x-mpegURL', 'application/dash+xml'].includes(this.player.currentType())) {

      this.init();

    }

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

  init(callback) {
    const that = this;

    // Creates button
    const MenuButton = videojs.getComponent('MenuButton');

    const RatesButton = videojs.extend(MenuButton, {
      constructor: function() {
        MenuButton.apply(this, arguments);
        this.addClass('vjs-dash-hls-bitrate-switcher-menu');
        this.children_[0].addClass('vjs-icon-cog');
        this.controlText('Rates');
      }
    });

    videojs.registerComponent('ratesButton', RatesButton);
    this.player.getChild('controlBar').addChild('ratesButton', {});

    // If the fullscreen button is present insert before
    if (this.player.getChild('controlBar').getChild('fullscreenToggle')) {
      this.player.getChild('controlBar').el().insertBefore(
        this.player.getChild('controlBar').getChild('ratesButton').el(),
        this.player.getChild('controlBar').getChild('fullscreenToggle').el()
      );
    }

    this.player.one(((videojs.browser.IS_IOS) ? 'canplaythrough' : 'loadedmetadata'), function(_event) {

      const controlBtn = this.getChild('controlBar').getChild('ratesButton');

      const menuUL = controlBtn.el().children[1].children[0];

      const qualityLevels = that.sortProperties(this.qualityLevels());

      for (let i = 0; i < qualityLevels.length; i++) {

        const res = qualityLevels[i];

        if (res.height) {
          const child = document.createElement('li');

          child.addEventListener(
            'click',
            (function(index) {
              return function() {
                for (let r = 0; r < qualityLevels.length; r++) {
                  const quality = qualityLevels[r];

                  if (quality.height === qualityLevels[index].height) {
                    quality.enabled = true;
                  } else {
                    quality.enabled = false;
                  }
                }
              };
            })(i)
          );

          child.className = 'vjs-menu-item';

          child.innerHTML = '<span class="vjs-menu-item-text">' + that.formatRendition(res) + ", " + that.formatBps(res.bitrate) + '</span><span class="vjs - control - text" aria-live="polite"></span>';

          menuUL.appendChild(child);

        }
      }
    });
  }
}

// Define default values for the plugin's `state` object here.
DashHlsBitrateSwitcher.defaultState = {};

// Include the version number.
DashHlsBitrateSwitcher.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('dashHlsBitrateSwitcher', DashHlsBitrateSwitcher);

export default DashHlsBitrateSwitcher;

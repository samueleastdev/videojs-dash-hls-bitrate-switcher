import videojs from "video.js";
import { version as VERSION } from "../package.json";

const Plugin = videojs.getPlugin("plugin");

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
        // the parent class will add player under this.player
        super(player);

        this.options = videojs.mergeOptions(defaults, options);

        this.init();

        this.player.ready(() => {
            this.player.addClass("vjs-dash-hls-bitrate-switcher");
        });

    }

    sortProperties(obj) {

        obj = obj.levels_;

        // convert object into array
        var sortable = [];

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                sortable.push(obj[key]); // each item is an array in format [key, value]
            }
        }

        // sort items by value
        sortable.sort(function(a, b) {
            if (b.hasOwnProperty("height")) {
                return a.height - b.height;
            }

            if (b.hasOwnProperty("bandwidth")) {
                return a.bandwidth - b.bandwidth;
            }
        });

        return sortable.reverse();
    }

    // Format the bandwidth bps
    formatBps(bits) {

        var i = -1;
        var byteUnits = [' kbps', ' Mbps', ' Gbps', ' Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];
        do {
            bits = bits / 1024;
            i++;
        } while (bits > 1024);

        return Math.max(bits, 0.1).toFixed(1) + byteUnits[i];

    }

    formatRendition(preset) {

        // Pass all other checks now lets use the correct functionality
        if (preset.hasOwnProperty('height')) {
            return preset.height + "p";
        } else {
            return Math.round(preset.bandwidth / 1000) + "k";
        }

    }

    init(callback) {
        var that = this;

        // Creates button
        var MenuButton = videojs.getComponent("MenuButton");

        var RatesButton = videojs.extend(MenuButton, {
            constructor: function() {
                MenuButton.apply(this, arguments);
                this.addClass("vjs-icon-cog");
                this.addClass("vjs-icon-placeholder");
                this.addClass("vjs-menu-button");
                this.addClass("vjs-menu-button-popup");
                this.addClass("vjs-button");
                this.controlText("Rates");
            },
            handleClick: function() { },
        });

        videojs.registerComponent("ratesButton", RatesButton);
        this.player.getChild("controlBar").addChild("ratesButton", {});
        this.player.getChild("controlBar").el().insertBefore(
            this.player.getChild("controlBar").getChild("ratesButton").el(),
            this.player.getChild("controlBar").getChild("fullscreenToggle").el()
        );

        this.player.one("canplaythrough", function(_event) {

            var controlBtn = this.getChild("controlBar").getChild("ratesButton");

            var menuUL = controlBtn.el().children[1].children[0];

            var qualityLevels = that.sortProperties(this.qualityLevels());

            for (var i = 0; i < qualityLevels.length; i++) {
                var res = qualityLevels[i];
                if (res.height) {
                    var child = document.createElement("li");

                    child.addEventListener(
                        "click",
                        (function(index) {
                            return function() {
                                for (var r = 0; r < qualityLevels.length; r++) {
                                    var quality = qualityLevels[r];

                                    if (quality.height === qualityLevels[index].height) {
                                        quality.enabled = true;
                                    } else {
                                        quality.enabled = false;
                                    }
                                }
                            };
                        })(i)
                    );

                    child.className = "vjs-menu-item";

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
videojs.registerPlugin("dashHlsBitrateSwitcher", DashHlsBitrateSwitcher);

export default DashHlsBitrateSwitcher;

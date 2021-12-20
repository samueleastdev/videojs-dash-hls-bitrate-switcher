# videojs-dash-hls-bitrate-switcher

Creates a button in the controlbar that can be used to switch bitrate for DASH and HLS playlists

This plugin requires the Quality Levels plugin

https://github.com/videojs/videojs-contrib-quality-levels

```sh
npm install --save videojs-contrib-quality-levels
```

## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->

## Installation

```sh
npm install --save @samueleastdev/videojs-dash-hls-bitrate-switcher
```

## How To Run The Code

```sh
npm install
```

```sh
npm start
```

Open your browser to http://localhost:9999

## Usage

To include videojs-dash-hls-bitrate-switcher on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-dash-hls-bitrate-switcher.min.js"></script>
<script>
  var player = videojs("my-video");

  player.dashHlsBitrateSwitcher({
    showInfo: false,
  });
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-dash-hls-bitrate-switcher via npm and `require` the plugin as you would any other module.

```js
var videojs = require("video.js");

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require("videojs-dash-hls-bitrate-switcher");

var player = videojs("my-video");

player.dashHlsBitrateSwitcher({
  showInfo: false,
});
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(["video.js", "videojs-dash-hls-bitrate-switcher"], function (videojs) {
  var player = videojs("my-video");

  player.dashHlsBitrateSwitcher({
    showInfo: false,
  });
});
```

## License

Apache-2.0. Copyright (c) Samuel East

[videojs]: http://videojs.com/

import videojs from 'video.js';

const MenuItem = videojs.getComponent('MenuItem');

export class PlayBackRatesBtn extends MenuItem {
  constructor(player, options) {
    super(player, options);
    this.height = options.height;
    this.levels = options.levels;
  }
  handleClick(event) {

    // Add the selected class
    this.parentComponent_.children_.forEach(child => {
      child.removeClass('vjs-selected');
    });

    this.addClass('vjs-selected');

    this.levels.forEach(level => {

      if (this.height === level.height) {
        level.enabled = true;
      } else {
        level.enabled = false;
      }

    });

  }
}

videojs.registerComponent('PlayBackRatesBtn', PlayBackRatesBtn);

'use strict';

module.exports = {
  source: {
    folders: {
      app: 'dist/web',
      assets: [
        'src/files/**/*'
      ]
    }
  },
  target: {
    folders: {
      dev: 'dist/web_dev',
      zip: 'dist/web_zip',
    }
  }
};

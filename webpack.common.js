const path = require('path');

module.exports = {
  entry: {
    app: './js/nhan_vien.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/nhan_vien.js',
  },
};

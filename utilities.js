const chalk = require('chalk');

// render red text
const renderRedText = text => {
  return chalk.red(text);
};

// render blue text
const renderBlueText = text => {
  return chalk.blue(text);
};

// render green text
const renderGreenText = text => {
  return chalk.green(text);
};

// render yellow text
const renderYellowText = text => {
  return chalk.yellow(text);
};

// export functions
module.exports = {
  renderRedText,
  renderBlueText,
  renderGreenText,
  renderYellowText,
};

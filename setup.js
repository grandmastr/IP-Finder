const {writeFile} = require('fs');
const {renderRedText, renderGreenText} = require('./utilities');
const {exit} = require('process');

const data = `API_KEY=\nBASE_URL=http://api.ipstack.com/`;

writeFile('.env', data, 'utf8', (err) => {
  if (err) {
    console.log(renderRedText(err));
    exit();
  }

  console.log(renderGreenText('Environment variable generated successfully.'));
});

const axios = require('axios');
const program = require('commander');
const {prompt} = require('inquirer');
const redis = require('redis');
const client = redis.createClient();
const ip = require('ip');
const {
  renderRedText,
  renderBlueText,
  renderGreenText,
  renderYellowText,
} = require('./utilities');
// initialize dotenv
require('dotenv').config();

client.on('error', err => {
  if (err.code === 'ECONNREFUSED') {
    console.log(
      renderRedText(
        `Redis failed to connect to ${err.address} on port ${err.port}. Please start your Redis server`,
      ),
    );
    process.exit();
  }
  console.log(renderRedText(err));
  process.exit();
});

const questions = [
  {
    type: 'input',
    name: 'ipAddress',
    message: renderBlueText(`Enter your IP address(${ip.address()}): `),
  },
];

// import api key and base URL from environment variable
const {API_KEY, BASE_URL} = process.env;

program
  .version('IP Finder v1.0.0')
  .description('IP details CLI app, with redis cache feature');

program
  .command('ipAddress')
  .alias('ip')
  .description('Enter the address you want to find out more about')
  .action(() => {
    prompt(questions).then(({ipAddress: ip}) => {
      console.log('Please wait...');

      client.get(ip, (err, res) => {
        if (err) {
          console.log(renderRedText(err));
          throw err;
        } else {
          if (res !== null || typeof res === 'undefined') {
            console.log(
              renderBlueText(
                `Here is the result for the address - ${ip}: ${res}`,
              ),
            );
          } else {
            axios
              .get(`${BASE_URL}${ip}?access_key=${API_KEY}`)
              .then(response => {
                console.clear();
                if (response.status === 200) {
                  try {
                    const {
                      ip: address,
                      continent_name,
                      country_name,
                      city,
                      region_name: state,
                      longitude,
                      latitude,
                      type,
                      zip,
                    } = response.data;
                    let IPDetails = {
                      address,
                      continent: continent_name,
                      country: country_name,
                      state,
                      city,
                      longitude,
                      latitude,
                      type,
                      zip,
                    };
                    if (continent_name !== null) {
                      client.set(
                        address,
                        JSON.stringify(IPDetails),
                        redis.print,
                        10, // expiry time in seconds
                      );
                      client.get(address, (err, res) => {
                        if (err) {
                          console.log(renderRedText(err));
                          throw err;
                        }
                        console.log(
                          renderBlueText(
                            `Here is the result for the address - ${address}: ${res.toString()}`,
                          ),
                        );
                      });
                    } else {
                      console.log(
                        renderRedText(
                          'I don\'t think the public IP you supplied is correct',
                        ),
                      );
                    }
                  } catch (e) {
                    console.log(renderRedText(e));
                  }
                } else {
                  console.log(renderGreenText('Connection Error'));
                }
              })
              .catch(err => console.log(renderYellowText(err)));
          }
        }
      });
    });
  });

program.parse(process.argv);

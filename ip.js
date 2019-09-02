const axios = require("axios");
const program = require("commander");
const { prompt } = require("inquirer");
const redis = require("redis");
const client = redis.createClient();
const ip = require("ip");


client.on("error", err => console.log(`Error ${err}`));

const questions = [{
    type: 'input',
    name: 'ipAddress',
    message: `Enter your IP address(${ip.address()}): `
}]

let loading = false;

const API_KEY = 'API_KEY';
const BASE_IRL = 'http://api.ipstack.com/';
const IP = '197.210.64.65';

program
    .version("IP Finder v1.0.0")
    .description("IP details CLI app, with redis cache feature");

program
    .command("ipAddress")
    .alias("ip")
    .description("Enter the address you want to find out more about")
    .action(() => {
        prompt(questions).then(({ ipAddress: ip }) => {
            console.log("Please wait...");

            client.get(ip, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    if (res !== null) {
                        console.log(`Here is the result for the address - ${ip}: ${res}`);
                    } else {
                        axios.get(`${BASE_IRL}${ip}?access_key=${API_KEY}`)
                            .then(response => {
                                console.clear();
                                console.log("Here we go");
                                console.clear();
                                if (response.status === 200) {
                                    try {
                                        const { ip: address, continent_name, country_name, city: state, longitude, latitude } = response.data;
                                        let IPDetails = {
                                            address,
                                            continent: continent_name,
                                            country: country_name,
                                            state,
                                            longitude,
                                            latitude
                                        }
                                        if (continent_name !== null) {
                                            client.set(address, JSON.stringify(IPDetails), redis.print);
                                            client.get(address, (err, res) => {
                                                if (err) {
                                                    console.log(err);
                                                    throw err;
                                                }
                                                console.log(`Here is the result for the address - ${address}: ${res}`);
                                            })
                                        } else {
                                            console.log("I don't think the public IP you supplied is correct");
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                } else {
                                    console.log("Connection Error");
                                }
                            })
                            .catch(err => console.log(err));
                    }
                }
            });
        });
    })

program.parse(process.argv);

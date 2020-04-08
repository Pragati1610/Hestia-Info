const apiCallFromNode = require('./nodejscall')
const redis = require("redis");
const cors = require("cors");
const express = require("express");
const app = express();
const router = express.Router();
const axios = require("axios");

require("dotenv").config();
const client = redis.createClient(process.env.REDIS_URL);


app.use(cors());

client.on("error", function (error) {
    console.error(error);
});

router.get('/node', async (req, res) => {
    var key = "news";
    client.get(key, async function (err, reply) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (reply) {
            res.write(reply);
            res.end();
            var data = await apiCallFromNode.callApi();
            client.set(key, data, "EX", 60 * 60 * 12);
        } else {
            var data = await apiCallFromNode.callApi();
            res.write(JSON.stringify(data));
            res.end();                       //waits for all the chunks of responses the server 
            //provides to our requests and then ends the connection         
        }
    });
});

router.get("/stats", (req, res) => {
    client.get("stat", async (err, reply) => {
        if (reply) {
            return res.status(200).json(JSON.parse(reply));
        }
        else {
            try {
                const stats = await axios.get("https://corona.lmao.ninja/v2/historical/all");
                const globalData = await axios.get("https://corona.lmao.ninja/all");

                const caseKey = Object.keys(stats.data.cases);
                const caseValue = Object.values(stats.data.cases);

                const recoveredKey = Object.keys(stats.data.recovered);
                const recoveredValue = Object.values(stats.data.recovered);

                const deathsKey = Object.keys(stats.data.deaths);
                const deathsValue = Object.values(stats.data.deaths);

                const caseArr = caseKey.map((item, i)=>{
                    return {
                        date: new Date(item),
                        count: caseValue[i]
                    }
                });

                const recoveredArr = recoveredKey.map((item, i)=>{
                    return {
                        date: new Date(item),
                        count: recoveredValue[i]
                    }
                });

                const deathsArr = deathsKey.map((item, i)=>{
                    return {
                        date: new Date(item),
                        count: deathsValue[i]
                    }
                });

                const arr = {
                    case: caseArr,
                    recovered: recoveredArr,
                    deaths: deathsArr,
                    globalData: globalData.data
                };
                client.set("stats", JSON.stringify({
                    time_series: arr
                }), "EX", 60 * 60 * 12);
                return res.status(200).json({
                    time_series: arr
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({
                    err: err
                });
            }
        }
    });
});

router.get("/allCountriesData", (req, res) => {
    client.get("allCountriesData", async (err, reply) => {
        if (reply) {
            return res.status(200).json(JSON.parse(reply));
        }
        else {
            try {
                const allCountriesData = await axios.get("https://corona.lmao.ninja/countries");
                client.set("allCountriesData", JSON.stringify({
                    allCountriesData: allCountriesData.data
                }), "EX", 12 * 60 * 60)
                return res.status(200).json({
                    allCountriesData: allCountriesData.data
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({
                    err: err
                });
            };
        }
    });

});



router.get("/allCountriesData/:country", (req, res) => {
    const country = req.params.country;

    client.get(country, async (err, reply) => {
        if (reply) {
            return res.status(200).json(JSON.parse(reply));
        } else {
            try {
                const allCountriesData = await axios.get("https://corona.lmao.ninja/countries");

                const countryData = allCountriesData.data.find(item => item.country.toLowerCase() === country.toLowerCase());
                client.set(country, JSON.stringify({
                    countryData: countryData
                }), "EX", 12 * 60 * 60);
                return res.status(200).json({
                    countryData: countryData
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({
                    err: err
                });
            };
        }
    });

});

router.get("/allCountries", (req, res) => {
    client.get("allCountries", async (err, reply) => {
        if (reply) {
            return res.status(200).json(JSON.parse(reply));
        } else {

            try {
                const allCountriesData = await axios.get("https://corona.lmao.ninja/countries");
                const allCountries = allCountriesData.data.map(item => item.country);
                client.set("allCountries", JSON.stringify({
                    allCountries: allCountries
                }), "EX", 7 * 60 * 60);
                return res.status(200).json({
                    allCountries: allCountries
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({
                    err: err
                });
            };
        }
    });
});

app.use("/", router);

module.exports = app;

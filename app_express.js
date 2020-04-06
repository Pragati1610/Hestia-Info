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

router.get('/node', async (req, res) => {
    var key = "randomString";
    client.get(key, async function (err, reply) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (reply) {
            res.write(reply);
            res.end();
            var data = await apiCallFromNode.callApi();
            client.set(key, data);
        } else {
            var data = await apiCallFromNode.callApi();
            res.write(JSON.stringify(data));
            res.end();                       //waits for all the chunks of responses the server 
            //provides to our requests and then ends the connection
            client.on("error", function (error) {
                console.error(error);
            });
        }
    });
});

router.get("/stats", async (req, res) => {
    try {
        const stats = axios.get("https://corona.lmao.ninja/v2/historical/all");
        const globalData = axios.get("https://corona.lmao.ninja/all");
        const total = await Promise.all([stats, globalData]);

        return res.status(200).json({
            time_series: total[0].data,
            global_stats: total[1].data
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
});

router.get("/allCountriesData", async (req, res) => {
    try {
        const allCountriesData = await axios.get("https://corona.lmao.ninja/countries");
        return res.status(200).json({
            allCountriesData: allCountriesData.data
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    };
});


router.get("/allCountries", async(req,res) => {
    try{
        const allCountriesData = await axios.get("https://corona.lmao.ninja/countries");
        const allCountries = allCountriesData.map(item => item.country);
        return res.status(200).json({
            allCountries: allCountries
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    };
});

app.use("/", router);

module.exports = app;

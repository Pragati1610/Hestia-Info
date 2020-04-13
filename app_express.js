const apiCallFromNode = require("./nodejscall");
const redis = require("redis");
const cors = require("cors");
const express = require("express");
const app = express();
const router = express.Router();
const axios = require("axios");
const News = require("./models/news");

const client = redis.createClient(process.env.REDIS_URL);

app.use(cors());

client.on("error", function (error) {
  console.error(error);
});

function comparer(exists) {
  return function (apiItem) {
    const data = exists.filter(function (existsItem) {
      return existsItem.guid == apiItem.guid;
    });
    return data.length == 0;
  };
}

function swap(item){
 

  item.content = item.content.replace(/\&nbsp;/g, " ");
  item.contentSnippet = item.contentSnippet.replace(/\&nbsp;/g, " ");

 
  return item;
}

router.get("/node", async (req, res) => {
  const key = 1234;
  const exists = await News.findOne({
    where: { key },
  });
  if (exists === null) {
    const data = await apiCallFromNode.callApi();
    data["key"] = key;
    try {
      await News.create(data);
      return res.status(201).json(data);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  } else {
    const data = await apiCallFromNode.callApi();
    data["key"] = key;
    // console.log(exists);
    // postgres doesnt support arrays
    exists.items = JSON.parse(exists.items); 
    delete exists["createdAt"];
    delete exists["updatedAt"];
    exists.items = exists.items.map(swap);

    const onlyInApi = data.items.filter(comparer(exists.items))[0];

    if (typeof onlyInApi === "undefined") {
      return res.status(200).json(exists);
    } else {
      try {
        await axios.post(
          "http://hestia-requests.herokuapp.com/api/notification/send_notification/",
          {
            message_body: onlyInApi.contentSnippet,
            message_title: onlyInApi.title,
            to_all: true,
            token: "abcd",
            data: {
              url: "https://akina.dscvit.com/main",
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              sound: "default",
              status: "done",
              screen: "screenA"
            },
          }
        );
        return res.status(200).json(data);
      } catch (err) {
        console.log(err);
        return res.status(500).json(err);
      }
    }
  }
});

router.get("/stats", (req, res) => {
  client.get("stat", async (err, reply) => {
    if (reply) {
      return res.status(200).json(JSON.parse(reply));
    } else {
      try {
        const stats = await axios.get(
          "https://corona.lmao.ninja/v2/historical/all"
        );
        // const globalData = await axios.get("https://corona.lmao.ninja/all");

        const caseKey = Object.keys(stats.data.cases);
        const caseValue = Object.values(stats.data.cases);

        const recoveredKey = Object.keys(stats.data.recovered);
        const recoveredValue = Object.values(stats.data.recovered);

        const deathsKey = Object.keys(stats.data.deaths);
        const deathsValue = Object.values(stats.data.deaths);

        const caseArr = caseKey.map((item, i) => {
          return {
            date: new Date(item),
            count: caseValue[i],
          };
        });

        const recoveredArr = recoveredKey.map((item, i) => {
          return {
            date: new Date(item),
            count: recoveredValue[i],
          };
        });

        const deathsArr = deathsKey.map((item, i) => {
          return {
            date: new Date(item),
            count: deathsValue[i],
          };
        });

        const totalCases = caseKey.map((item, i) => {
          return {
            date: new Date(item),
            count: caseValue[i] + recoveredValue[i] + deathsValue[i],
          };
        });
        recentCase = caseArr[caseArr.length - 1].count;
        recentDeath = deathsArr[deathsArr.length - 1].count;
        recentRecovered = recoveredArr[recoveredArr.length - 1].count;

        recentTotalCases = recentCase + recentDeath + recentRecovered;

        const arr = {
          case: caseArr,
          recovered: recoveredArr,
          deaths: deathsArr,
          totalCases: totalCases,
          globalData: {
            recentCase: recentCase,
            recentDeath: recentDeath,
            recentRecovered: recentRecovered,
            recentTotalCases: recentTotalCases,
          },
          // globalData: globalData.data
        };
        client.set(
          "stats",
          JSON.stringify({
            time_series: arr,
          }),
          "EX",
          60 * 60 * 12
        );
        return res.status(200).json({
          time_series: arr,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          err: err,
        });
      }
    }
  });
});

router.get("/allCountriesData", (req, res) => {
  client.get("allCountriesData", async (err, reply) => {
    if (reply) {
      return res.status(200).json(JSON.parse(reply));
    } else {
      try {
        const allCountriesData = await axios.get(
          "https://corona.lmao.ninja/countries"
        );
        client.set(
          "allCountriesData",
          JSON.stringify({
            allCountriesData: allCountriesData.data,
          }),
          "EX",
          12 * 60 * 60
        );
        return res.status(200).json({
          allCountriesData: allCountriesData.data,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          err: err,
        });
      }
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
        const allCountriesData = await axios.get(
          "https://corona.lmao.ninja/countries"
        );

        const countryData = allCountriesData.data.find(
          (item) => item.country.toLowerCase() === country.toLowerCase()
        );
        client.set(
          country,
          JSON.stringify({
            countryData: countryData,
          }),
          "EX",
          12 * 60 * 60
        );
        return res.status(200).json({
          countryData: countryData,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          err: err,
        });
      }
    }
  });
});

router.get("/allCountries", (req, res) => {
  client.get("allCountries", async (err, reply) => {
    if (reply) {
      return res.status(200).json(JSON.parse(reply));
    } else {
      try {
        const allCountriesData = await axios.get(
          "https://corona.lmao.ninja/countries"
        );
        const allCountries = allCountriesData.data.map((item) => item.country);
        client.set(
          "allCountries",
          JSON.stringify({
            allCountries: allCountries,
          }),
          "EX",
          7 * 60 * 60
        );
        return res.status(200).json({
          allCountries: allCountries,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          err: err,
        });
      }
    }
  });
});

app.use("/", router);

module.exports = app;

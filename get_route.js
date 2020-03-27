const https = require("http");
const callExternalApiUsingHttp = require("nodejscall");

EXTERNAL_URL = "https://www.who.int/rss-feeds/news-english.xml";

const requestNews = (callback) => {
    https.get(EXTERNAL_URL, (resp) => {
        resp.on('data',(data)=>{
            data = callExternalApiUsingHttp();
        });     
        resp.on('end',()=>{
            return callback(data);
        }).on('error',(err)=>{
            console.log("Error: "+err.message);
        });
    });
};

module.exports = requestNews;
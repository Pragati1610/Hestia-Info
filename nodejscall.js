
const https = require('https');
const Parser = require('rss-parser');
 
EXTERNAL_URL = 'https://www.who.int/rss-feeds/news-english.xml';


// const callExternalApiUsingHttp = (callback) => {
//     https.get(EXTERNAL_URL, (resp) => {
//     let data = '';
    
//     // A chunk of data has been recieved.
//     resp.on('data', (chunk) => {
//         data += chunk;
//     });
    
//     // The whole response has been received. Print out the result.
//     resp.on('end', () => {
//         return callback(data);
//     });


//     }).on("error", (err) => {
       
//     console.log("Error: " + err.message);
//     });
// }


const parser = new Parser();

const callExternalApiUsingHttp = (async () => {

let feed = await parser.parseURL(EXTERNAL_URL);
console.log(feed.title);

function fun(e){
    return e.forEach()==="covid";
}

feed.items.forEach(item => {
    const covidNews = feed.items.filter(fun(e));

    console.log(item.title + ':' + item.link)
});

})();


module.exports.callApi = callExternalApiUsingHttp;
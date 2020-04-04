const apiCallFromNode = require('./nodejscall')
const redis = require("redis");
const cors = require("cors");
const express = require("express");
const app = express();
const router = express.Router();

require("dotenv").config();
const client = redis.createClient(process.env.REDIS_URL);


app.use(cors());

router.get('/', async (req, res) => {
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

app.use("/node", router);

module.exports = app;

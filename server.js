const http = require("http");
require("dotenv").config();
const app = require("./app_express");

const port = process.env.PORT||3000;
http.createServer(app).listen(port);

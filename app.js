const apiCallFromNode = require('./get_route')

const http = require('http')

http.createServer((req, res) => {
        if(req.url === "/node"){
            apiCallFromNode.callApi(function(response){
                res.write(response);
                res.end();
            });
        }
}).listen(3000);
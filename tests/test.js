const chai = require("chai");
const chaiHttp = require("chai-http");

require("dotenv").config();
const app = require("../app_express");
const nodeCallApi = require("../nodejscall");
const db = require("../db");

chai.use(chaiHttp);



describe('# Test all routes', function(){
    this.timeout(40000)
    before(async function() {
        try{
            await db.authenticate();
        } catch(err) {
            console.log(err);
        }
    });

    it("matches the RSS feed", async function(){
        // this.timeout(40000);
        const res = await chai.request(app).get("/node");
        const data = await nodeCallApi.callApi();
        
        res.body.items.forEach((item, index) => {
            chai.assert.equal(item.guid, data.items[index].guid);
        })
        
    });

     it("matches stats", async function(){
        const res = await chai.request(app).get("/stats");
        const data = await axios.get()
     });  

});

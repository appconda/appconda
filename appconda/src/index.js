const BaseService = require('./BaseService');

global['BaseService'] = BaseService;
global['RealmoceanService'] = BaseService;

const express = require('express');

const axios = require('axios');




var fs = require('fs');
var path = require('path');
var cron = require('node-cron');
// In newer Node.js versions where process is already global this isn't necessary.
var process = require("process");
const { Container } = require('./Container');


var moveFrom = "./src/services";
var coreServices = "./src/core";

const app = express();

const container = new Container();

const filenames = fs.readdirSync(coreServices);
filenames.forEach(function (file, index) {
  // Make one pass and make the file complete
  var fromPath = path.join(coreServices, file);

  const stat = fs.statSync(fromPath);

  if (stat.isFile()) {
   
    const service = require(path.resolve(fromPath));
    container.registerService(service.Name, service);

  }

  else if (stat.isDirectory())
    console.log(fromPath);
});



const userServices = fs.readdirSync(moveFrom);
userServices.forEach(function (file, index) {

  if (!file.startsWith('_')) {
    // Make one pass and make the file complete
    var fromPath = path.join(moveFrom, file);

    const stat = fs.statSync(fromPath);

    if (stat.isFile()) {
   
      const service = require(path.resolve(fromPath));
      container.registerService(service.Name, service);

    }

    else if (stat.isDirectory())
      console.log(fromPath);
  }
});




console.log('initing')
container.init();





/* cron.schedule('* * * * *', async () => {
  const client = new clientService();
  client
    .setEndpoint('http://realmocean-dev/v1');

  let teams = new teamsService(client);

  const result = await teams.list();
  console.log(result)
}); */

app.get("/", async (req, res) => {

  const client = new clientService();
  client
    .setEndpoint('http://realmocean-dev/v1')
    .setProject('the');

  let teams = new teamsService(client);

  const result = await teams.list();


  return res.json(result);
});



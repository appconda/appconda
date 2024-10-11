
import { BaseService } from './BaseService';
import { BaseComponent } from './BaseComponent';

(global as any)['BaseService'] = BaseService;
(global as any)['RealmoceanService'] = BaseService;

(global as any)['BaseComponent'] = BaseComponent;

import express from 'express';
import { Container } from './Container';
import { ComponentsContainer } from './ComponentsContainer';


var isNumber = require('is-number');
const axios = require('axios');

const handlebars = require('handlebars');
const asyncHelpers = require('handlebars-async-helpers')



const hb = asyncHelpers(handlebars);
hb.registerHelper('mul', async (a, b) => {
  if (!isNumber(a)) {
    throw new TypeError('expected the first argument to be a number');
  }
  if (!isNumber(b)) {
    throw new TypeError('expected the second argument to be a number');
  }
  return Number(a) * Number(b);
})
var objectPath = require("object-path");

var fs = require('fs');
var path = require('path');
var cron = require('node-cron');
// In newer Node.js versions where process is already global this isn't necessary.
var process = require("process");

//console.log(process.env);

var moveFrom = "./src/services";
var coreServices = "./src/core";
const coreComponentsDir = "./src/core-components";
const componentsDir = "./src/components";

const indexIgnoreList: string[] = [
  'config.js', 'config.ts',
  'tsconfig.json'
]

const app = express();


const componentsContainer = new ComponentsContainer();
const container = new Container(componentsContainer);

function loadComponents(directory) {
  console.log('Directory:', directory);
  // Read the contents of the directory synchronously
  const files = fs.readdirSync(directory, { withFileTypes: true });

  files.forEach(file => {
    const filePath = path.join(directory, file.name);
    if (file.isDirectory()) {

      // Recursive call for sub-directories
      loadComponents(filePath);
    } else {
      console.log(filePath);
      const component = require(path.resolve(filePath));
      console.log(component);
      componentsContainer.registerComponent(container, component.default);

    }
  });
}

const services = require('./services/config/services');

for (const [key, value] of Object.entries(services)) {
  const service = value as any;
  const fromPath = path.join(__dirname, 'services', service.service);

  const stat = fs.statSync(fromPath);

  if (stat.isFile()) {

    const service = require(path.resolve(fromPath));
    container.registerService(service.default);
    //console.log(service.default);
  }

  else if (stat.isDirectory())
    console.log(fromPath);
}


(async () => {
  await container.init();
})();

import { ExpressApp } from "tuval";

ExpressApp.start(80, '0.0.0.0');

var fs = require("fs");
var path = require("path");

var coreServices = "./src/Mods";

const filenames = fs.readdirSync(coreServices);
filenames.forEach(function (file, index) {
  // Make one pass and make the file complete
  var fromPath = path.join(coreServices, file);

  const stat = fs.statSync(fromPath);

  if (stat.isFile()) {
    console.log(path.resolve(fromPath));
    try {
      const service = require(path.resolve(fromPath));
    } catch (e) {
      console.log(e);
    }
  } else if (stat.isDirectory()) console.log(fromPath);
});


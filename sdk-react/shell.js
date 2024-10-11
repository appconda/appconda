


var shell = require('shelljs');

if (shell.exec('npm run wbuild').code !== 0) {
  shell.echo('Build failed');
  shell.exit(1);
}

// shell.cp('-Rf', './dist/index.js', '../runtime/app/realmocean/bios/lib/realmocean-sdk.js');

// shell.exec(`docker cp  ./dist/index.js  realmocean-dev:/usr/src/code/app/realmocean/bios/lib/realmocean-sdk.js`);


// shell.cd('/Users/selimtan/Organizations-New/celminov2');
// shell.exec(`docker-compose restart`);
// 
// shell.cd('/Users/selimtan/Organizations-New/atlaas');
// shell.exec(`docker-compose restart`);

shell.echo(`All done.`);
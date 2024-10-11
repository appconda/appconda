
const manifest = require('./src/manifest');
const appName = manifest.application.name;
const libraryName = manifest.application.libraryName;
const container_name = manifest.application.docker_container_name;

var shell = require('shelljs');

if (shell.exec('npm run wbuild').code !== 0) {
    shell.echo('Build failed');
    shell.exit(1);
}


shell.cp('-Rf', './dist/index.js', '../runtime/app/realmocean/bios/lib/realmocean-ui.js');


shell.cd('../runtime');
shell.exec(`docker-compose restart`);

shell.echo(`All done.`);
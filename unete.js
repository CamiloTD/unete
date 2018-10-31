#!/usr/bin/env node
let cli = require('commander');
let path = require('path');
let Router = require('./router');

cli.version('0.1.0')
   .option('-p, --port <port>', 'Set port')
   .option('-m, --module <filename>', 'Set module to export')
   .parse(process.argv);
let  port   = cli.port;

if(!port) throw "PORT_EXPECTED";

let _module = require(path.join(process.cwd(), cli.module || 'index.js'));

let router = new Router(_module, { port });

(async () => {
    await router.serve();
    console.log("Microservice running at port :" + port);
})();
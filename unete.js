#!/usr/bin/env node
let cli = require('commander');
let path = require('path');
let Router = require('./router');
let Connector = require('./connector');
let repl = require('repl');

cli.version('0.1.0')
   .option('-c, --connect <url>', 'Connect to unete service')
   .option('-p, --port <port>', 'Set port')
   .option('-m, --module <filename>', 'Set module to export')
   .parse(process.argv);
let { port, connect }  = cli;


if(connect) {
    console.log(`Connecting to ${connect}...`);

    (async () => {
        let client = await Connector(connect);

        const r = repl.start({
            prompt: 'unete> ',
            eval: async (cmd, ctx, filename, cb) => {
                if(cmd.trim() === "exit") process.exit(0);

                try {
                    let rs = await eval('client.' + cmd);

                    cb(null, rs);
                } catch (exc) {
                    cb(exc);
                }
            }
        });
    })();

    return;
}

if(!port) throw "PORT_EXPECTED";

let _module = require(path.join(process.cwd(), cli.module || 'index.js'));

let router = new Router(_module, { port });

(async () => {
    await router.serve();
    console.log("Microservice running at port :" + port);
})();
let Service = require('./service');
let EventEmitter = require('events');
let getPort = require('get-port');
let http = require('http');
let url = require('url');
let qs  = require('querystring');

class Router extends EventEmitter {

    constructor (_module, config = {}) {
        super();

        this.service = new Service(_module);
        this.port = config.port;
    }

    route (url, args) {
        return this.service.execute(url, args);
    }

    async serve () {
        let { port } = this;
        
        let server = http.createServer(async (rq, rs) => {
            let _url = url.parse(rq.url);
            let args, json;

            try {
                if (rq.method === 'POST') {
                    let str = "";
                    args = await (new Promise((resolve, reject) => {
                        rq.on('data', (data) => str += data.toString());
                        rq.on('end', () => {
                            try {
                                resolve(JSON.parse(str));
                            } catch (exc) {
                                reject(exc);
                            }
                        });
                    }));
                } else throw "METHOD_UNSUPPORTED";

                json = {
                    status: "ok",
                    result: await this.route(_url.pathname, args)
                };
            } catch (exc) {
                json = {
                    status: "err",
                    result: exc
                };
            }

            rs.setHeader('Access-Control-Allow-Origin', '*');
            rs.setHeader('Access-Control-Request-Method', '*');
            rs.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            rs.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
            rs.setHeader('Access-Control-Allow-Credentials', true);

            rs.end(JSON.stringify(json));
        });
        
        server.listen(port, () => {
            this.emit('listening', port);
        });
    }

}

module.exports = Router;

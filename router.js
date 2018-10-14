let Service = require('./service');
let EventEmitter = require('events');
let getPort = require('get-port');
let http = require('http');
let url = require('url');
let qs  = require('querystring');
let AES = require('aes256');

class Router extends EventEmitter {

    constructor (_module, config = {}) {
        super();

        this.services = { 'main': new Service(_module) };
        this.port = config.port;
        this.key = config.key;
    }

    decode (e) { 
        return this.key? AES.decrypt(this.key, e) : e;
    }

    encode (e) {
        return this.key? AES.encrypt(this.key, e) : e;
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
                                resolve(JSON.parse(this.decode(str)));
                            } catch (exc) {
                                reject("UNAUTHORIZED");
                            }
                        });
                    }));
                } else throw "METHOD_UNSUPPORTED";

                if(!args.service)
                    throw "INVALID_SERVICE";

                let result = await this.services[args.service].execute(_url.pathname, args.arguments);

                json = { status: "ok", result: result };
            } catch (exc) {
                json = { status: "err", result: exc };
            }

            rs.end(this.encode(JSON.stringify(json)));
        });
        
        server.listen(port, () => {
            this.emit('listening', port);
        });
    }

}

module.exports = Router;
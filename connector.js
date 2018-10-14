const request = require('request-promise');
let AES = require('aes256');

class Connector {

    constructor (url, config = {}) {
        this.host = url;
        this.map = {};
        this.key = config.key;
        this.service = config.service || "main";
    }

    decode (e) { 
        return this.key? AES.decrypt(this.key, e) : e;
    }

    encode (e) {
        return this.key? AES.encrypt(this.key, e) : e;
    }

    async init () {
        let map = await this.post('/');
        this.map = this.unmap(map);
    }

    async post (method, data = []) {
        let response = await request({
            method: 'POST',
            uri: `${this.host}${method}`,
            body: this.encode(JSON.stringify({
                service: this.service,
                arguments: data
            }))
        });

        try {
            response = JSON.parse(this.decode(response))
        } catch (exc) {
            throw "UNAUTHORIZED";
        }

        if(response.status === "err") throw response.result;

        return response.result;
    }

    unmap (array) {
        let map = {};

        array.forEach((url) => {
            let keys = url.split('/');
            let ref  = map;

            for(let i=0, l=keys.length - 1;i<l;i++) {
                let key = keys[i];
                if(!key) continue;
                
                ref = map[key];

                if(!ref)
                    ref = map[key] = {};
            }

            let key = keys[keys.length - 1];

            ref[key] = (...data) => this.post(url, data);
        });

        return map;
    }

}

module.exports = async (url, config) => {
    let connector = new Connector(url, config);

    await connector.init();

    return connector.map;
};
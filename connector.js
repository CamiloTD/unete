const request = require('request-promise');

class Connector {

    constructor (url) {
        this.host = url;
        this.map = {};
    }

    async init () {
        let map = await this.post('/');
        this.map = this.unmap(map);
    }

    async post (method, data = []) {
        let response = await request({
            method: 'POST',
            uri: `${this.host}${method}`,
            body: data,
            json: true
        });

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

module.exports = async (url) => {
    let connector = new Connector(url);

    await connector.init();

    return connector.map;
};
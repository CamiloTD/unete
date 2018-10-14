let { Connector, Router } = require('..');
let service = new Router(require('./microservice'), { port: 5500 });

(async () => {
    await service.serve();

    let API = await Connector('http://localhost:5500');

    console.log(await API.add(2, 2));
})();
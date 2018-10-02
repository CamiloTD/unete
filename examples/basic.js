const Router = require('../router');
const Connector = require('../connector');

let server = new Router({
    name: "Camilo",
    last_name: "Torres",
    details: {
        age: 20,
        gender: true,
        say: (text) => {
            console.log("Camilo says: " + text);

            return true;
        }
    }
}, { port: 7000 });

const expose = new Router({
    getMap: () => [0,1,2,3].map(n => n * 100) 
}, {port: 7777})

server.on('listening', (port) => {
    console.log("Server listening at: 0.0.0.0:" + port);
});

(async () => {
    await server.serve();

    let client = await Connector('http://localhost:7000');

    console.log(await client.getMap());
})();
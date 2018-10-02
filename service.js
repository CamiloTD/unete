class Service {

    constructor (_module, config = {}) {
        this.module = _module;
        this.map = Service.map(_module);
    }

    async execute (url, args = []) {
        let method = this.map[url];

        if(!method)
            throw { statusCode: 404, code: 'METHOD_NOT_FOUND', method: url };

        return await method(...args);
    }

}

/* Maps an object into url routes */

Service.map = (_module, base_route = '') => {
    let routes = {};
    let nc_module = no_circular(_module);

    for(let i in nc_module) {
        let sub_module = nc_module[i];
        let route = base_route + '/' + i;

        if(typeof sub_module === "function")
            routes[route] = sub_module;
        else if(typeof sub_module === "object" && !Array.isArray(sub_module))
            routes = { ...routes, ...Service.map(sub_module, route) };
        else
            routes[route] = () => sub_module;
    }

    let keys = Object.keys(routes);
    if(!base_route)
        routes['/'] = () => keys;

    return routes;
}

function no_circular (obj, set = new Set()) {
    let o = {};

    for(let i in obj) {
        if(set.has(obj[i])) continue;
        if(typeof obj[i] === "object"){
            set.add(obj[i]);
            o[i] = no_circular(obj[i], set);
        } else o[i] = obj[i];
    }

    return o;
}

module.exports = Service;
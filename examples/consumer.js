let { Connector } = require('unete');

(async () => {
	let math = Connector('http://localhost:5000');
	// *math* will inherit all methods from the microservice located in that port
	
	console.log(await math.add(2, 5));  // 7
	console.log(await math.sub(5, 2));  // 3
	console.log(await math.mul(5, 2)); // 10
	console.log(await math.div(8/2)); // 4
})();
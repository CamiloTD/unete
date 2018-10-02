# Unete

Unete is a network library that lets you to create microservices and access them from other applications in a transparent way.

**Installation:** `npm install -g unete`

### Usage Example:

Let's create a small math microservice.

First, we need to create our module, so, let's create for example... **microservice.js**

**/microservice.js:** 

```js
// Microservice that adds, subs, multiply and divide
exports.add = (a, b) => a + b;
exports.sub = (a, b) => a - b;
exports.mul = (a, b) => a * b;
exports.div = (a, b) => a / b;
```

Then, we start our service by using:

```batch
unete -m microservice.js -p 5000
```

Now, our service is available as a network javascript library, you can use it in other files by connecting to: `http://localhost:5000/add|sub|mul|div`

Now, let's create our main endpoint:

**consumer.js**
```js
let { Connector } = require('unete');

(async () => {
	let math = await Connector('http://localhost:5000');
    // *math* will inherit all methods from the microservice located in that port
    
	console.log(await math.add(2, 5));  // 7
	console.log(await math.sub(5, 2));  // 3
	console.log(await math.mul(5, 2)); // 10
	console.log(await math.div(8, 2)); // 4
})();
```

Then we run: `node consumer.js` and our endpoint will consume the functions stored in the microservice.js, without defining anything, no more **calls**, no more **requests**, no more **urls**, just... native javascript!
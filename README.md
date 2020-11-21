# logic_fn

parse custom logic expression into javascript eval function

minified size: 567 bytes in [dist/logic_fn.min.js](dist/logic_fn.min.js)  
4 times smaller than [logical-expression-parser](https://github.com/NimitzDEV/logical-expression-parser) with [2.3 kiloByte](https://bundlephobia.com/result?p=logical-expression-parser) minified bundle size

## install

in your node.js project

```sh
npm i -D https://github.com/milahu/logic_fn.git
```

## use

```js
var logic_fn = require('logic_fn');

// generate logic function
var f = logic_fn('a & (b | c)');

// use logic function
if (f({ a: 1, b: 1 })) {
	console.log('expression "a & (b | c)" is true for a=1 and b=1');
}

// convert result to boolean
var b = Boolean(f({ a: 1, b: 1 }));
if (b === true) {
	console.log('yes');
}
```

see [test/test.js](test/test.js) for more samples

## license

CC0-1.0 = creative commons zero 1.0

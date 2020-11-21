# logic_fn

parse custom logic expression into javascript eval function

use case: test complex boolean expressions  
for example: filter a search result by tags

minified size: 687 bytes in [dist/logic_fn.min.esm.js](dist/logic_fn.min.esm.js)  
4 times smaller than [logical-expression-parser](https://github.com/NimitzDEV/logical-expression-parser) with [2.3 kiloByte](https://bundlephobia.com/result?p=logical-expression-parser) minified bundle size

warning: do not use in critical server code  
otherwise you risk arbitrary code execution  
(until now, no exploit was found)

## install

in your node.js project

```sh
npm install https://github.com/milahu/logic_fn
```

## use

```js
var { logic_fn } = require('logic_fn'); // node.js commonJS module
//import { logic_fn } from 'logic_fn'; // es6 module

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

## data types

different data types need different get functions  
these are configured with a prefix- and suffix-string:  
`{ get: ['getter_prefix', 'getter_suffix'] }`

```js
// default config
// input type: object
var f = logic_fn('a', { get: ['i[', ']'] });
var i = { 'a': 1 };
var r = f(i); // r === 1
// logic operators internally convert to boolean
// but the result value is taken from the input
// if you need a boolean result, use
var r = Boolean(f(i)); // r === true

// to use other data types, change the 'get' option

// convert every literal to boolean (slow)
var f = logic_fn('a', { get: ['Boolean(i[', '])'] });
var i = { 'a': 1 };
var r = f(i); // r === true

// input type: object
// values can be false, only check if property is set
var f = logic_fn('a', { get: ['i.hasOwnProperty(', ')'] });
var i = { 'a': false };
var r = f(i); // r === true

// input type: set, map
var f = logic_fn('a', { get: ['i.has(', ')'] });
var i = new Set(['a']);
var r = f(i); // r === true

// input type: array, string
var f = logic_fn('a', { get: ['i.includes(', ')'] });
var i = ['a'];
var r = f(i); // r === true

// input type: custom object
// the literal value 'a' is passed to the function (l => i[l] == "yes")
var f = logic_fn('a', { get: ['(l => i[l] == "yes")(', ')'] });
var i = { a: 'yes' };
var r = f(i); // r === true
```

## empty value

if the generated expression is empty  
the logic-function returns `undefined`

this value/expression can be changed  
with the `fallback` option

```js
var f = logic_fn('');
var i = { a: 1 };
var r = f(i); // r === undefined

var f = logic_fn('', { empty: 'true' });
var i = { a: 1 };
var r = f(i); // r === true

var f = logic_fn('', { empty: 'false' });
var i = { a: 1 };
var r = f(i); // r === false
```

## license

CC0-1.0 = creative commons zero 1.0

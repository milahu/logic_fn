// logic_fn.js
// parse custom logic expression into javascript eval function

// license: CC0-1.0, author: milahu, minified size: 567 bytes
// 4 times smaller than https://github.com/NimitzDEV/logical-expression-parser
// usage: see test.js

// WARNING do not use in critical server code
// otherwise you risk arbitrary code execution

// TODO support nested input objects
// var f = logic_fn('a.a'); f({ a: { a: 1 } })
// for now, the literal a.a is always converted to i["a.a"]
// so the input must be { "a.a": 1 }

// boolean options: space_is_and (default), space_is_or, return_expr
function logic_fn(e, o) {

  if (typeof o != 'object') o = {};

  const om = { // operator map from custom logic to javascript logic
    // if you change operators
    // you also must change the regular expressions fo and fl
    '&': '&&', 'AND': '&&',
    '|': '||', 'OR': '||',
    '-': '!', '!': '!', 'NOT': '!',
    '(': '(', ')': ')',
  };

  // find operators and literals
  var s = (o.space_is_and || o.space_is_or) ? ' ' : '';
  var fo = new RegExp(' *(['+s+'&|()!-]|AND|OR|NOT) *', 'g');
  var fl = new RegExp('([^'+s+'&|()!-]+)', 'g');

  // replace operators and literals
  function ro(m, o) { 
    return om[o];
  }
  function rl(m, l) {
    if (l in om) return l; // l is operator
    return 'i["'+l.replace(/"/g, '\\"')+'"]'; // i = input object
  }

  // space is and by default
  om[' '] = o.space_is_and ? '&&' : o.space_is_or ? '||' : '&&';

  // replace operators first to consume whitespace
  e = e.trim().replace(fo, ro).replace(fl, rl);

  // remove empty parenthesis
  var l = e.length;
  while (true) {
    e = e.replace(/\(\)/g, '');
    var L = e.length;
    if (L == l) break;
    l = L;
  }

  if (o.return_expr) return e;
  return new Function('i', `return ${e};`);
};

module.exports = logic_fn;

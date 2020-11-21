var { logic_fn } = require('../');

function te(n, e, o, r) { // test expression
  var R = logic_fn(e, {...o, return_expr: 1});
  if (r == R)
    console.log('pass '+n, {e, o});
  else {
    console.log('FAIL '+n, {e, o});
    console.log('     expected: '+r);
    console.log('     actual:   '+R);
  }
}

te('whitespace literals', 'a b', {}, 'i["a b"]');
te('fn', 'a&(b|c)', {}, 'i["a"]&&(i["b"]||i["c"])');
te('multi whitespace', 'a  b', {}, 'i["a  b"]');
te('multi whitespace and', 'a  b', {space_is_and: 1}, 'i["a"]&&i["b"]');
te('multi whitespace or', 'a  b', {space_is_or: 1}, 'i["a"]||i["b"]');
te('space and', 'a&(b | c)', {space_is_and: 1}, 'i["a"]&&(i["b"]||i["c"])');
te('space or', 'a&(b | c)', {space_is_or: 1}, 'i["a"]&&(i["b"]||i["c"])');
te('negation', 'a|(!b&-c)', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('much whitespace', '  a  |  (  !  b  &  -  c  )  ', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('long operators 1', 'a OR (NOT b AND NOT c)', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('long operators 2', 'a  OR  (  NOT  b  AND  NOT  c  )', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('empty parenthesis', 'a(())', {}, 'i["a"]');



function ts(e, o) { // test syntax errors
  try {
    logic_fn(e, o);
  }
  catch (error) {
    if (error.constructor.name == 'SyntaxError')
      console.log('pass throw SyntaxError', {e, o});
    else
      console.log('FAIL throw SyntaxError', {e, o});
  }
}
ts('a&(b|c) )', {});
ts('a&&(b|c)', {});
ts('a&((b|c)', {});
ts('a&(b||c)', {});
ts('&', {});
ts('|', {});
ts('-', {});



function tf(e, o, i, r) { // test function
  var f = logic_fn(e, o);
  if (Boolean(f(i)) == r) {
    console.log('pass', e, o, i, r);
  }
  else {
    console.log('FAIL', e, o, i, r);
  }
}

// data type: object -> boolean(property) (default)
tf('a&(b|c)', {}, {a: 1, b: 1}, true);
tf('a&(b|c)', {}, {a: 1, b: 0}, false);
tf('a', {}, {a: 1}, true);
tf('!a', {}, {a: 1}, false);
tf('-a', {}, {a: 1}, false);
tf('NOT a', {}, {a: 1}, false);
tf('NOT(NOT a)', {}, {a: 1}, true);
tf('NOT(NOT(NOT a))', {}, {a: 1}, false);
tf('a.a', {}, {'a.a': 1}, true); // (not) nested property
tf('a(())', {}, {'a': 1}, true); // empty parenthesis

//   ['i[', ']']                 // object -> boolean(value) (default)
//   ['i.hasOwnProperty(', ')']  // object -> has key?
//   ['i.has(', ')']             // set/map -> has value?
//   ['i.includes(', ')']        // array/string -> has value/substring?


// data type: object -> boolean(value) (explicit)
tf('a&b&!c', {convert: ['i[', ']']}, { a: 1, b: 1 }, true);

// data type: object -> has key?
tf('a&b&!c', {convert: ['i.hasOwnProperty(', ')']}, { a: 0, b: false }, true);

// data type: set/map -> has value?
tf('a&b&!c', {convert: ['i.has(', ')']}, new Set(['a', 'b']), true);
tf('a&b&!c', {convert: ['i.has(', ')']}, new Map([['a', 0], ['b', false]]), true);

// data type: array/string -> has value/substring?
tf('a&b&!c', {convert: ['i.includes(', ')']}, ['a', 'b'], true);
tf('a&b&!c', {convert: ['i.includes(', ')']}, "abde", true);

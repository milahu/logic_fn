var { logic_fn } = require('../');

const num = { total: 0, pass: 0, fail: 0 };

function te(n, e, o, r) { // test expression
  var R = logic_fn(e, {...o, return_expr: 1});
  if (r == R) {
    console.log('pass '+n, {e, o});
    num.pass++;
  }
  else {
    console.log('FAIL '+n, {e, o});
    console.log('     expected: '+r);
    console.log('     actual:   '+R);
    num.fail++;
  }
  num.total++;
}



te('whitespace literals', 'a b', {}, 'i["a b"]');
te('fn', 'a&(b|c)', {}, 'i["a"]&&(i["b"]||i["c"])');
te('multi whitespace', 'a  b', {}, 'i["a  b"]');

te('multi whitespace and', 'a  b', {space_is_and: 1}, 'i["a"]&&i["b"]');
te('multi whitespace or', 'a  b', {space_is_or: 1}, 'i["a"]||i["b"]');

te('space and', 'a b', {space_is_and: 1}, 'i["a"]&&i["b"]');
te('space or', 'a b', {space_is_or: 1}, 'i["a"]||i["b"]');

te('space and nop', 'a&(b | c)', {space_is_and: 1}, 'i["a"]&&(i["b"]||i["c"])');
te('space or nop', 'a&(b | c)', {space_is_or: 1}, 'i["a"]&&(i["b"]||i["c"])');

te('quoted space', '"a b"', {}, 'i["a b"]');
te('quoted space with space_is_and', '"a b"', {space_is_and: 1}, 'i["a b"]');
te('quoted space with space_is_or', '"a b"', {space_is_or: 1}, 'i["a b"]');
te('quoted space multi', '"a b" "c d" "e f" "g h"', {space_is_and: 1}, 'i["a b"]&&i["c d"]&&i["e f"]&&i["g h"]');

te('quotes unbalanced', '"a b" "c d', {space_is_and: 1}, 'i["a b"]&&"i["c"]&&i["d"]');
// with return_expr=1, syntax error is not detected

te('negation', 'a|(!b&-c)', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('much whitespace', '  a  |  (  !  b  &  -  c  )  ', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('long operators 1', 'a OR (NOT b AND NOT c)', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('long operators 2', 'a  OR  (  NOT  b  AND  NOT  c  )', {}, 'i["a"]||(!i["b"]&&!i["c"])');
te('empty parenthesis', 'a()', {}, 'i["a"]&&()');
te('empty parenthesis 2', 'a(())', {}, 'i["a"]&&(())');
te('escaped escape', 'a\\\\b', {}, 'i["a\\b"]');
te('escaped operator !', '\\!a', {}, 'i["!a"]');
te('escaped operator &', '\\&a', {}, 'i["&a"]');
te('escaped operator |', '\\|a', {}, 'i["|a"]');
te('escaped operator -', '\\-a', {}, 'i["-a"]');
te('escaped operator (', '\\(a', {}, 'i["(a"]');
te('escaped operator )', '\\)a', {}, 'i[")a"]');

te('escaped operator "', '\\"a', {}, 'i["\\"a"]');
te("escaped operator '", "\\'a", {}, 'i["\'a"]');

te('escaped operator AND', '\\AND', {}, 'i["AND"]');
te('escaped operator OR', '\\OR', {}, 'i["OR"]');
te('escaped operator NOT', '\\NOT', {}, 'i["NOT"]');

te('concatted parens', '(a&b)(c&d)', {}, '(i["a"]&&i["b"])&&(i["c"]&&i["d"])');
te('concatted parens', 'a(b&c)', {}, 'i["a"]&&(i["b"]&&i["c"])');
te('concatted parens', 'a!(b&c)', {}, 'i["a"]&&!(i["b"]&&i["c"])');
// correct syntax <-- function call

function ts(e, o) { // test syntax errors
  try {
    logic_fn(e, o);
    console.log('FAIL throw SyntaxError', {e, o});
    console.log('     actual result: no syntax error');
    console.log('     result expr: ' + logic_fn(e, {...o, return_expr: 1}));
    num.fail++;
  }
  catch (error) {
    if (error.constructor.name == 'SyntaxError') {
      console.log('pass throw SyntaxError', {e, o});
      num.pass++;
    }
    else {
      console.log('FAIL throw SyntaxError', {e, o});
      console.log('actual error:', error);
      num.fail++;
    }
  }
  num.total++;
}

ts('a&(b|c) )', {});
ts('a&&(b|c)', {});
ts('a&((b|c)', {});
ts('a&(b||c)', {});
ts('&', {});
ts('|', {});
ts('-', {});
ts('"', {}); // quotes unbalanced
ts('"a b" "c d', {}); // quotes unbalanced

ts('a()', {}); // empty parenthesis --> function call --> dangerous!
ts('a(())', {}); // double empty parenthesis



function tf(e, o, i, r) { // test function
  var f = logic_fn(e, o);
  if (f(i) === r) {
    console.log('pass', e, o, i, r);
    num.pass++;
  }
  else {
    console.log('FAIL', e, o, i, r);
    console.log('     expected', r);
    console.log('     actual  ', f(i));
    num.fail++;
  }
  num.total++;
}

// data type: object -> boolean(property) (default)
tf('a&(b|c)', {}, {a: 1, b: 1}, 1);
tf('a&(b|c)', {}, {a: 1, b: 0}, undefined);
tf('a', {}, {a: 1}, 1);
tf('!a', {}, {a: 1}, false);
tf('-a', {}, {a: 1}, false);
tf('NOT a', {}, {a: 1}, false);
tf('NOT(NOT a)', {}, {a: 1}, true);
tf('NOT(NOT(NOT a))', {}, {a: 1}, false);
tf('a.a', {}, {'a.a': 1}, 1); // (not) nested property
//tf('a(())', {}, {'a': 1}, 1); // empty parenthesis

// data type: object -> boolean(value) (explicit)
tf('a&b&!c', {get: ['i[', ']']}, { a: 1, b: 1 }, true);

// data type: object -> has key?
te('concatted parens', 'a(b&c)', {}, 'i["a"]&&(i["b"]&&i["c"])');

te('a&b&!c hasOwnProperty', 'a&b&!c', {get: ['i.hasOwnProperty(', ')']},
  'i.hasOwnProperty("a")&&i.hasOwnProperty("b")&&!i.hasOwnProperty("c")');
tf('a&b&!c', {get: ['i.hasOwnProperty(', ')']}, { a: 0, b: false }, true);

// data type: set/map -> has value?
te('a&b&!c has', 'a&b&!c', {get: ['i.has(', ')']},
  'i.has("a")&&i.has("b")&&!i.has("c")');
tf('a&b&!c', {get: ['i.has(', ')']}, new Set(['a', 'b']), true);
tf('a&b&!c', {get: ['i.has(', ')']}, new Map([['a', 0], ['b', false]]), true);

// data type: array/string -> has value/substring?
te('a&b&!c includes', 'a&b&!c', {get: ['i.includes(', ')']},
  'i.includes("a")&&i.includes("b")&&!i.includes("c")');
tf('a&b&!c', {get: ['i.includes(', ')']}, ['a', 'b'], true);
tf('a&b&!c', {get: ['i.includes(', ')']}, "abde", true);

// data type: custom object
tf('a&b&!c', {get: ['(l => i[l] == "yes")(', ')']}, { a: 'yes', b: 'yes', c: 'no'}, true);

// empty expressions
tf('', {}, {a: 1}, undefined);
//tf('', { empty: 'true' }, {a: 1}, true);
//tf('', { empty: 'false' }, {a: 1}, false);



function tl(n, e, o, r) { // test literals
  var R = logic_fn(e, {...o, return_literals: 1});
  let failed = false;
  let i;
  for (i = 0; i < r.length; i++) {
    if (r[i] != R[i]) {
      failed = true;
      break;
    }
  }
  if (failed) {
    console.log('FAIL '+n, {e, o});
    console.log('     at index '+i);
    console.log('     expected: '+r);
    console.log('     actual:   '+R);
    console.log('     expr: '+logic_fn(e, {...o, return_expr: 1}));
    num.fail++;
  }
  else {
    console.log('pass '+n, {e, o});
    num.pass++;
  }
  num.total++;
}

tl('lit 1', 'a & b | c | d', {}, ['a', 'b', 'c', 'd'])
tl('lit 2', '\\"a & b\\"', {}, ['"a', 'b"'])
tl('lit 3', '\\(c | d\\)', {}, ['(c', 'd)'])
tl('lit 4', "\\'a & b\\'", {}, ["'a", "b'"])
//tl('lit 5', "\\[c | d\\]", {}, ['[c', 'd]']) // square braces are not handled

console.log(`passed ${num.pass} of ${num.total} tests = ${(num.pass / num.total * 100)|0}%`);




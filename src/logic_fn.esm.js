// logic_fn.js
// parse custom logic expression into javascript eval function

// license: CC0-1.0, author: milahu, minified size: 687 bytes
// 4 times smaller than https://github.com/NimitzDEV/logical-expression-parser
// usage: see test.js

// WARNING do not use in critical server code
// otherwise you risk arbitrary code execution
// (until now, no exploit was found)

// TODO benchmark vs https://github.com/NimitzDEV/logical-expression-parser
// especially time calls to generated functions = hot code, called very often

// TODO support nested input objects
// var f = logic_fn('a.a'); f({ a: { a: 1 } })
// for now, the literal a.a is always geted to "a.a"

// TODO allow to configure an object/map/table
// of getter functions, for different literal values
// including a default/fallback getter function

// TODO support compare-operators: 0 < a, a < 10

// similar projects
// https://github.com/joewalnes/filtrex [100 KB, many features]
// https://github.com/NimitzDEV/logical-expression-parser [2.5 KB, slow?]
// https://github.com/bloomtime/boolean-expression-js [old, incomplete]

// TODO support kebab-case-literals
// currently are parsed into kebab NOT case NOT literals --> syntax error
// --> detect minus between two literals?

// boolean options: space_is_and (default), space_is_or, return_expr
// option get: how to convert literal to boolean result. samples:
//   ['i[', ']']                    // object -> boolean(value) (default)
//   ['i.hasOwnProperty(', ')']     // object -> has key?
//   ['i.has(', ')']                // set/map -> has value?
//   ['i.includes(', ')']           // array/string -> has value/substring?
//   ['(l => i.includes(l))(', ')'] // custom type -> IIFE result
//   the input variable is always 'i'
// option empty: if generated expression is empty, return custom expression
//   sample values: 'true', 'false'

export function logic_fn(e, o) {

  // init options
  o = o || {};
  o.so = o.space_is_or;
  o.sa = o.space_is_and;
  if (!o.get) o.get = ['i[', ']']; // i = input object

  // preval constants to reduce bundle size
  const {
    om, esc_op, esc_str, fe, fE, ops, strings, fs, rs, fS, rS, fo, ro,
    fl, re, rE, rl, fp, rp, fd, rd, esc_dq, fD, rD, fQ, rQ, fq, rq
  } = preval(() => {

    const om = { // operator map from custom logic to javascript logic
      // if you change operators
      // you also must change the regular expressions fo and fl
      // identic mappings are needed to consume whitespace around operators
      '&': '&&', 'AND': '&&',
      '|': '||', 'OR': '||',
      '-': '!', '!': '!', 'NOT': '!',
      '(': '(', ')': ')', '\\': '\\',
      //'"': '"', "'": "'"
    };

    const esc_op = '\x01';
    const esc_str = '\x02';
    const esc_dq = '\x03'; // double quote
    const esc_sq = '\x04'; // single quote

    // compile fn
    function re_or(o) {
      return Object.keys(o).map(v => v.replace(/[|()\\]/g, m => '\\'+m)).join('|');
    }

    // compile fn
    function re_chars(o) {
      const a = Object.keys(o);
      const r = a.filter(v => v.length == 1 && v != '-')
        .map(v => v.replace(/[\[\]]/g, m => '\\'+m));
      if (a.includes('-')) r.push('-'); // minus must be last char
      return r.join('').replace(/\\/g, '\\\\');
    }

    // find and replace

    // escape operators
    const fe = new RegExp('\\\\('+ re_or(om) +')', 'g');
    const fE = new RegExp(esc_op, 'g');

    const fd = new RegExp('\\\\"', 'g');
    const rd = esc_dq;

    const fq = new RegExp("\\\\'", 'g');
    const rq = esc_sq;

    // escape strings
    const ops = [];
    const strings = [];
    const fs = /"([^"]*)"/g;
    function rs(m, s) { strings.push(s); return esc_str }
    const fS = new RegExp(esc_str, 'g');
    function rS() { return strings.shift() }

    // replace operators
    const fo = new RegExp(' *([^ \\\\]?)(' + re_or(om) + ') *', 'g'); // ignore escaped operators?
    function ro(m, b, o) {
      //console.dir(['o', m, o]);
      return b + om[o]
    }

    // replace literals
    const fl = new RegExp('[^"'+re_chars(om)+']+', 'g'); // exclude quotes

    // const?

    function re(m, s) { ops.push(s); return esc_op }
    function rE() { return ops.shift() }

    const fD = new RegExp(esc_dq, 'g');
    const rD = '\\"';

    const fQ = new RegExp(esc_sq, 'g');
    //const rQ = "\\'";
    const rQ = "'";

    function rl(l) {
      //console.dir(['l', l]);
      if (l in om) return l; // l is operator
      l = l.replace(fD, rD).replace(fQ, rQ);
      //return o.get[0] + '"'+l+'"' + o.get[1];
      return o.get[0] + '"'+l+'"' + o.get[1];
      //return o.get[0] + '"'+l.replace(/"/g, '\\"')+'"' + o.get[1];
      // do we need the escape?
    }

    // add operator before parens
    const fp = /([^!&|(])(!*)\(/g;
    function rp(m, b, n) {
      return b+'&&'+n+'('; // default and
    }

    return {
      om, esc_op, esc_str, fe, fE, ops, strings, fs, rs, fS, rS, fo, ro,
      fl, re, rE, rl, fp, rp, fd, rd, esc_dq, fD, rD, fQ, rQ, fq, rq
    };

  });

  // o is known at runtime

  // replace whitespace
  const fw = (o.sa || o.so) ? / +/g : null;
  const rw = o.sa ? '&&' : '||';

  // Some people, when confronted with a problem, think
  // "I know, I'll use regular expressions." Now they have two problems.
  // in this case, 10 problems:

  e = e // replace operators first to consume whitespace
    .trim() // remove outer whitespace
    .replace(fe, re) // escape operators
    .replace(fd, rd) // escape double quotes
    .replace(fq, rq) // escape single quotes
    .replace(fs, rs) // escape strings
    .replace(fo, ro) // replace operators
    .replace(fw, rw) // replace whitespace
    .replace(fp, rp) // fix parens
    .replace(fl, rl) // replace literals
    .replace(fE, rE) // unescape operators
    .replace(fS, rS) // unescape strings
  ;

  /*
  // remove empty parenthesis
  var l = e.length;
  while (true) {
    e = e.replace(/\(\)/g, '');
    var L = e.length;
    if (L == l) break;
    l = L;
  }
  */

  //if (e == '' && o.empty) e = o.empty; // otherwise, return undefined

  if (o.return_expr) return e;
  if (o.return_literals) { // to validate expression
    const l2 = [];
    e.replace(/i\["(.*?)"\]/g, (m, l) => l2.push(l.replace(/\\"/g, '"')));
    return l2;
  }
  return new Function('i', `return ${e};`);
};

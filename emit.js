function codepen() {



}

function emitFn() {



}

function block( prelude, lines ) {

  var code = prelude + " {\n";

  for ( var c = 0; c < lines.length; c++ ) {

    code += "  " + lines[ c ];

  }

  code += "\n}";

  return code;

}

function emitPrimitive() {

  return "var a = 123;";

}

{"lp" ["<" "n" "2"]}

function test() {

  //console.log( emitFn() );

  //console.log( emitPrimitive() );

  console.log( block( "function fib( n )", [emitPrimitive()] ) );

}

test();


/*(ssa* [n]
  [lp (< n 2)
   min1 (- n 1)
   min2 (- n 2)
   fa (recur min1)
   fb (recur min2)
   fc (+ fa fb)]
  (if lp n fc))  */

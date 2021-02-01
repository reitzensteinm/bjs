var fs = require( 'fs' );

//const redis = require("redis");
//const client = redis.createClient();

//console.log( client.set( "hi", "asdf" ) );
//console.log( client.get( 'hi' ) );

const keywords = {};

function intern_keyword( n ) {
	if ( !( n in keywords ) )
		keywords[ n ] = make( keyword, n );
	return keywords[ n ];
}

function gen_message( kw ) {
	return make( vec, [ intern_keyword( kw ) ] );
}

const msgFirst = gen_message( "first" );
const msgRest = gen_message( "rest" );
const msgWrite = gen_message( "write" );
const msgEval = gen_message( "eval" );
const msgPeek = gen_message( "peek" );

const kwApply = intern_keyword( "apply" );
const kwAssoc = intern_keyword( "assoc" );
const kwGet = intern_keyword( "get" );
const kwEquals = intern_keyword( "equals" );
const kwEval = intern_keyword( "eval" );


function truthy( v ) {
		return ( v != nil && !v.equals( make( boolean, false ) ).peek()  );
}

function eq( a, b, e ) {
	return ( a == b ) || (
		truthy( a.equals( b, e ) ) && truthy( b.equals( a, e ) )
	);
}


nil = make(
function nn( data, args, env ) {
	if ( args == msgEval ) {
		return nil;
	} else if ( args == msgPeek ) {
		return null;
	} else if ( args == msgWrite ) {
		return "nil";
	} else if ( args.first() == kwEquals ) {
		return make( boolean, args.rest().first().peek() == null );
	}
}, null );

var clc = 0;

var call_stack = [];

let globalEnv = make( hash_map, [] );
let primEnv = make( hash_map, [] );

function make( f, d ) {

	var mp = function clo ( args, env ) {
						clc++;
						call_stack.push( [f.name,args] );

						try{
							var ret = f( d, args, env );

						} catch (err ) {
							for ( var c = 0; c < call_stack.length; c++ ) {
								console.log( call_stack[ c ][ 0 ] + " " + call_stack[ c ][ 1 ].write() );
							}

							return;
						}


						if ( ret == null || ( ret.assoc == null && typeof( ret ) != "string" ) ) {
							if ( args != msgPeek ) {
								console.log( "Not supported " + args.write() + " " + f.name + " " + d);
								for ( var c = 0; c < call_stack.length; c++ ) {
									console.log( call_stack[ c ][ 0 ] + " " + call_stack[ c ][ 1 ].write() );
								}
								console.log( "***" );
								return nil;
							}
						}

						call_stack.pop();
						return ret;
					}

	mp.first = function( e ) { return mp( msgFirst, e ) };
	mp.rest = function( e ) { return mp( msgRest, e ) };
	mp.write = function( e ) { return mp( msgWrite, e ) };
	mp.peek = function( e ) { return mp( msgPeek, e  ) };
	mp.eval = function( e ) { return mp( msgEval, e ) };

	mp.get = function( v, e ) { return mp( make( vec, [ kwGet, v ] ), e ) };
	mp.equals = function( v, e ) { return mp( make( vec, [ kwEquals, v ] ), e ) };
	mp.apply = function( v, e ) { return mp( make( vec, [ kwApply, v ] ), e ) };

	mp.assoc = function( k, v, e ) { return mp( make( vec, [ kwAssoc, k, v ] ), e ) };

	mp.destructure = function( e ) {
		var arr = [];
		var omp = mp;
		while ( omp.first() != nil ) {
			arr.push( omp.first() );
			omp = omp.rest();
		}
		return arr;
	};

	mp.toString = () => f.name;

	return mp;

}

function boolean( data, args, env ) {

	if ( args == msgEval ) {
		return make( boolean, data );
	} else if ( args == msgWrite ) {
		return "" + data;
	} else if ( args == msgPeek ) {
		return data;
	} else if ( args.first() == kwEquals ) {
		return make( boolean, data == args.rest().first().peek() );
	}

}

function string( data, args, env ) {
		if ( args == msgWrite ) {
			return '"' + data + '"';
		}
}

function keyword ( data, args, env ) {

	if ( args == msgWrite ) {
		return ":" + data;
	} else if ( args == msgPeek ) {
		return data;
	} else if ( args == msgEval ) {
		return make( keyword, data );
	} else if ( args.first() == kwEquals ) {
		return make( boolean, data == args.rest().first().peek() );
	}

}

function hash_map( data, args, env ) {

	if ( args == msgPeek ) {
		return data;
	} else if ( args == msgEval ) {
		var nd = [];
		for ( var c = 0; c < data.length; c++ ) {
			nd.push( [ data[ c ][ 0 ].eval( env ), data[ c ][ 1 ].eval( env ) ] );
		}
		return make( hash_map, nd );
	} else if ( args == msgWrite ) {
		var outs = "{";

		for ( var c = 0; c < data.length; c++ ) {
			outs+= data[ c ][ 0 ].write() + " " + data[ c ][ 1 ].write();

			if ( c < data.length - 1 )
				outs += " ";
		}

		return outs + "}";
	} else if ( args.first() == kwGet ) {


		for ( var c = 0; c < data.length; c++ ) {
			if ( eq( data[ c ][ 0 ], args.rest().first() ) ) {
				return data[ c ][ 1 ];
			}
		}

		return nil;

	} else if ( args.first() == kwAssoc ) {

		var newd = [];

		for ( var c = 0; c < data.length; c++ ) {
			if ( !eq( data[ c ][ 0 ], args.rest().first() ) ) {
				newd.push( data[ c ] );
			}
		}

		newd.push( [ args.rest().first(), args.rest().rest().first() ] );

		return make( hash_map, newd );

	} else if ( args.first() == kwEquals ) {
		return make( boolean, make( hash_map, data ).write() == args.rest().first().write() );
	}

}

function symbol ( data, args, env ) {

		if ( args == msgWrite ) {
			return data;
		} else if ( args == msgEval ) {

			var envs = [ env, globalEnv, primEnv ];

			for ( var c = 0; c < envs.length; c++ ) {
					//Todo: not found?
					var e = envs[ c ].get( make( symbol, data ) );

					if ( e != nil || data == "nil" )
						return e;

			}

			console.log( "NULL VALUE " + data );
			return nil;

		} else if ( args == msgPeek ) {
			return data;
		} else if ( args.first() == kwEquals ) {
			return make( boolean, args.rest().first().peek() == data );
		}

}

function write_with( data, sep ) {

	var sout = sep[ 0 ];

	for ( var c = 0; c < data.length; c++ ) {
		sout += data[ c ]( msgWrite );
		if ( c < data.length - 1 )
			sout += " ";

	}

	return sout + sep[ 1 ];

}

function array_list( t, data, args, env ) {

	if ( args == msgFirst ) {
		return data.length == 0 ? nil : data[ 0 ];
	} else if ( args == msgRest ) {
		return make( t, data.slice( 1 ) );
	} else if ( args.first() == kwEquals ) {
		return make( boolean, make( t, data ).write() == args.rest().first().write() );
	}

}

function vec( data, args, env ) {

	if ( args == msgEval ) {

		var outa = [];

		for ( var c = 0; c < data.length; c++ ) {
			outa.push( data[ c ].eval( env ) );
		}

		return make( vec, outa );

	} else if ( args == msgWrite ) {
		return write_with( data, "[]" );
	} else {
		return array_list( vec, data, args, env );
	}

}

function code( data, args, env ) {

	if ( args == msgEval ) {
		return data[ 0 ].eval( env )( make( vec, [ kwApply ].concat( data.slice( 1 ) ) ), env );
	} else if ( args == msgWrite ) {
		return write_with( data, "()" );
	} else {
		return array_list( vec, data, args, env );
	}
}

function integer( data, args, env ) {

	if ( args == msgEval ) {
		return make( integer, data );
	} else if ( args == msgPeek ) {
		return data;
	} else if ( args == msgWrite ) {
		return "" + data;
	} else if ( args.first() == kwEquals ) {
		return make( boolean, ( args.rest().first().peek() ) == data );
	}

}

function if_ (data, args, env ) {

	if ( args == msgEval ) {
		return make( if_, data );
	} else if ( args == msgWrite ) {
		return "if";
	} else if ( args.first() == kwApply ) {
		var [ _, i, a, b ] = args.destructure();

		if ( truthy( i.eval( env ) ) ){
			return a.eval( env );
		} else {
			return b.eval (env );
		}

	}

}

function prim( data, args, env ) {

	if ( args == msgEval ) {
		return make( prim, data );
	} else if ( args == msgWrite ) {
		return "primitive";
	} else if ( args( msgFirst ) == kwApply ) {

		var nargs = args.destructure();
		var cargs = [];

		cargs.push( env );
		for ( var c = 1; c < nargs.length; c++ ) {
			cargs.push( nargs[ c ].eval( env ) );
		}

		return data.apply( null, cargs );

	}

}


function obj( data, args, env ) {

	if ( args == msgWrite ) {
		return "obj*";// make( string, "fn*");
	} else if ( args.first() == kwApply ) {
		return make( closure, make( vec, [ env, args.rest().first(), args.rest().rest().first(), args.rest().rest().rest().first() ] ) );
	}

}

function closure( data, args, env ) {

	if ( args == msgWrite ) {
		var [ cenv, cargn, cenvn, cbody ] = data.destructure();
		var na = make( symbol, "clo*" );
		return make( code, [ na, cenv, cargn, cenvn, cbody ] ).write();

	} else {
		//console.log( "executing " + data.write( ) + " " + args.write() );
		var [ cenv, cargn, cenvn, cbody ] = data.destructure();
		//console.log( "??" );



		var final_env = cenv.assoc( cargn, args ).assoc( cenvn, env );

/*
		console.log( "comp" );
		console.log( env.get( symGlobal ).write( ));
		console.log( final_env.get( symGlobal ).write() );
*/


		//console.log( "Running " + final_env.write() + " " + cbody.write() );
		var res = cbody.eval( final_env );
		//console.log( "res " + res.write() );
		return res;
	}

}

function tokenize( s ) {

	var arr = []
	var tok = "";
	var separator = c => c == ' ';
	var complete = c => c != '' && "[](){}".includes( c );

	for ( var c = 0 ; c < s.length; c++ ) {

		if ( separator( s[ c ] ) || complete( tok ) || complete( s[ c ] ) ) {

			if ( tok != "" ) {
				arr.push( tok );
				tok = "";
			}

			if ( complete( s[ c ]  ) ){
				arr.push( s[ c ] );
			}

		} else {

			tok+=s[ c ];

		}

	}

	if ( tok != "" ) {
		arr.push( tok );
	}

	return arr;

}

function read_toks( toks ) {

	var [pos,stream] = toks;

	tok = stream[ pos ];
	toks[ 0 ]++;

	function read_array( end ) {

		var arr = [];
		while ( true ) {
			var elem = read_toks( toks );
			if ( elem == end ){
				return arr;
			}	else {
				arr.push( elem );
			}
		}


	}

	if ( tok == "{" ) {

		var arr = read_array( "}" );

		var hm = [];

		while ( arr.length > 1 ) {
			hm.push( [ arr[ 0 ], arr[ 1 ] ] );
			arr = arr.slice( 2 );
		}

		return make( hash_map, hm );

	} else if ( tok == "(" )	{

		return make( code, read_array( ")" ) );

	} else if ( tok == "[" ) {

		return make( vec, read_array( "]" ) );

	} else if ( "])}".includes( tok ) ) {
		return tok;
	} else if ( !isNaN( parseInt( tok ) ) ) {
		return make( integer, parseInt( tok ) );
	} else if ( tok.startsWith( ":" ) ) {
		return make( keyword, tok.substring( 1 )  );
	}  else {
		return make( symbol, tok );
	}

}

function read( prog ) {

	var toks = tokenize( prog );
 	return read_toks( [ 0, toks] );

}

function run( prog, env ) {

	var r = read( prog );

	console.log( r( msgEval, env )( msgWrite ) );

}

function grab( f ) {

	var l = fs.readFileSync( f, 'utf8');

	var lines = l.split(/\r?\n/).filter( l => l != "" );

	for ( var c =0 ; c < lines.length; c++ ) {
			if ( lines[ c ].includes( ";" ) ) {
				lines[ c ] = lines[ c].slice( 0, lines[ c ].indexOf( ";" ) );
			}
	}

 	var ol = lines.join( " " );

	return read( "[" + ol + "]" );

}

function test( ){

/*
	var ll = 0;
	for ( var c = 0; c < 20000000; c++ ) {
		var js = JSON.parse( '{"hi": 123, "blah": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] }' );
		ll+=js.length;

	}

	return;
*/

	var prog = "";

	primEnv = make( hash_map, [
															[ make( symbol, "+" ), make( prim, function ( e, a,b) { return make( integer, a.peek() + b.peek() ); } ) ],
															[ make( symbol, "obj*" ), make( obj, nil ) ],
															[ make( symbol, "first" ), make( prim, function ( e, a,b) { return a.first(); } ) ],
															[ make( symbol, "rest" ), make( prim, function ( e, a,b) { return a.rest(); } ) ],
															[ make( symbol, "assert" ), make( prim, function ( e, a,b) { var r = eq( a, b ); if ( !r ) throw "exception"; return make( string, "pass " + r ); } ) ],
															[ make( symbol, "eval" ), make( prim, function ( e, a,b) { return a.eval( b ); } ) ],
															[ make( symbol, "if" ), make( if_, nil ) ],
															[ make( symbol, "apply*" ), make( prim, function ( e, a,b) { return a.apply( b ); } ) ],
															[ make( symbol, "trace" ), make( prim, function ( e, a ) { console.log( a.write() ); return a; } ) ],
															[ make( symbol, "get" ), make( prim, function ( e, a,b) { return a.get( b ); } ) ],
															[ make( symbol, "nil" ), nil ],
															[ make( symbol, "assoc" ), make( prim, function ( e, a,b,c) { return a.assoc( b, c ); } ) ],
															[ make( symbol, "symbol" ), make( prim, function (e, a,b) { return make( symbol, a.peek() ) } ) ],
															[ make( symbol, "=" ), make( prim, function (e,a,b) { return make( boolean, eq( a, b ) ); } ) ],
														]);

	function build_env() {

		return make( hash_map, []);
	}

	let env = build_env();

	var lib = grab( 'core.clj' );

	while ( lib.first() != nil ) {

		globalEnv = env;
		var res = lib.first().eval( build_env() );

		console.log( "Got " + res.write() );

		if ( res.write().startsWith( "{" ) ) {
			var defs = res.get( make( symbol, "defines"));

			if ( defs != nil ) {

				var dd = defs.peek();

				for ( var c = 0; c < dd.length; c++ ) {
					env = env.assoc( dd[ c ][ 0 ], dd[ c ][ 1 ] );
				}

				//console.log( "Got defines! " + env.write() );


			}

		}

//		console.log( res.write() 	);
//		console.log( res.peek()[ 0 ][ 0 ].write() );
		lib = lib.rest();
	}


	console.log( env.write() );

	//console.log( read( "[" + lib.replace( "\r\n", "" ) + "]" ).rest().first().write() );

	console.log( "Executed " + clc + " calls" );

}



test();

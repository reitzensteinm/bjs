var fs = require( 'fs' );
var crypto = require('crypto');


var experimentalPartial = false;

//const redis = require("redis");
//const client = redis.createClient();

//console.log( client.set( "hi", "asdf" ) );
//console.log( client.get( 'hi' ) );

const keywords = {};

var inPartial = false;

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
const msgEmpty = gen_message( "empty?" );
const msgProvides = gen_message( "provides" );
const msgDisassemble = gen_message( "disassemble" );
const msgPartial = gen_message( "partial" );
const msgPartialWrite = gen_message( "partial-write" );

const kwApply = intern_keyword( "apply" );
const kwAssoc = intern_keyword( "assoc" );
const kwGet = intern_keyword( "get" );
const kwEquals = intern_keyword( "equals" );
const kwEval = intern_keyword( "eval" );
const kwSequence = intern_keyword( "sequence" );
const kwPartialWrite = intern_keyword( "partial-write" );

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
let dynamicEnv = make( hash_map, [] );
let primEnv = make( hash_map, [] );

function make( f, d ) {


	if ( f == vec ) {

		for ( var c = 0; c < d.length; c++ ) {
			if ( d[ c ] == null ) {
				console.log( "Null array ");
				for ( var oo = 0; oo < d.length; oo++ ) {
					console.log( d[ oo ] );
				}
			}
		}
	}



	var mp = function clo ( args, env ) {
						clc++;
						call_stack.push( [f.name,args] );

						try{
							var ret = f( d, args, env );

						} catch (err ) {
							console.log( err );
							for ( var c = 0; c < call_stack.length; c++ ) {
								console.log( call_stack[ c ][ 0 ] + " " + call_stack[ c ][ 1 ].write() );
							}

							return;
						}


						if ( ret == null || ( ret.assoc == null && typeof( ret ) != "string" ) ) {
							if ( args == msgPartial ) {
								return nil;
							}
							if ( args != msgPeek ) {
								console.log( "Not supported " + args.write() + " " + f.name );
								console.log( args == msgFirst );
								console.log( mp.write() );
								for ( var c = 0; c < call_stack.length; c++ ) {
									console.log( call_stack[ c ][ 0 ] + " " + call_stack[ c ][ 1 ].write() );
								}
								console.log( "***" );
								process.exit();

							}
						}

						call_stack.pop();
						return ret;
					}


	mp.f = f;
  mp.partialMark = false;

	if ( f == unbound ) {
		mp.partialMark = true;
	} else if ( f == vec ) {
		for ( var c = 0; c < d.length; c++ ) {
			mp.partialMark = mp.partialMark || d[ c ].partialMark;
		}
	} else if ( f == hash_map ) {
		for ( var c = 0; c < d.length; c++ ) {
			mp.partialMark = mp.partialMark || ( d[ c ][ 0 ].partialMark || d[ c ][ 1 ].partialMark );
		}
	}
	mp.d = d;
	// || mp.partialMark || ( f == hash_map && truthy( mp( msgPartial, e ) ) );
	//|| mp.partialMark || ( f == vec && truthy( mp( msgPartial, e ) )
	mp.partial = function( e ) { return f == unbound; };// return truthy( mp( msgPartial, e ) ) };
	mp.first = function( e ) { return mp( msgFirst, e ) };
	mp.rest = function( e ) { return mp( msgRest, e ) };
	mp.write = function( e ) { return mp( msgWrite, e ) };
	mp.pwrite = function( e ) {

		//console.log( "Starting partial write " + f.name );
		if ( f == closure ||  mp( msgProvides ).get( kwPartialWrite ) != nil ) {
//			console.log( "blah ") ;
			var res = mp( msgPartialWrite, e );
	//		console.log( "provided: " + res );
			return res;
		}
		var wr = mp.write( e );
//		console.log( "Partial write " + wr );
		return wr;

	};
	mp.peek = function( e ) { return mp( msgPeek, e  ) };
	mp.eval = function( e ) { return mp( msgEval, e ) };
	mp.empty = function( e ) { return mp( msgEmpty, e ) };
	mp.get = function( v, e ) { return mp( make( vec, [ kwGet, v ] ), e ) };
	mp.equals = function( v, e ) { return mp( make( vec, [ kwEquals, v ] ), e ) };
	mp.msg = function (v, e ) { return mp( v, e ) };
	mp.apply = function( v, e ) {
		var newMessage = concat( make( vec, [ kwApply ]), v );
		//console.log( make( vec, [ kwApply ].concat( v.peek() ) ).write() );
		return mp( newMessage, e ) };

	mp.assoc = function( k, v, e ) { return mp( make( vec, [ kwAssoc, k, v ] ), e ) };

	mp.destructure = function( e ) {
		var arr = [];
		var omp = mp;
		while ( !truthy( omp.empty()) ) {
			arr.push( omp.first() );
			omp = omp.rest();
		}
		return arr;
	};

	mp.toString = () => f.name;

	return mp;

}

var emptyProvides = make( hash_map, [] );

function boolean( data, args, env ) {

	if ( args == msgEval ) {
		return make( boolean, data );
	} else if ( args == msgWrite ) {
		return "" + data;
	} else if ( args == msgPeek ) {
		return data;
	} else if ( args.first() == kwEquals ) {
		return make( boolean, data == args.rest().first().peek() );
	}	else if ( eq( args, msgProvides, env ) ) {
			return emptyProvides;
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}

}

function string( data, args, env ) {
		if ( args == msgWrite ) {
			return '"' + data + '"';
		} else if ( eq( args, msgPartial, env ) ) {
				return make( boolean, false );
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
	} else if ( eq( args, msgProvides, env ) ) {
			return emptyProvides;
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}

}

function hash_map( data, args, env ) {

	if ( args == msgPeek ) {
		return data;
	} else if ( args == msgEval ) {
		var nd = [];
		var anyPartial = false;
		for ( var c = 0; c < data.length; c++ ) {
			var k = data[ c ][ 0 ].eval( env );
			var v = data[ c ][ 1 ].eval( env );

			if ( k.partial() || v.partial() )
				anyPartial = true;
			nd.push( [ k, v ] );
		}

		/*
		if ( inPartial )
			if ( anyPartial ) {
				for ( var c = 0; c < data.length; c++ ) {
					if ( !nd[ c][ 0 ].partial() )
						nd[ c ][ 0 ] = quote( nd[ c ][ 0 ] );
					if ( !nd[ c ][ 1 ].partial() )
						nd[ c ][ 1 ] = quote( nd[ c ][ 1 ] );
				}
			}

		*/
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

		var allContained = true;
		var otherMap = args.rest().first();
		for ( var c = 0; c < data.length; c++ ) {
			if ( !eq( otherMap.get( data[ c ][ 0 ] ), data[ c ][ 1 ] ) ) {
				allContained = false;
			}
		}
		return make( boolean, allContained );
	} else if ( eq( args, msgProvides, env ) ) {
			return make( hash_map, [ [kwPartialWrite, kwPartialWrite ] ] );
	} else if ( eq( args, msgPartial, env ) ) {

		for ( var c = 0; c < data.length; c++ )
			if ( data[ c ][ 0 ].partial() || data[ c ][ 1 ].partial( ) ) {
				return make( boolean, true );
			}
		return make( boolean, false );
	} else if ( eq( args, msgPartialWrite, env ) ) {
		var outs = "{";

		function wr( d ) {
				if ( truthy( d( msgPartial ) ) ) {
					return d.pwrite();
				} else {
					return quote( d ).write();
				}
		}

		for ( var c = 0; c < data.length; c++ ) {
			outs+= wr( data[ c ][ 0 ] ) + " " + wr( data[ c ][ 1 ] );

			if ( c < data.length - 1 )
				outs += " ";
		}

		return outs + "}";

	}

}

function symbol ( data, args, env ) {

		if ( args == msgWrite ) {
			return data;
		} else if ( args == msgEval ) {

			var envs = [ env, dynamicEnv, globalEnv, primEnv ];

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
		} else if ( eq( args, msgProvides, env ) ) {
				return emptyProvides;
		} else if ( eq( args, msgPartial, env ) ) {
				return make( boolean, false );
		}

}

function write_with( data, sep ) {

	var sout = sep[ 0 ];


	try{
	for ( var c = 0; c < data.length; c++ ) {

		sout += data[ c ]( msgWrite );
		if ( c < data.length - 1 )
			sout += " ";

	}

} catch {
	for ( var c = 0; c < data.length; c++ ) {

		console.log( "d " + data[ c ] +  " " + typeof( data[ c ] ) );

		if ( data[ c ] != null ) {
			console.log( data[ c ].write() );
		}
	}
	return "err";

}
	return sout + sep[ 1 ];

}

function array_list( t, data, args, env ) {

	if ( args == msgFirst ) {
		return data.length == 0 ? nil : data[ 0 ];
	} else if ( args == msgEmpty ) {
		return make( boolean, data.length == 0 );
	} else if ( args == msgRest ) {
		return make( t, data.slice( 1 ) );
	} else if ( args.first() == kwEquals ) {
		return make( boolean, make( t, data ).write() == args.rest().first().write() );
	} else if ( eq( args, msgProvides, env ) ) {
			return make( hash_map, [ [ kwSequence, kwSequence ], [ kwPartialWrite, kwPartialWrite ] ] );
	} else if ( eq( args, msgPartial, env ) ) {
			for ( var c = 0; c < data.length; c++ )
				if ( data[ c ].partial() )
					return make( boolean, true );
			return make( boolean, false );
	}
	return null;

}

function vec( data, args, env ) {

	if ( args == msgEval ) {

		var outa = [];

		var unbound = false;

		for ( var c = 0; c < data.length; c++ ) {
			var e = data[ c ].eval( env );
			outa.push( e );

			if ( e.partial() ) {
				unbound = true;
			}
		}

		/*
		if ( inPartial )
			if ( unbound ) {
				for ( var c = 0; c < outa.length; c++ ) {
					if ( !outa[ c ].partial() ) {
						outa[ c ] = quote( outa[ c ] );
					}
				}

				//return make( unbound, make( vec, outa) );
			}
		*/

		return make( vec, outa );

	} else if ( args == msgWrite ) {
		return write_with( data, "[]" );

	} else {
		var al = array_list( vec, data, args, env );
		if ( al != null ) {
			return al;
		}
	}

	if ( eq( args, msgPartialWrite, env ) ) {

			//console.log( "Writing partial write" );
			var outs = "[";

			function wr( d ) {
	//			console.log( truthy( d( msgPartial ) ));
				if ( truthy( d( msgPartial ) ) ) {
					return d.pwrite();
				} else {
					return quote( d ).write();
				}
			}

			for ( var c = 0; c < data.length; c++ ) {
//				console.log( "writing: " + data[ c].write() );
				outs+= wr( data[ c ] );

				if ( c < data.length - 1 )
					outs += " ";
			}

			return outs + "]";

	}

}

function concat( va, vb ) {

	var out = [];

	while ( !truthy( va.empty() ) ) {
		out.push( va.first() );
		va = va.rest();
	}

	while ( !truthy( vb.empty() ) ) {
		out.push( vb.first() );
		vb = vb.rest();
	}

	return make( vec, out );

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
	} else if ( eq( args, msgProvides, env ) ) {
			return emptyProvides;
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}

}

function trace( data, args, env ) {
	if ( args == msgEval )
		return make( trace, data );
	else if  ( args == msgWrite )
		return "trace";
	else if ( args.first() == kwApply ) {
		console.log( "Tracing " + args.write() + " " + env.write() );
		var ret = args.rest().first().eval( env );
		console.log( "ret: " + ret.write() );
		return ret;
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}
}

function stripPartial( d ) {
	if ( d.partial() ) {
		return d.d;
	}
	return d;

}
function if_ (data, args, env ) {

	if ( args == msgEval ) {
		return make( if_, data );
	} else if ( args == msgWrite ) {
		return "if";
	} else if ( args.first() == kwApply ) {
		var [ _, i, a, b ] = args.destructure();
		var test = i.eval( env );

		if ( test.partial() ){
			var wr = make( code, [ make( symbol, "if" ), stripPartial( test ), stripPartial( a.eval( env ) ), stripPartial( b.eval( env ) ) ] );
			//wr = make( code, [ make( symbol, "eval" ), wr, env ] );
			return make( unbound, wr );
		} else if ( truthy( test ) ){
			return a == null ? nil : a.eval( env );
		} else {
			return b == null ? nil : b.eval( env );
		}

	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}

}

function prim( data, args, env ) {

	if ( args == msgEval ) {
		return make( prim, data );
	} else if ( args == msgWrite ) {
		return data.primName != null ? data.primName : "primitive";
	} else if ( eq( args.first(), kwApply ) ) {

		var nargs = args.destructure();
		var cargs = [];
		var partial = [ make( prim, data ) ];

		cargs.push( env );

		var anyUnbound = false;

		for ( var c = 1; c < nargs.length; c++ ) {
			var ev = nargs[ c ].eval( env );
//			console.log( nargs[ c ].write() + ev.write() + " " + ev.partial( ) + " " + ev.f.name );
			if ( ev.partial() ) {



				if ( data.mask != null ) {
					if ( data.mask[ c - 1 ] ) {
					//	ev = ev.d;
						anyUnbound = true;
						//console.log( "mask unbound " + c  + ev.write() + "  " + data.primName );
					}
				} else {
				//	ev = ev.d;
					anyUnbound = true;
					//console.log( "normal unbound" );
				}


			}

			partial.push( ev );
			cargs.push( ev );
		}

//		console.log( "ip " + inPartial + " " + anyUnbound );

		if ( anyUnbound && inPartial ) {
			for ( var c = 0; c < partial.length; c++ ) {
				partial [c ] = stripPartial( partial[ c] );
			}
			return make( unbound, make( code, partial ) );
		}

		return data.apply( null, cargs );

	} else if ( eq( args, msgProvides, env ) ) {
			return emptyProvides;
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}

}

function dynamic( data, args, env ) {
	if ( args == msgEval )
		return make( dynamic, data );
	else if  ( args == msgWrite )
		return "dyn";
	else if ( args.first() == kwApply ) {

		var [ a, b, c, d ] = args.destructure();
		var old = dynamicEnv;
		dynamicEnv = b.eval( env );
		//console.log( "Dyn env: " + dynamicEnv.write() );
		var res = c.eval( env );

		dynamicEnv = old;
		return res;
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}
}


function obj( data, args, env ) {

	if ( args == msgWrite ) {
		return "obj*";// make( string, "fn*");
	} else if ( args.first() == kwApply ) {
		return make( closure, make( vec, [ env, args.rest().first(), args.rest().rest().first(), args.rest().rest().rest().first() ] ) );
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	} else if ( eq( args, msgProvides, env ) ) {
		return emptyProvides;
	}

}

function unbound( data, args, env ) {

	if ( args == msgEval ) {
		return make( unbound, data );
	} else if ( args == msgWrite ) {
		return "(par* " + data.write() + ")";
	} else if ( args.first() == kwApply ) {
		var ar = args.rest().eval(env);
		for ( var c = 0; c < ar.d.length; c++ ) {
			ar.d[ c ] = stripPartial( ar.d[ c ] );
		}
		return make( unbound, make( code, concat( make( code, [data] ), ar ).d ) );
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, true );
	} else if ( eq( args, msgProvides, env ) ) {
		return make( hash_map, [ [kwPartialWrite, kwPartialWrite ] ] );
	} else if ( eq( args, msgPartialWrite, env ) ) {
		return data.write();
	}

}

function closureRead( data, args, env ) {

//	console.log( "Reading closure! " + args.write() );
	if ( args == msgWrite ) {
		return "clo*";
	} else if ( eq( args.first(), kwApply, env ) ) {
		//console.log( "Got apply" );
		var res = make( closure, args.rest() );
		//console.log( res.write() );
		return res;
	} else if ( eq( args, msgPartial, env ) ) {
			return make( boolean, false );
	}


}

function quote( d ) {
	return make( code, [ make( symbol, "quote" ), d ] );
}

function closure( data, args, env ) {

	if ( eq( args, msgDisassemble, env ) ) {
		return data;

	} else if ( eq( args, msgPartial, env ) ) {
			var [ cenv, cargn, cenvn, cbody ] = data.destructure();
			return cenv( msgPartial, env );
			//return make( boolean, cenv.partial() );

	} else if ( eq( args, msgPartialWrite, env ) ) {

		var [ cenv, cargn, cenvn, cbody ] = data.destructure();
		var na = make( symbol, "obj*" );

		var nenv = read( cenv.pwrite() );
		nenv = nenv.assoc( quote( cargn ), cargn );
		nenv = nenv.assoc( quote( cenvn ), cenvn );

		var body = make( code, [ make( symbol, "eval" ), quote( cbody ), nenv ] );

/*
		console.log( "***" );
		console.log( cenv.pwrite() );
		console.log( "******" );
		console.log( make( hash_map, [] ).write() );
		console.log( "**");
*/

		return make( code, [ na, cargn, cenvn, body ] ).write();


	} else if ( eq( args, msgWrite, env ) ) {
		var [ cenv, cargn, cenvn, cbody ] = data.destructure();


/*
		var body = make( code, [ make( symbol, "quote" ), cbody ] );

		var nenv = make( hash_map, [] );

		var anyPartial = false;

		for ( var c = 0; c < cenv.d.length; c++ ) {
				var k = quote( cenv.d[ c ][ 0 ] );
				var d = cenv.d[ c ][ 1 ];

				if ( !d.partial() )
					d = quote( d );
				else {
					anyPartial = true;
				}
				nenv = nenv.assoc( k, d );
		}

		nenv = nenv.assoc( quote( cargn ), cargn );
		nenv = nenv.assoc( quote( cenvn ), cenvn );

		body = make( code, [ make( symbol, "eval" ), body, nenv ]);

		if ( anyPartial ) {
			console.log( "Writing partial ");
			return make( code, [ na, cargn, cenvn, cbody ] ).write();
		}
		*/

		var na = make( symbol, "clo*" );
		return make( code, [ na, cenv, cargn, cenvn, cbody ] ).write();

	} else {

		var [ cenv, cargn, cenvn, cbody ] = data.destructure();
		//console.log( data.write() + " " + args.write() +  " " + args.partial() + " " + args.rest().first().partial() + " " + env.write() );
		//console.log( "??" );
//		console.log( cbody.write() );
	//	console.log( "executing " + data.write( ) + " " + args.write() );


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

			if ( s[ c ] != "," )
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

		var c = make( code, read_array( ")" ) );

		if ( eq( c.first(), make( symbol, "clo*" ) ) ) {
			//console.log( "reading closure!" );
			return make( closure, c.rest() );
		} else {
			return c;
		}

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

function buildPrim( name, f, mask ) {

	f.primName = name;
	f.mask = mask;
	return [ make( symbol, name), make( prim, f ) ]


}

function md5( s ) {

  return crypto.createHash('md5').update( s ).digest( "hex" );

}

function cacheVal( key, cf ) {

  if (!fs.existsSync("cache")){
    fs.mkdirSync("cache");
  }

  var h = md5( key );
  var p = "cache/" + h;

  if ( fs.existsSync( p ) ) {
      return fs.readFileSync( p, 'utf8');
  }

  var r = cf();
  fs.writeFileSync( p, r, 'utf8' );

  return r;

}



function test( ){

	var prog = "";

	primEnv = make( hash_map, [
															buildPrim( "+", function ( e, a,b) { return make( integer, a.peek() + b.peek() ); }),
															[ make( symbol, "obj*" ), make( obj, nil ) ],
															[ make( symbol, "clo*" ), make( closureRead, nil ) ],
															buildPrim( "first",  function ( e, a,b) { return a.first(); }, [ true ] ),
															buildPrim( "rest",  function ( e, a,b) { return a.rest(); }),
															buildPrim( "assert", function ( e, a,b) { var r = eq( a, b ); if ( !r ) throw "exception"; return make( string, "pass " + r ); }),
															buildPrim( "eval", function ( e, a,b) { return a.eval( b ); }),
															buildPrim( "peval", function ( e, a,b) { var oldPartial = inPartial; inPartial = true; var res = a.eval( b ); inPartial = oldPartial; return read( res.pwrite() ); } ),
															buildPrim( "partialq", function ( e, a ) { return make( boolean, a.partial() ); }, [false] ),
															[ make( symbol, "trace" ), make( trace, nil ) ],
															buildPrim( "unbound", function (e, a ) { return make( unbound, a ); }  ),
															buildPrim( "read", function (e, a ) { /*console.log( "reading: " + a.d );*/ return read( a.d ); }, [false]),
															buildPrim( "write", function (e, a ) { return make( string, a.write() ); }, [false]  ),
															[ make( symbol, "dyn*" ),  make( dynamic, nil ) ],
															[ make( symbol, "true" ), make( boolean, true ) ],
															[ make( symbol, "false" ), make( boolean, false ) ],

															//[ make( symbol, "read" ),  function ( e, a,b) { read( a ) } ],

															buildPrim( "not",  function ( e, a,b) { return make( boolean, !truthy( a ) ); } ),
															buildPrim( "empty?",  function ( e, a ) { return a.empty(); } ),
															[ make( symbol, "if" ), make( if_, nil ) ],
															buildPrim( "apply*", function ( e, a, b, env) { return a.apply( b, env  ); }, [true,false] ),
															buildPrim( "msg*", function ( e, a, b, env) { return a.msg( b, env ); }),
															buildPrim( "get",  function ( e, a,b) { return a.get( b ); } ),
															[ make( symbol, "nil" ), nil ],
															buildPrim( "assoc",  function ( e, a,b,c) { return a.assoc( b, c ); }, [true,true,false] ),
															buildPrim( "symbol", function (e, a,b) { return make( symbol, a.peek() ) }),
															buildPrim( "=",function (e,a,b) { return make( boolean, eq( a, b ) ); } ),

														]);



	function build_env() {

		return make( hash_map, []);
	}


	let env = build_env();
	var ignoreMods = true;

	if ( ignoreMods ) {
		console.log( "Warning: Aggressively caching" );
	}

	var key = ignoreMods ? "" : fs.readFileSync( "b.js", 'utf8' );
	var caching = false;

	function parseFile( path ) {

			var lib = grab( path );

			while ( lib.first() != nil ) {

				globalEnv = env;

				var tk = lib.first();

				if ( tk.write() == ":halt" ) {
					return;
				}

				key += tk.write();

				var executed = false;
				var f = function() { executed = true; return tk.eval( build_env() ).write() };

				var cres = caching ? cacheVal( key, f ) : f();

				var res = read( cres );

				if ( executed )
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




	}

	parseFile( 'core.clj' );
	caching = false;
	experimentalPartial = true;

	parseFile( 'scratch.clj' );



//	console.log( env.write() );

	//console.log( read( "[" + lib.replace( "\r\n", "" ) + "]" ).rest().first().write() );

	console.log( "Executed " + clc + " calls" );

}



test();

var fs = require( "fs" );
var crypto = require('crypto');


function md5( s ) {

  return crypto.createHash('md5').update( s ).digest( "hex" );

}

function cacheVal( key, f ) {

  if (!fs.existsSync("cache")){
    fs.mkdirSync("cache");
  }

  var h = md5( key );
  var p = "cache/" + h;

  if ( fs.existsSync( p ) ) {
      return fs.readFileSync( p, 'utf8');
  }

  var r = f();
  fs.writeFileSync( p, r, 'utf8' );

  return r;

}

console.log( cacheVal( "asdf", function () { console.log( "c" ); return "aa"; } ) );
console.log( cacheVal( "asdf", function () { console.log( "c" ); return "aa"; } ) );

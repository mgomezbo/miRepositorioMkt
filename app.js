'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var http        = require('http');
var JWT         = require('./lib/jwtDecoder');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
var activityCreate   = require('./routes/activityCreate');
var activityUpdate   = require('./routes/activityUpdate');
var activityUtils    = require('./routes/activityUtils');
var pkgjson = require( './package.json' );

var app = express();

// Register configs for the environments where the app functions
// , these can be stored in a separate file using a module like config


var APIKeys = {
    appId           : 'c7ce10b0-ee73-49ab-bc2d-bfac2fe29574',
    clientId        : 'jhe25ymiwfv8667ormdeqpdk',
    clientSecret    : 'QXqbc99kCadfLXzwESng548t',
    appSignature    : 'S5ME1Y9DABc9cP3L-qEtl8j0CbYKmy4jFoOkK6ijG_C1f3jG2lRW7qAohOUnSaweY6VnUjVkuTdab430uSxGV8P9OAyoqnGNorhy_Zyq1ajTWvH6NZwpCXVGN25kJlnk79ZB0UuhEE98WZJfHAw0UHkLx-3Qs5DTavapVSHz3n-CHtj8nPS0lpt6MsWPMf2gGntI1f3bff_XnuakoGOD6HJCZjplK4lyKP-57LsKXW-BXBXf21O42vbFH4o-KA2',
    authUrl         : 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1'
};
console.log('Definidos APIKEY');

// Simple custom middleware
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT({appSignature: APIKeys.appSignature});
    
    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );

    // Bolt the data we need to make this call onto the session.
    // Since the UI for this app is only used as a management console,
    // we can get away with this. Otherwise, you should use a
    // persistent storage system and manage tokens properly with
    // node-fuel
    req.session.token = jwtData.token;
    next();
}

// Use the cookie-based session  middleware
app.use(express.cookieParser());
console.log('OK middkeware');
// TODO: MaxAge for cookie based on token exp?
app.use(express.cookieSession({secret: "DeskAPI-CookieSecret0980q8w0r8we09r8"}));

// Configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
console.log('OK config');
// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
console.log('Definida Config');
// HubExchange Routes
app.get('/', routes.index );
app.post('/login', tokenFromJWT, routes.login );
app.post('/logout', routes.logout );

// Custom Activity Routes for interacting with Desk.com API
app.post('/ixn/activities/create-case/save/', activityCreate.save );
app.post('/ixn/activities/create-case/validate/', activityCreate.validate );
app.post('/ixn/activities/create-case/publish/', activityCreate.publish );
app.post('/ixn/activities/create-case/execute/', activityCreate.execute );

app.post('/ixn/activities/update-case/save/', activityUpdate.save );
app.post('/ixn/activities/update-case/validate/', activityUpdate.validate );
app.post('/ixn/activities/update-case/publish/', activityUpdate.publish );
app.post('/ixn/activities/update-case/execute/', activityUpdate.execute );

app.get('/clearList', function( req, res ) {
	// The client makes this request to get the data
	activityUtils.logExecuteData = [];
	res.send( 200 );
console.log('Ok custom activity');
});


// Used to populate events which have reached the activity in the interaction we created
app.get('/getActivityData', function( req, res ) {
	// The client makes this request to get the data
	if( !activityUtils.logExecuteData.length ) {
		res.send( 200, {data: null} );
	} else {
		res.send( 200, {data: activityUtils.logExecuteData} );
	}
console.log('Ok metodo 2');
});

app.get( '/version', function( req, res ) {
	res.setHeader( 'content-type', 'application/json' );
	res.send(200, JSON.stringify( {
		version: pkgjson.version
	} ) );
} );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Include the cluster module
var cluster = require('cluster');
// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
    var AWS = require('aws-sdk');
    var express = require('express');
    var bodyParser = require('body-parser');

    AWS.config.region = process.env.REGION

    var sns = new AWS.SNS();
    var ddb = new AWS.DynamoDB();

    var ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
    var snsTopic =  process.env.NEW_SIGNUP_TOPIC;
    var app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended:false}));

    app.get('/', function(req, res) {
	let headers = req.headers;
	res.send(JSON.stringify(headers, null, 4));
    });
    
    function isRedirect(req) {
	  let reqUA = req.header('user-agent');
	  if (!reqUA || reqUA === null || reqUA === undefined) {
	    return false;
	  }
	  let cookies = parseCookies(req);
	  let cookieNoRedirect = (
	    cookies['cf-noredir'] === true ||
	    cookies['cf-noredir'] === 'true'
	  );
	  if (cookieNoRedirect) {
	    return false;
	  }
	  if (reqUA.match('curl') && !cookieNoRedirect) {
			return true;
	  }
	  return false;
    }

    function parseCookies (request) {
      var list = {};
      var rc = request.headers.cookie;

      rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
      });

      return list;
   }


    app.get('/cookie', function(request, res) {
	 let headers = request.headers;
	 if (isRedirect(request)) {
	 	res.send('bye');
		return;
	 }
	 res.send('hello');
    });
    
    app.get('/secure', function(req, res) {
	    res.send('this is secure page. These are the headers \n' + JSON.stringify(req.headers));
    });

    app.post('/signup', function(req, res) {
        var item = {
            'email': {'S': req.body.email},
            'name': {'S': req.body.name},
            'preview': {'S': req.body.previewAccess},
            'theme': {'S': req.body.theme}
        };

        ddb.putItem({
            'TableName': ddbTable,
            'Item': item,
            'Expected': { email: { Exists: false } }        
        }, function(err, data) {
            if (err) {
                var returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                res.status(returnStatus).end();
                console.log('DDB Error: ' + err);
            } else {
                sns.publish({
                    'Message': 'Name: ' + req.body.name + "\r\nEmail: " + req.body.email 
                                        + "\r\nPreviewAccess: " + req.body.previewAccess 
                                        + "\r\nTheme: " + req.body.theme,
                    'Subject': 'New user sign up!!!',
                    'TopicArn': snsTopic
                }, function(err, data) {
                    if (err) {
                        res.status(500).end();
                        console.log('SNS Error: ' + err);
                    } else {
                        res.status(201).end();
                    }
                });            
            }
        });
    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}

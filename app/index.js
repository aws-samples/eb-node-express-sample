
var AWS = require('aws-sdk');

AWS.config.region = process.env.REGION;

var sns = new AWS.SNS();
var ddb = new AWS.DynamoDB();

var ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
var snsTopic =  process.env.NEW_SIGNUP_TOPIC;


const httpResponse = (status, message) => {
    return {
        "body": JSON.stringify({'message': message}),
        "statusCode": status,
        "headers": {
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials" : true,
            "Access-Control-Allow-Headers": "'x-requested-with'"
        },
    };
}
    


exports.lambdaHandler = async (event, context) => {

    console.log("Raw body", event.body);
    const body = JSON.parse(event.body);
    console.log("Parsed body", body);

    var item = {
        'email': {'S': body.email},
        'name': {'S': body.name},
        'preview': {'S': body.previewAccess},
        'theme': {'S': body.theme}
    };
    console.log("DDB Item", item);

    try {
        await ddb.putItem({
            'TableName': ddbTable,
            'Item': item,
            'Expected': { email: { Exists: false } }
        }).promise();
        console.log("Item written into DDB");
    } catch (err) {
        console.log("DDB Error: ", err);
        var returnStatus = 500;
        if (err.code === 'ConditionalCheckFailedException') {
            returnStatus = 409;
        }
        return httpResponse(returnStatus, "KO");
    }

    try {
        await sns.publish({
            'Message': 'Name: ' + body.name + "\r\nEmail: " + body.email 
                                + "\r\nPreviewAccess: " + body.previewAccess 
                                + "\r\nTheme: " + body.theme,
            'Subject': 'New user sign up!!!',
            'TopicArn': snsTopic
        }).promise();
        console.log("Message written into SNS");
    } catch (err) {
        console.log("SNS Error: ", err);
        return httpResponse(500, "KO");
    }

    return httpResponse(200, "OK");
};

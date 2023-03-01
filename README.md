# AWS Elastic Beanstalk Express Sample App with Dynamo
This sample application uses the [Express](https://expressjs.com/) framework and [Bootstrap](http://getbootstrap.com/) to build a simple, scalable customer signup form that is deployed to [AWS Elastic Beanstalk](http://aws.amazon.com/elasticbeanstalk/). The application stores data in [Amazon DynamoDB](http://aws.amazon.com/dynamodb/) and publishes notifications to the [Amazon Simple Notification Service (SNS)](http://aws.amazon.com/sns/) when a customer fills out the form.

This example cannot be run locally.

You can get started using the following steps:
  1. Install the [AWS Elastic Beanstalk Command Line Interface (CLI)](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html).
  2. Add policies to the [default instance profile](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/iam-instanceprofile.html) to grant the EC2 instances in your environment permission to access DynamoDB and Amazon SNS:
      - Open the [Roles](https://console.aws.amazon.com/iam/home#roles) page in the IAM console.
      - Choose `aws-elasticbeanstalk-ec2-role`.
      - On the Permissions tab, choose Attach policies.
      - Select the managed policy for the additional services that your application uses. For this specific example, add `AmazonSNSFullAccess` and `AmazonDynamoDBFullAccess`.
      - Choose Attach policy.
  3. Run `eb init --platform node.js --region <region>` to initialize the folder for use with the CLI. Replace `<region>` with a region identifier such as `us-east-2` (see [Regions and Endpoints](https://docs.amazonaws.cn/en_us/general/latest/gr/rande.html#elasticbeanstalk_region) for a full list of region identifiers). 
  4. Run `eb create --sample nodejs-example-express-dynamo` to begin the creation of a sample application that contains a load-balanced environment with the default settings for the Node.js platform.
  5. Once the environment creation process completes, run `eb open` to load the sample environment in your browser to verify the deployment has succeeded and is accessible.
  6. Deploy the source in this bundle using `eb deploy`.
  7. Once the deployment of this source bundle completes, run `eb open` to interact with the new webpage.
  8. Run `eb terminate --all` to clean up.


## Themes
The code includes several Bootstrap themes from [bootswatch.com](http://bootswatch.com/). You can dynamically change the active theme by setting the THEME environment variable in the [Elastic Beanstalk Management Console](https://console.aws.amazon.com/elasticbeanstalk):

![](misc/theme-flow.png)

Installed themes include:

* [amelia](http://bootswatch.com/amelia)
* [default](http://bootswatch.com/default)
* [flatly](http://bootswatch.com/flatly)
* [slate](http://bootswatch.com/slate)
* [united](http://bootswatch.com/united)
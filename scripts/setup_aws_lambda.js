const AWS = require('aws-sdk');

const readline = require("readline");

const fs = require('fs');
const path = require('path');

const BUCKET_NAME = "asteroid-alert-lambda";
const PACKAGE_FILE_NAME = "package.zip";

async function createLambda(arn) {
    const lambda = new AWS.Lambda({
        region: 'us-east-1'
    });
  
    const params = {
      Code: { /* required */
        S3Bucket: BUCKET_NAME,
        S3Key: PACKAGE_FILE_NAME
      },
      FunctionName: 'sendAsteroidAlert2', /* required */
      Handler: 'handler.index', /* required */
      Role: arn, /* required */
      Runtime: 'nodejs12.x', /* required */
      Description: 'Cron job that sends Asteroid Alert to recipients'
    };

    lambda.createFunction(params, function(err, data) {
      if (err) console.log(err); // an error occurred
      else     console.log("success");           // successful response
    });
  }

async function getArnFromUser() {
  return new Promise((resolve, reject) => {
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question("Enter the ARN of the AsteroidAlert role: ", function(arnValue) {
        const arn = arnValue;
        rl.close();
        resolve(arn);
    });
  });
}

async function main() {
    const arn = await getArnFromUser();

    console.log(`arn: ${arn}`);

    createLambda(arn);
}

main();
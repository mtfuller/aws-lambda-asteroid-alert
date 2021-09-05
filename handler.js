const AWS = require('aws-sdk');
const Handlebars = require("handlebars");

const NasaNeoClient = require('./src/nasa-neo-client');

AWS.config.update({region: 'us-east-1'});

const BUCKET_NAME = "asteroid-alert";
const FILE_NAME = "asteroid-alert-template.hbs";

function getTemplateFromS3(bucket, filename) {
    const s3 = new AWS.S3({
        region: 'us-east-1'
    });

    const params = { Bucket: bucket, Key: filename };

    return s3.getObject(params).promise();
}

function sendEmailToRecipient(toEmailAddress, fromEmailAddress, emailSubject, emailContent) {
    const ses = new AWS.SES();

    const params = {
        Destination: {
            ToAddresses: [
                toEmailAddress,
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: emailContent
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: emailSubject
            }
        },
        Source: fromEmailAddress
    };

    return ses.sendEmail(params).promise();
}

exports.index = async function(event, context) {
  console.log('Running handler.index');
  console.log('==================================');
  console.log('event', event);
  console.log('==================================');
  console.log('context', context);

  console.log(`Retrieving credentials...`);
  const ssm = new AWS.SecretsManager();

  var params = {
    Name: 'NASA_API_KEY',
    WithDecryption: true
  };

  const myNasaApiKey = await ssm.getSecretValue({SecretId: "myNasaApiKey"}).promise();
  console.log(`done.`);

  console.log(`Retrieving NEO's from NASA...`);
  if (!('SecretString' in myNasaApiKey)) {
    console.error(`Unable to get myNasaApiKey from SecretManager`);
    return;
  }

  const secret = JSON.parse(myNasaApiKey.SecretString);
  const nasaNeoClient = new NasaNeoClient(secret.NASA_API_KEY);

  console.log("Fetching all NEOs for today...")
  let neos = [];
  try {
    const startDate = new Date();
    const endDate = new Date();
    neos = await nasaNeoClient.fetchAllAsteroidsBetweenDates(startDate, endDate);
  } catch (e) {
    console.error(`Unable to retrieve data from the NASA NEO API.`);
    console.error(e);
    return;
  }
  console.log(`done.`);

  console.log(`Render email template...`);
  let emailContent = null;
  try {
    const templateFile = await getTemplateFromS3(BUCKET_NAME, FILE_NAME);

    const render = Handlebars.compile(templateFile.Body.toString());
    emailContent = render({
      potentiallyDangerousNeos: neos.filter(x => x.isPotentiallyDangerous),
      nonThreateningNeos: neos.filter(x => !x.isPotentiallyDangerous)
    });
  } catch (e) {
    console.error(`Unable to render email template.`);
    console.error(e);
    return;
  }
  console.log(`done.`);

  console.log(`Render email template and send...`);
  const toAddress = process.env.TO_ADDRESS;
  const fromAddress = process.env.FROM_ADDRESS;
  try {
    const subject = `Asteroid Alert - ${neos.length} Alerts`;
    const message = await sendEmailToRecipient(toAddress, fromAddress, subject, emailContent);
    console.log(`Successfully sent email (${message.MessageId}).`);
  } catch (e) {
    console.error(`Unable to send email to ${toAddress}`);
    console.error(e);
    return;
  }
  console.log(`done.`);
};
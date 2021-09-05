const AWS = require('aws-sdk');

const fs = require('fs');
const path = require('path');

const BUCKET_NAME = "asteroid-alert";
const FILE_NAME = "asteroid-alert-template.hbs";

const s3 = new AWS.S3({
    region: 'us-east-1'
});

s3.listBuckets(function(err, data) {
    if (err) {
        console.log("Error: ", err);
    }

    const hasAsteroidAlertBucket = data.Buckets.filter(x => x.Name === BUCKET_NAME).length === 1;
    if (!hasAsteroidAlertBucket) {
        console.log(`${BUCKET_NAME} does not exist. Please create it first.`);
        return;
    }

    const DEFAULT_TEMPLATE_PATH = path.join(process.cwd(), "public", FILE_NAME);
    if (!fs.existsSync(DEFAULT_TEMPLATE_PATH)) {
        console.log(`Unable to find file: ${DEFAULT_TEMPLATE_PATH}`);
        return;
    }

    const templateFileStream = fs.readFileSync(DEFAULT_TEMPLATE_PATH);

    const params = {Bucket: BUCKET_NAME, Key: FILE_NAME, Body: templateFileStream};
    s3.upload(params, function(err, data) {
        if (err) {
            console.log(`Unable to upload bucket with the following config:`, params);
            return;
        }

        console.log(`Uploaded ${FILE_NAME} to ${BUCKET_NAME}!`)
    });
});
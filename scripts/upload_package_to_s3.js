const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.update({region: 'us-east-1'});

const BUCKET_NAME = "asteroid-alert-lambda";
const PACKAGE_FILE_NAME = "package.zip";

async function createBucketIfItDoesNotExist(bucketName) {
    const s3 = new AWS.S3();

    try {
        const data = await s3.listBuckets().promise();

        hasBucketBeenCreated = data.Buckets.filter(x => x.Name === bucketName).length === 1;
        if (!hasBucketBeenCreated) {
            const params = { Bucket: bucketName };
            await s3.createBucket(params).promise();
        }
    } catch (e) {
        throw new Error(`Unable to create bucket: ${e.message}`);
    }
}

async function uploadPackageToS3(packageDir, bucketName, fileName) {
    const s3 = new AWS.S3();

    try {
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fs.readFileSync(packageDir)
        };
        await s3.upload(params).promise();
    } catch (e) {
        throw new Error(`Unable to upload package: ${e.message}`);
    }
}

async function main() {
    console.log(`Creating ${BUCKET_NAME}, if it does not exist...`);
    await createBucketIfItDoesNotExist(BUCKET_NAME);
    console.log(`done.`);

    console.log(`Uploading code to S3...`);
    const packageZipFilePath = path.join(process.cwd(), PACKAGE_FILE_NAME);
    if (!fs.existsSync(packageZipFilePath)) {
        console.error(`Unable to find file: ${packageZipFilePath}`);
        return;
    }

    await uploadPackageToS3(packageZipFilePath, BUCKET_NAME, PACKAGE_FILE_NAME);
    console.log(`done.`);
}

main();

var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

async function createIamRole(roleName) {
  const iam = new AWS.IAM();

  const myPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  };

  const createParams = {
    AssumeRolePolicyDocument: JSON.stringify(myPolicy),
    RoleName: roleName
  };

  return iam.createRole(createParams).promise();
}

async function attachIamPolicy(roleName) {
  const iam = new AWS.IAM();

  const policyArns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AmazonSESFullAccess",
    "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
    "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
  ];

  const policyParams = policyArns.map(arn => ({
    PolicyArn: arn,
    RoleName: roleName
  }));

  const roleAttachPromises = policyParams.map(params => iam.attachRolePolicy(params).promise());
  
  return Promise.all(roleAttachPromises);
}

async function main() {

  const roleName = "asteroidAlertRole";

  console.log(`Creating IAM Policy...`);
  let arn = null;
  try {
    const createdPolicy = await createIamRole(roleName);
    arn = createdPolicy.Role.Arn;
  } catch (e) {
    console.error(`Unable to create IAM policy "${roleName}".`);
    console.error(e);
  }
  console.log(`done. Created ${arn}.`);

  console.log(`Attaching IAM Policy...`);
  try {
    const attachedPolicy = await attachIamPolicy(roleName, arn);
    console.log(attachedPolicy);
  } catch (e) {
    console.error(`Unable to attach IAM policy "${roleName}".`);
    console.error(e);
    return;
  }
  console.log(`done.`);
}

main();

const fs = require('fs');
const path = require('path');

const awsSdk = jest.createMockFromModule('aws-sdk');

const emailTemplate = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'asteroid-alert-template.hbs'))

awsSdk.SSM = class SSM {
    constructor() {}

    getParameter(params) {
        return {
            promise: () => Promise.resolve("ABC123")
        }    
    }
}

awsSdk.S3 = class S3 {
    constructor() {}

    getObject(params) {
        return {
            promise: () => Promise.resolve(emailTemplate.toString())
        }    
    }
}

awsSdk.SES = class SES {
    constructor() {}

    sendEmail(params) {
        return {
            promise: () => Promise.resolve({
                MessageId: 1
            })
        }    
    }
}

module.exports = awsSdk;
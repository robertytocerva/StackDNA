const ACCESS_KEY_REGEX = /^AKIA[0-9A-Z]{16}$/;
const SECRET_KEY_REGEX = /^[A-Za-z0-9/+=]{40}$/;

const VALID_REGIONS = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-central-1",
    "ap-southeast-1",
    "ap-northeast-1",
    "sa-east-1"
];

const VALID_SERVICES = [
    "sts",
    "eventbridge",
    "cloudformation",
    "ssm",
    "kms",
    "stepfunctions",
    "ecr",
    "appconfig",
    "xray",
    "cognito"
];

function sanitizeLog(body = {}) {
    return {
        service: body.service,
        region: body.region,
        action: body.action
    };
}

module.exports = {
    ACCESS_KEY_REGEX,
    SECRET_KEY_REGEX,
    VALID_REGIONS,
    VALID_SERVICES,
    sanitizeLog
};

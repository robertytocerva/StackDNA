const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new S3Client(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListBucketsCommand({}));
    return { buckets: response.Buckets || [] };
};

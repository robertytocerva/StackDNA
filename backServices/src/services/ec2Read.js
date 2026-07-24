const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new EC2Client(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new DescribeInstancesCommand({}));
    return { reservations: response.Reservations || [] };
};

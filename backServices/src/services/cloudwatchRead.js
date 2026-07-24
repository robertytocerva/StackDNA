const { CloudWatchClient, DescribeAlarmsCommand } = require("@aws-sdk/client-cloudwatch");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new CloudWatchClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new DescribeAlarmsCommand({}));
    return { alarms: response.MetricAlarms || [] };
};

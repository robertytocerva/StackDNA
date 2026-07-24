const { ECRClient, DescribeRepositoriesCommand } = require("@aws-sdk/client-ecr");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new ECRClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new DescribeRepositoriesCommand({}));
    return { repositories: response.repositories || [] };
};

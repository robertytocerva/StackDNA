function createAwsReadConfig({ accessKeyId, secretAccessKey, sessionToken, region }) {
    return {
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
            ...(sessionToken ? { sessionToken } : {})
        }
    };
}

module.exports = { createAwsReadConfig };

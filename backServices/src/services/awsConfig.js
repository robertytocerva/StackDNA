function createClientConfig(body) {
    const { accessKeyId, secretAccessKey, sessionToken, region } = body;

    if (!accessKeyId || !secretAccessKey || !region) {
        const error = new Error(
            "Faltan accessKeyId, secretAccessKey o region"
        );
        error.statusCode = 400;
        throw error;
    }

    return {
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
            ...(sessionToken ? { sessionToken } : {})
        }
    };
}

module.exports = { createClientConfig };

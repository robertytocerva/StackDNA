const {
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const { createClientConfig } = require("./awsConfig");

async function streamToString(stream) {
    return await stream.transformToString();
}

module.exports = async (req, res) => {
    const body = req.body;
    const client = new S3Client(createClientConfig(body));

    if (body.bucketName && body.objectKey) {
        const response = await client.send(
            new GetObjectCommand({
                Bucket: body.bucketName,
                Key: body.objectKey
            })
        );

        const content = response.Body
            ? await streamToString(response.Body)
            : "";

        return res.json({
            success: true,
            operation: "getObject",
            contentType: response.ContentType,
            contentLength: response.ContentLength,
            lastModified: response.LastModified,
            metadata: response.Metadata,
            content
        });
    }

    if (body.bucketName) {
        const response = await client.send(
            new ListObjectsV2Command({
                Bucket: body.bucketName,
                Prefix: body.prefix || undefined
            })
        );

        return res.json({
            success: true,
            operation: "listObjects",
            bucketName: body.bucketName,
            objects: response.Contents || []
        });
    }

    const response = await client.send(new ListBucketsCommand({}));

    return res.json({
        success: true,
        operation: "listBuckets",
        buckets: response.Buckets || []
    });
};

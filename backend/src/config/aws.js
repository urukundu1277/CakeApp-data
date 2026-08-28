const AWS = require('aws-sdk');
const config = require('./environment');

AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const s3 = new AWS.S3();

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: config.aws.bucket,
    Key: `${Date.now()}_${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload image to S3');
  }
};

const deleteFromS3 = async (fileUrl) => {
  try {
    const key = decodeURIComponent(fileUrl.split('/').slice(-1)[0]);
    const params = {
      Bucket: config.aws.bucket,
      Key: key,
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
  }
};

module.exports = { s3, uploadToS3, deleteFromS3 };

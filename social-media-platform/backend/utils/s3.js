const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadToS3 = async (file) => {
  try {
    let buffer = file.buffer;
    let contentType = file.mimetype;

    // Optimize images
    if (file.mimetype.startsWith('image/')) {
      buffer = await sharp(file.buffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      contentType = 'image/jpeg';
    }

    const key = `media/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw new Error('Failed to upload file');
  }
};

module.exports = { uploadToS3 };
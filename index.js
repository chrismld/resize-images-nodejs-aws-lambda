'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

exports.handler = function(event, context, callback) {
  const width = parseInt(process.env.WIDTH);
  const height = parseInt(process.env.HEIGHT);
  const originalKey = event.Records[0].s3.object.key;
  const BUCKET = event.Records[0].s3.bucket.name;

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => Sharp(data.Body)
      .resize(width, height)
      .toFormat('png')
      .toBuffer()
    )
    .then(buffer => S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: 'image/png',
        Key: width + 'x' + height + '/' + originalKey,
      }).promise()
    )
    .then(() => callback(null, "Success!")
    )
    .catch(err => callback(err))
}

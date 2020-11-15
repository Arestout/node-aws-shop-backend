import { S3Event, S3EventRecord } from 'aws-lambda';
import 'source-map-support/register';
import AWS from 'aws-sdk';
import csvParser from 'csv-parser';
import createError from 'http-errors';
import middy from '@middy/core'; 
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import { BUCKET } from '../../config';

const importFileParser = middy(async (event: S3Event) => {
    try {
        const s3 = new AWS.S3({region: 'eu-west-1'});

        const onStreamEnd = async (record: S3EventRecord, params) => {
        const key = record.s3.object.key.replace('uploaded', 'parsed');

        await s3
          .copyObject({
            ...params,
            Key: key,
            CopySource: `${BUCKET}/${params.Key}`,
          })
          .promise();

        await s3.deleteObject(params).promise();
        }

        const parseCSV = async (record: S3EventRecord) => new Promise((resolve, reject) => {
            const params = {
                Bucket: BUCKET,
                Key: record.s3.object.key,
            };

            const csvData = [];

            const csvStream = s3.getObject(params).createReadStream();

            csvStream
            .pipe(csvParser())
            .on('data', (data) => {
                console.log(data);
                csvData.push(data);
            })
            .on('end', async () => {
                await onStreamEnd(record, params);
                resolve(csvData);
            })
            .on('error', (err) => {
                reject(err);
            })
        })

        for (const record of event.Records) {
            await parseCSV(record);

            return {
                statusCode: 202
            }
        }
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError();
    }
    
})


importFileParser
  .use(httpSecurityHeaders())
  .use(httpErrorHandler())
  .use(cors());

  export { importFileParser };

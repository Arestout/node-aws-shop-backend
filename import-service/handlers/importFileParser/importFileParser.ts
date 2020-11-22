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
        AWS.config.update({region: 'eu-west-1'});
        const s3 = new AWS.S3();
        const sqs = new AWS.SQS();
        const { SQS_URL } = process.env;

        const sendMessageToQueue = (data) => {
            sqs.sendMessage({
                QueueUrl: SQS_URL,
                MessageBody: JSON.stringify(data)
            },
            (err, data) => {
                if (err) {
                    console.log('SQS: ' + err.message);
                    return;
                }
            })
        }

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

        const parseCSV = (record: S3EventRecord) => new Promise((resolve, reject) => {
            const params = {
                Bucket: BUCKET,
                Key: record.s3.object.key,
            };

            const csvStream = s3.getObject(params).createReadStream();

            csvStream
            .pipe(csvParser())
            .on('data', (data) => {
                console.log(data);
                sendMessageToQueue(data);
            })
            .on('end', async () => {
                await onStreamEnd(record, params);
                console.log('end');
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            })
        }); 

        const recordPromises = event.Records.map(parseCSV);

        await Promise.allSettled(recordPromises);

        return {
            statusCode: 202
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

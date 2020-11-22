import { SQSRecord, SQSEvent } from 'aws-lambda';
// import { SNS } from "aws-sdk";
import createError from 'http-errors';
import middy from '@middy/core'; 
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import sqsPartialBatchFailure from'@middy/sqs-partial-batch-failure';
import 'source-map-support/register';
import { dbOptions, addProductToDB } from '../../db';
import { Client } from 'pg';

const catalogBatchProcess = middy(async (event: SQSEvent) => {
  
    const processMessage = async (record: SQSRecord) => {
      const productData = JSON.parse(record.body)
      const client = new Client(dbOptions);
      await client.connect();
      
      try {
        const productId = await addProductToDB(client, productData);

        const { rows: product } = await client.query(
          `SELECT p.*, s.count FROM products p LEFT JOIN stocks s ON p.id = s.product_id WHERE p.id = $1`,
        [productId]);

        if (!product) {
          throw new createError.BadRequest('Product creation failed');
        }

        return;
      } catch (error) {
        console.log(error);
        throw new createError.InternalServerError();
      } finally {
        client.end();
      }
    }

    const messageProcessingPromises = event.Records.map(processMessage);

    return Promise.allSettled(messageProcessingPromises)
})

catalogBatchProcess
  .use(sqsPartialBatchFailure())
  .use(httpSecurityHeaders())
  .use(httpErrorHandler())
  .use(cors());

  export { catalogBatchProcess };
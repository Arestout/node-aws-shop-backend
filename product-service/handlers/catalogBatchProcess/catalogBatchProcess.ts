import { SQSRecord, SQSEvent } from 'aws-lambda';
// import { SNS } from "aws-sdk";
import createError from 'http-errors';
import middy from '@middy/core'; 
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import sqsPartialBatchFailure from'@middy/sqs-partial-batch-failure';
import 'source-map-support/register';
import { dbOptions } from '../../db';
import { Client } from 'pg';

const catalogBatchProcess = middy(async (event: SQSEvent) => {
  const client = new Client(dbOptions);
  await client.connect();
  
  try {
    const processMessage = async (record: SQSRecord) => {
      const productData = JSON.parse(record.body)
      const { title, description, price, image, count } = productData;

      await client.query('BEGIN');
        const queryTextProducts = 'INSERT into products (title, description, price, image) VALUES ($1, $2, $3, $4) RETURNING id';
        const queryValuesProducts = [title, description, Number(price), image];
        const responseProducts = await client.query(queryTextProducts, queryValuesProducts)
    
        const queryTextStocks = 'INSERT into stocks (count, product_id) VALUES ($1, $2)';
        const productId = responseProducts.rows[0].id;
        const queryValuesStocks = [Number(count), productId];
        await client.query(queryTextStocks, queryValuesStocks);
    
        await client.query('COMMIT');

        const { rows: product } = await client.query(
        `SELECT p.*, s.count FROM products p LEFT JOIN stocks s ON p.id = s.product_id WHERE p.id = $1`,
      [productId]);
      console.log('product id: ', productId);

      if (!product) {
        throw new createError.BadRequest('Product creation failed');
      }

      return;
    }
  
    const messageProcessingPromises = event.Records.map(processMessage);

    return Promise.allSettled(messageProcessingPromises)
   
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError();
  } finally {
    client.end();
  }
})

catalogBatchProcess
  .use(sqsPartialBatchFailure())
  .use(httpSecurityHeaders())
  .use(httpErrorHandler())
  .use(cors());

  export { catalogBatchProcess };
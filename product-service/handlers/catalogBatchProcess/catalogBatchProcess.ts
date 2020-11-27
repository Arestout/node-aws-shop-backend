import { SQSRecord, SQSEvent } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import createError from 'http-errors';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import sqsPartialBatchFailure from '@middy/sqs-partial-batch-failure';
import 'source-map-support/register';
import { dbOptions, addProductToDB } from '../../db';
import { Client } from 'pg';

const catalogBatchProcess = middy(async (event: SQSEvent) => {
  const processMessage = async (record: SQSRecord) => {
    const productData = JSON.parse(record.body);
    const client = new Client(dbOptions);
    await client.connect();

    try {
      const productId = await addProductToDB(client, productData);

      const {
        rows: product,
      } = await client.query(
        `SELECT p.*, s.count FROM products p LEFT JOIN stocks s ON p.id = s.product_id WHERE p.id = $1`,
        [productId]
      );

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
  };

  const messageProcessingPromises = event.Records.map(processMessage);

  return Promise.allSettled(messageProcessingPromises);
});

catalogBatchProcess.after(async (_, next) => {
  const sns = new SNS({ region: 'eu-west-1' });
  const { SNS_ARN } = process.env;

  await sns
    .publish(
      {
        Subject: 'New products were added to the database',
        Message: 'New products were added to the database',
        TopicArn: SNS_ARN,
      },
      (error, data) => {
        if (error) {
          console.log('SNS error: ', error);
          return;
        }

        console.log('SNS: message was sent:', data);
      }
    )
    .promise();
  next();
});

catalogBatchProcess.use(sqsPartialBatchFailure()).use(httpErrorHandler());

export { catalogBatchProcess };

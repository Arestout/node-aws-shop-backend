import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { dbOptions } from '../../db/db-options';
import { Client } from 'pg';
import createError from 'http-errors';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import inputOutputLogger from '@middy/input-output-logger';

import { inputSchema } from './deleteProduct.schema';

const deleteProduct = middy(
  async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const client = new Client(dbOptions);
    await client.connect();

    try {
      await client.query('BEGIN');

      const { productId } = event.pathParameters;

      const queryStocks = {
        text: 'DELETE FROM stocks WHERE product_id = $1',
        values: [productId],
      };

      const { rows: stockProduct } = await client.query(queryStocks);

      if (stockProduct.length === 0) {
        throw new createError.BadRequest('Failed to delete product');
      }

      const queryProducts = {
        text: 'DELETE FROM products WHERE id = $1',
        values: [productId],
      };

      const { rows: product } = await client.query(queryProducts);

      if (product.length === 0) {
        throw new createError.BadRequest('Failed to delete product');
      }

      await client.query('COMMIT');

      return {
        statusCode: 204,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product[0]),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      if (!error.statusCode) {
        throw new createError.InternalServerError();
      }

      throw error;
    } finally {
      client.end();
    }
  }
);

deleteProduct
  .use(inputOutputLogger())
  .use(httpSecurityHeaders())
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(cors());

export { deleteProduct };

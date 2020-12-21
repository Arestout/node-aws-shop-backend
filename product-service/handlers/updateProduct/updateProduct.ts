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

import { inputSchema } from './updateProduct.schema';

const updateProduct = middy(
  async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const client = new Client(dbOptions);
    await client.connect();
    const { productId } = event.pathParameters;
    const { body }: any = event;

    try {
      await client.query('BEGIN');

      if (body.count) {
        const queryStocks = {
          text:
            'UPDATE stocks SET count = $1 WHERE product_id = $2 RETURNING count',
          values: [Number(body.count), productId],
        };

        const { rows: count } = await client.query(queryStocks);
        delete body.count;

        if (count.length === 0) {
          throw new createError.BadRequest(
            'Failed to update the product count'
          );
        }
      }

      if (Object.values(body).length) {
        const values = Object.values(body);
        const keys = Object.keys(body).join(',');
        console.log('keys: ', keys);
        const valueKeys = Object.keys(body)
          .map((_, index) => {
            return '$' + (index + 2);
          })
          .join(',');
        console.log('valueKeys: ', valueKeys);

        const queryProducts = {
          text: `UPDATE products SET (${keys}) = (${valueKeys}) WHERE id = $1 RETURNING *`,
          values: [productId, ...values],
        };
        console.log('query', queryProducts);
        const { rows: product } = await client.query(queryProducts);
        console.log({ product });
        if (product.length === 0) {
          throw new createError.BadRequest('Failed to update the product');
        }

        await client.query('COMMIT');

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product[0]),
        };
      }
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

updateProduct
  .use(inputOutputLogger())
  .use(httpSecurityHeaders())
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(cors());

export { updateProduct };

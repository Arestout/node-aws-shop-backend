import {
  APIGatewayProxyEventBase,
  APIGatewayEventDefaultAuthorizerContext,
} from 'aws-lambda';
import createError from 'http-errors';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import 'source-map-support/register';
import { dbOptions } from '../../db/db-options';
import { Client } from 'pg';
import { inputSchema } from './getProductById.schema';

const getProductById = middy(
  async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
  ) => {
    const { httpMethod, path, pathParameters } = event;
    console.log(JSON.stringify({ httpMethod, path, pathParameters }, null, 2));

    const client = new Client(dbOptions);
    await client.connect();

    try {
      const { productId } = event.pathParameters;
      const { rows: product } = await client.query(
        `
    SELECT p.*, s.count FROM products p LEFT JOIN stocks s ON p.id = s.product_id WHERE p.id = $1`,
        [productId]
      );

      if (!product) {
        throw new createError.NotFound(
          `Product with id ${productId} was not found`
        );
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product[0]),
      };
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError();
    } finally {
      client.end();
    }
  }
);

getProductById
  .use(validator({ inputSchema }))
  .use(httpSecurityHeaders())
  .use(httpErrorHandler())
  .use(cors());

export { getProductById };

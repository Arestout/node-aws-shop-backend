import { APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import 'source-map-support/register';
import { dbOptions } from '../db/db-options';
import { Client } from 'pg';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';

const postProduct = middy(async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, body } = event;
  console.log(JSON.stringify({ httpMethod, path, body }, null, 2))

  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { title, description, price, image, count }: any = body;

    await client.query('BEGIN');
    const queryTextProducts = 'INSERT into products (title, description, price, image) VALUES ($1, $2, $3, $4) RETURNING id';
    const queryValuesProducts = [title, description, price, image];
    const responseProducts = await client.query(queryTextProducts, queryValuesProducts)

    const queryTextStocks = 'INSERT into stocks (count, product_id) VALUES ( $1, $2)';
    const productId = responseProducts.rows[0].id;
    const queryValuesStocks = [count, productId];
    await client.query(queryTextStocks, queryValuesStocks);

    await client.query('COMMIT');

    const { rows: product } = await client.query(`
    SELECT p.*, s.count FROM products p LEFT JOIN stocks s ON p.id = s.product_id WHERE p.id = $1`,
    [productId]);
  
    
    if (!product) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(`Product creation failed`)
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(product[0]),
    };
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: 'Something went wrong'
    }
  } finally {
    client.end();
  }
})

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 2, maxLength: 19 },
        description: { type: 'string', minLength: 2, maxLength: 19 },
        price: { type: 'integer'},
        image: { type: 'string', minLength: 3 },
        count: { type: 'number' }
      },
      required: ['title', 'description', 'price', 'image', 'count' ] 
    }
  }
}

postProduct
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler());

  export { postProduct };

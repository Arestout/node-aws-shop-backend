import { APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import 'source-map-support/register';
import { dbOptions } from '../db/db-options';
import { Client } from 'pg';
import  * as createError from 'http-errors';
import middy from '@middy/core'; 
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';

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
      throw new createError.BadRequest('Product creation failed')
    }
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product[0]),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw new createError.InternalServerError();

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
        title: { type: 'string', minLength: 2, maxLength: 1024 },
        description: { type: 'string', minLength: 2, maxLength: 3024 },
        price: { type: 'integer'},
        image: { type: 'string', minLength: 3 },
        count: { type: 'number' }
      },
      required: ['title', 'description', 'price', 'image', 'count' ] 
    }
  }
}

postProduct
  .use(httpSecurityHeaders())
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(cors());

  export { postProduct };

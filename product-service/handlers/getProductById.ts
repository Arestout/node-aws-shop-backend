import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { dbOptions } from '../db/db-options';
import { Client } from 'pg';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  const { httpMethod, path, pathParameters } = event;
  console.log(JSON.stringify({ httpMethod, path, pathParameters }, null, 2))

  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { productId } = event.pathParameters;
    const { rows: product } = await client.query(`
    SELECT p.*, s.count FROM products p LEFT JOIN stocks s ON p.id = s.product_id WHERE p.id = $1`,
    [productId]
    );

    if (!product) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(`Product with id ${productId} was not found`)
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
}

'use strict';
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { dbOptions } from '../db/db-options';
import { Client } from 'pg';

export const getProductsList: APIGatewayProxyHandler = async (event, _context) => {
  console.log({event});
  const { httpMethod, path } = event;
  console.log(JSON.stringify({ httpMethod, path }, null, 2))

  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { rows: products } = await client.query(`SELECT p.*, s.count FROM products p LEFT JOIN stocks s ON p.id = s.product_id`);


    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(products),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Something went wrong'
    }
  } finally {
    client.end();
  }
}

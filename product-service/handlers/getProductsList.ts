import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productList } from "../productList";

export const getProductsList: APIGatewayProxyHandler = async () => {
  try {
    const products = [...productList];
    
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
  }
}

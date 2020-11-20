import { APIGatewayProxyEventBase, APIGatewayEventDefaultAuthorizerContext } from 'aws-lambda';
import 'source-map-support/register';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import middy from '@middy/core'; 
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import { BUCKET } from '../../config';
import { schema } from './importProductsFile.schema';

const importProductsFile = middy(async (event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>) => {
  console.log({ event });

  const { name } = event.queryStringParameters;
  const path = `uploaded/${name}`;

  const s3 = new AWS.S3({region: 'eu-west-1'});
  const params = {
    Bucket: BUCKET,
    Key: path,
    Expires: 60,
    ContentType: 'text/csv'
  };

  try {
    const url = await new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', params, (error, url) => {
        if (error) {
         reject(error);
        }

        resolve(url);
      })
    })

    return {
      statusCode: 200,
      body: JSON.stringify(url),
    }
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError();
  }
})

importProductsFile
  .use(validator({ inputSchema: schema }))
  .use(httpSecurityHeaders())
  .use(httpErrorHandler())
  .use(cors());

  export { importProductsFile };

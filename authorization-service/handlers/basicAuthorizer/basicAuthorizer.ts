import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import 'source-map-support/register';
import createError from 'http-errors';
import middy from '@middy/core';
import inputOutputLogger from '@middy/input-output-logger';
import {AUTH_USERNAME, AUTH_PASSWORD} from '../../config';

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  
  if (event.type !== 'TOKEN') {
    throw new createError.Unauthorized('Unauthorized');
  }
  
  try {
    const resource = event.methodArn;
  
    const { authorizationToken } = event;
      
    const [authType, encodedCreds] = authorizationToken.split(' ');

    if (authType !== 'Basic') {
      throw new createError.Unauthorized('Unauthorized');
    }

    const [username, password] = Buffer.from(encodedCreds, 'base64')
        .toString('utf-8')
        .split(':');

      let effect = 'Allow';

      if (
        username !== AUTH_USERNAME ||
        password !== AUTH_PASSWORD
      ) {
        effect = 'Deny';
      }
      
      return generatePolicy(encodedCreds, effect, resource);
  } catch (error) {
    throw new createError.Unauthorized('Unauthorized');
  }
  
}

function generatePolicy(principalId, effect, resource): APIGatewayAuthorizerResult {
    const policy = {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource
          }
        ]
      }
    };
  
    return policy;
  }

  export const basicAuthorizer = middy(handler).use(inputOutputLogger())
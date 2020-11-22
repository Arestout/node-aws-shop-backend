import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: {
        forceExclude: ['@types/aws-lambda']
      }
    },
  },
  resources: {
    Outputs: { 
      SQSQueueUrl: {
        Value: { Ref: 'SQSQueueCSV'}
      },
      SQSQueueArn: {
        Value: { 'Fn::GetAtt': ['SQSQueueCSV', 'Arn'] }
      }
    },
    Resources: {
      SQSQueueCSV: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue'
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductFromCSV'
        }
      }
    }
    // Resources: {
    //   SQSQueue: {
    //     Type: "AWS::SQS::Queue",
    //     Properties: {
    //       QueueName: "catalogItemsQueue",
    //     },
    //   },
    // }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.RDS_HOST,
      PG_PORT: process.env.RDS_PORT,
      PG_DATABASE: process.env.RDS_DATABASE,
      PG_USERNAME: process.env.RDS_USERNAME,
      PG_PASSWORD: process.env.RDS_PASSWORD
    },
    iamRoleStatements: [
      { Effect: 'Allow',
        Action: 'sqs:*',
        Resource: [{ 'Fn::GetAtt': ['SQSQueueCSV', 'Arn'] }]
      }
    ]
  },
  functions: {
    getProductsList: {
      handler: 'handler.getProductsList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
          }
        }
      ]
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: '/products/{productId}',
          }
        }
      ]
    },
    postProduct: {
      handler: 'handler.postProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true
          }
        }
      ]
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              'Fn::GetAtt': ['SQSQueueCSV', 'Arn']
            }
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;

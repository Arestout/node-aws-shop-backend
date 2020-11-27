import AWSMock from 'aws-sdk-mock';
import { importProductsFile } from './importProductsFile';

describe('importProductsFile', () => {
  test('should return signed url with 200 status code', async () => {
    AWSMock.mock('S3', 'getSignedUrl', (_, __, cb) => {
      cb(null, 'https://test.eu-west-1.amazonaws.com');
    });

    const signedUrl = await importProductsFile(
      {
        queryStringParameters: {
          name: 'products.csv',
        },
      } as any,
      null,
      null
    );

    expect((signedUrl as any).body).toEqual(
      'https://test.eu-west-1.amazonaws.com'
    );
  });
});

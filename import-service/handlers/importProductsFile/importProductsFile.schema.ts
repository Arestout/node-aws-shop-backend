export const schema = { 
    required: ['queryStringParameters'],
    properties: {
      queryStringParameters: {
        type: 'object',
        properties: {
          name: { type: 'string'}
        },
        required: ['name']
      }
    }
  }
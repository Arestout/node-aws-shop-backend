export const inputSchema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
      },
      required: ['productId'],
    },
    body: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 2, maxLength: 1024 },
        description: { type: 'string', minLength: 2, maxLength: 3024 },
        price: { type: 'number' },
        image: { type: 'string', minLength: 3 },
        count: { type: 'number' },
      },
    },
  },
};

export const inputSchema = {
  required: ['pathParameters'],
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
      },
      required: ['productId'],
    },
  },
};

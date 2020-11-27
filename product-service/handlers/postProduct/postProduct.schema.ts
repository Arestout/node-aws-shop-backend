import { dbProductSchema } from '../../db/db-product-schema';

export const inputSchema = {
  type: 'object',
  properties: {
    body: {
      ...dbProductSchema,
    },
  },
};

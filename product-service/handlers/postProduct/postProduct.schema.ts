export const inputSchema = {
    type: 'object',
    properties: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 1024 },
          description: { type: 'string', minLength: 2, maxLength: 3024 },
          price: { type: 'integer'},
          image: { type: 'string', minLength: 3 },
          count: { type: 'number' }
        },
        required: ['title', 'description', 'price', 'image', 'count' ] 
      }
    }
  }
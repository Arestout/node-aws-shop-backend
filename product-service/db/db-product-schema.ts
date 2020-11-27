export const dbProductSchema = {
    type: 'object',
      properties: {
        title: { type: 'string', minLength: 2, maxLength: 1024 },
        description: { type: 'string', minLength: 2, maxLength: 3024 },
        price: { type: 'number'},
        image: { type: 'string', minLength: 3 },
        count: { type: 'number' }
      },
      required: ['title', 'description', 'price', 'image', 'count' ] 
}
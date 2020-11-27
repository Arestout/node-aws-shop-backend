import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, jsonPointers: true });

const dbProductSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 2, maxLength: 1024 },
    description: { type: 'string', minLength: 2, maxLength: 3024 },
    price: { type: 'string' },
    image: { type: 'string', minLength: 3 },
    count: { type: 'string' },
  },
  required: ['title', 'description', 'price', 'image', 'count'],
};

export const validate = (data) => {
  const validate = ajv.compile(dbProductSchema);
  const valid = validate(data);

  const errors = {};

  if (valid) {
    return true;
  }

  validate.errors.forEach(
    ({ dataPath, message }) => (errors[dataPath.slice(1)] = message)
  );

  console.log(errors);

  return false;
};

import 'source-map-support/register';
import { getProductsList } from './handlers/getProductsList/getProductsList';
import { getProductById } from './handlers/getProductById/getProductById';
import { postProduct } from './handlers/postProduct/postProduct';
import { deleteProduct } from './handlers/deleteProduct/deleteProduct';
import { catalogBatchProcess } from './handlers/catalogBatchProcess/catalogBatchProcess';

export {
  getProductsList,
  getProductById,
  postProduct,
  deleteProduct,
  catalogBatchProcess,
};

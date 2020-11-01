import { getProductsList } from '../../product-service/handler';
import { productList } from '../../product-service/productList';

describe('getProductsList', () => {

    const mockResponseSuccess = { code: 200, body: productList};
     
    test('should return a list of products with statusCode 200', async () => {
        const response: any = await getProductsList(null, null, null); 
        
        expect(JSON.parse(response.body)).toStrictEqual(mockResponseSuccess.body);
        
        expect(response.statusCode).toBe(200);
    })
})
import { getProductById } from '../../product-service/handler';

describe('getProductById', () => {

    const product =  {
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80a5",
        count: 4,
        description: "Short Product Description1",
        price: 2.4,
        title: "ProductOne"
        };

    
     
    test('should return a product with statusCode 200', async () => {
        const mockResponseSuccess = { code: 200, body: product};
        const event = { pathParameters: {productId: '7567ec4b-b10c-48c5-9345-fc73c48a80a5'} } as any;
   
        const response: any = await getProductById(event, null, null); 
     
        expect(JSON.parse(response.body)).toStrictEqual(mockResponseSuccess.body);
       
        expect(response.statusCode).toBe(200);
    })

    test('should return a notFound error with statusCode 404', async () => {
        const mockResponseError = { code: 404, body: 'Product with id wrong-id was not found'};
        const event = { pathParameters: {productId: 'wrong-id'} } as any;
       
        const response: any = await getProductById(event, null, null); 
  
        expect(JSON.parse(response.body)).toStrictEqual(mockResponseError.body);
  
        expect(response.statusCode).toBe(404);
    })
})
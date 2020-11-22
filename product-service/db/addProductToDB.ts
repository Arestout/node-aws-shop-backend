interface Values {
    title: string;
    description: string;
    price: number;
    image: string;
    count: number;
}

export const addProductToDB = async (client, values: Values) => {
    try {
        const { title, description, price, image, count } = values;
        console.log({title});
        await client.query('BEGIN');
        const queryTextProducts = 'INSERT into products (title, description, price, image) VALUES ($1, $2, $3, $4) RETURNING id';
        const queryValuesProducts = [title, description, price, image];
        const responseProducts = await client.query(queryTextProducts, queryValuesProducts)
    
        const queryTextStocks = 'INSERT into stocks (count, product_id) VALUES ($1, $2)';
        const productId = responseProducts.rows[0].id;
        const queryValuesStocks = [count, productId];
        await client.query(queryTextStocks, queryValuesStocks);
    
        await client.query('COMMIT');
    
        return productId;
    } catch (err) {
        console.log(err);
    }
    
}
interface Values {
    title: string;
    description: string;
    price: string | number;
    image: string;
    count: string | number;
}

export const addProductToDB = async (client, values: Values) => {
    try {
        const { title, description, price, image, count } = values;

        await client.query('BEGIN');
        const queryTextProducts = 'INSERT into products (title, description, price, image) VALUES ($1, $2, $3, $4) RETURNING id';
        const queryValuesProducts = [title, description, Number(price), image];
        const responseProducts = await client.query(queryTextProducts, queryValuesProducts)
    
        const queryTextStocks = 'INSERT into stocks (count, product_id) VALUES ($1, $2)';
        const productId = responseProducts.rows[0].id;
        const queryValuesStocks = [Number(count), productId];
        await client.query(queryTextStocks, queryValuesStocks);
    
        await client.query('COMMIT');
    
        return productId;
    } catch (err) {
        console.log(err);
    }
    
}
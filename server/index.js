const { 
    client,
    createTables, createUser, createProduct, createFavorite,
    fetchUsers, fetchProducts, fetchFavorites,
    deleteFavorite
} = require('./db');
const express = require('express');
const app = express();

app.use(express.json());

const placeholderUsers = [
    {
        username: "Test1a",
        login: "Test1b",
        password: "Test1c"
    },
    {
        username: "Test2a",
        login: "Test2b",
        password: "Test2c"
    },
    {
        username: "Test3a",
        login: "Test3b",
        password: "Test3c"
    },
    {
        username: "Test4a",
        login: "Test4b",
        password: "Test4c"
    }
]

const placeholderProducts = [
    {
        name: "Product1"
    },
    {
        name: "Product2"
    },
    {
        name: "Product3"
    },
    {
        name: "Product4"
    },
    {
        name: "Product5"
    }
]

app.get("/api/users", async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch (err) {
        next(err);
    }
});

app.get("/api/products", async (req, res, next) => {
    try {
        res.send(await fetchProducts());
    } catch (err) {
        next(err);
    }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
    try {
        res.send(await fetchFavorites(req.params.id));
    } catch (err) {
        next(err);
    }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
    try {
        console.log(req.body, req.params.id)
        res.status(201).send(await createFavorite(req.body.product_id, req.params.id));
    } catch (err) {
        next(err);
    }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
    try {
        res.send(await deleteFavorite(req.params.id));
    } catch (err) {
        next(err);
    }
});

async function init() {
    await client.connect();
    await createTables();
    console.log("Created Tables");
    const [user1, user2, user3, user4] = await Promise.all(placeholderUsers.map((user) => createUser(user.username, user.login, user.password)));
    console.log("Created Users");
    const [product1, product2, product3, product4, product5] = await Promise.all(placeholderProducts.map((product) => createProduct(product.name)))
    console.log("Created Products");
    const favorite1 = await createFavorite(product1.id, user1.id);
    const favorite2 = await createFavorite(product2.id, user2.id);
    const favorite3 = await createFavorite(product3.id, user3.id);
    console.log("Created Favorites")
    // console.log("Fetching Users...");
    // console.log(await fetchUsers());
    // console.log("Fetching Products...");
    // console.log(await fetchProducts());
    // console.log("Fetching Favorites...");
    // console.log(await fetchFavorites(user1.id));
    // console.log("Deleting Favorite");
    // console.log(await deleteFavorite(favorite1.id));
    // console.log("Fetching Favorites...");
    // console.log(await fetchFavorites(user2.id));
    const port = process.env.PORT || 3000
    app.listen(port), () => console.log(`listening on port ${port}`)
}

init()
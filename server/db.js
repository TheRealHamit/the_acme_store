const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_store_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const { express } = require('express');

async function createTables() {
    const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        login VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE products(
        id UUID PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
    );

    CREATE TABLE favorites(
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES products(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
    );
    `;
    await client.query(SQL);
}

async function createUser(username, login, password) {
    const SQL = `
    INSERT INTO users(id, username, login, password) VALUES($1, $2, $3, $4)
    RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), username, login, await bcrypt.hash(password, 5)]);
    return response.rows[0];
}
async function createProduct(name) {
    const SQL = `
    INSERT INTO products(id, name) VALUES($1, $2)
    RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
}

async function createFavorite(product_id, user_id) {
    const SQL = `
    INSERT INTO favorites(id, product_id, user_id) VALUES($1, $2, $3)
    RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
    return response.rows[0];
}

async function fetchUsers() {
    const SQL = `
    SELECT * FROM users;
    `;
    const response = await client.query(SQL);
    return response.rows;
}
async function fetchProducts() {
    const SQL = `
    SELECT * FROM products;
    `;
    const response = await client.query(SQL);
    return response.rows;
}

async function fetchFavorites(user_id) {
    const SQL = `
    SELECT * FROM favorites
    WHERE user_id = $1;
    `;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
}

async function deleteFavorite(id) {
    const SQL = `
    DELETE FROM favorites
    WHERE id = $1
    RETURNING *;
    `;
    const response = await client.query(SQL, [id]);
    return response.rows[0];
}

module.exports = {
    client,
    createTables, createUser, createProduct, createFavorite,
    fetchUsers, fetchProducts, fetchFavorites,
    deleteFavorite
}
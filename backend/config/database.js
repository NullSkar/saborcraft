const mysql = require('mysql2/promise');
require('dotenv').config();


const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};


class DatabaseService {
    constructor() {
        this.pool = mysql.createPool(poolConfig);
        this.connection = null;
    }


    async query(sql, params) {
        return await this.pool.query(sql, params);
    }


    async getConnection() {
        this.connection = await this.pool.getConnection();
        return this.connection;
    }


    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('Conexión a la base de datos exitosa.');
        } catch (err) {
            console.error('Error conectando a la base de datos:', err);
            throw err;
        }
    }


    async beginTransaction() {
        if (!this.connection) {
            throw new Error('No hay conexión establecida. Llama a getConnection() primero.');
        }
        await this.connection.beginTransaction();
    }


    async commit() {
        if (!this.connection) {
            throw new Error('No hay conexión establecida.');
        }
        await this.connection.commit();
    }


    async rollback() {
        if (!this.connection) {
            throw new Error('No hay conexión establecida.');
        }
        await this.connection.rollback();
    }


    async close() {
        if (this.connection) {
            await this.connection.release();
            this.connection = null;
        }
        await this.pool.end();
    }
}

module.exports = new DatabaseService();
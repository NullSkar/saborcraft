const dbService = require('./config/database');

async function testConnection() {
try {
const [rows] = await dbService.query('SELECT 1 + 1 AS solution', []);
console.log('Resultado de la consulta:', rows);
} catch (err) {
console.error('Error en la conexión:', err);
}
}

module.exports = testConnection;
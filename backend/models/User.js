const db = require('../config/database');

class User {
    constructor(row) {
        this.id = row.id;
        this.username = row.username;
        this.email = row.email;
        this.password = row.password;
        this.firstName = row.first_name;
        this.lastName = row.last_name;
        // Si avatar es un Buffer (BLOB), convertir a base64
        this.avatar = row.avatar ? this._bufferToBase64(row.avatar) : null;
        this.bio = row.bio;
        this.isActive = row.is_active;
        this.createdAt = row.created_at;
        this.updatedAt = row.updated_at;
    }

    _bufferToBase64(buffer) {
        if (!buffer) return null;
        if (typeof buffer === 'string') {
            // Si ya es un string, verificar si necesita el prefijo data:image
            if (buffer.startsWith('data:image')) {
                return buffer; // Ya tiene el prefijo
            }
            return buffer; // Retornar como está
        }
        if (Buffer.isBuffer(buffer)) {
            return buffer.toString('utf8'); // Convertir directamente a string (el base64 ya viene del cliente)
        }
        return buffer;
    }

    static async create(data) {
        const {
            username,
            email,
            password,
            firstName = '',
            lastName = '',
            avatar = null,
            bio = null,
            isActive = 1
        } = data;
        const sql = `
            INSERT INTO users 
            (username, email, password, first_name, last_name, avatar, bio, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const [result] = await db.query(sql, [
            username,
            email,
            password,
            firstName,
            lastName,
            avatar,
            bio,
            isActive
        ]);
        return result.insertId;
    }

    static async findById(id) {
        const sql = "SELECT * FROM users WHERE id = ?";
        const [rows] = await db.query(sql, [id]);
        return rows[0] ? new User(rows[0]) : null;
    }


    static async findByEmail(email) {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db.query(sql, [email]);
        return rows[0] ? new User(rows[0]) : null;
    }


    static async findByUsername(username) {
        const sql = "SELECT * FROM users WHERE username = ?";
        const [rows] = await db.query(sql, [username]);
        return rows[0] ? new User(rows[0]) : null;
    }

 
    static async update(id, data) {
        const allowedFields = ['firstName', 'lastName', 'avatar', 'bio', 'isActive'];
        const updates = {};
        
        for (const key of allowedFields) {
            if (key in data) {
                // Convertir camelCase a snake_case
                const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                let value = data[key];
                
                // Si es avatar y es un string base64, puede guardarse directamente
                // MySQL LONGBLOB puede almacenar strings base64
                updates[dbKey] = value;
            }
        }

        if (Object.keys(updates).length === 0) return false;

        const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = Object.values(updates);
        
        const sql = `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`;
        values.push(id);
        
        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    }

 
    async getRecipes() {
        const sql = "SELECT * FROM recipes WHERE user_id = ?";
        const [rows] = await db.query(sql, [this.id]);
        return rows;
    }


    async getRatings() {
        const sql = "SELECT * FROM ratings WHERE user_id = ?";
        const [rows] = await db.query(sql, [this.id]);
        return rows;
    }


    async getFavorites() {
        const sql = "SELECT * FROM favorites WHERE user_id = ?";
        const [rows] = await db.query(sql, [this.id]);
        return rows;
    }

    // Contar cantidad de favoritos del usuario
    async getFavoritesCount() {
        const sql = "SELECT COUNT(*) as count FROM favorites WHERE user_id = ?";
        const [rows] = await db.query(sql, [this.id]);
        return rows[0]?.count || 0;
    }

    // Calcular promedio de ratings de las recetas del usuario
    async getAverageRating() {
        const sql = `
            SELECT ROUND(AVG(r.average_rating), 2) as avg_rating 
            FROM recipes r 
            WHERE r.user_id = ? AND r.average_rating > 0
        `;
        const [rows] = await db.query(sql, [this.id]);
        return rows[0]?.avg_rating || 0;
    }

    // ========== MÉTODOS DE ROLES ==========

    /**
     * Obtener roles de un usuario
     */
    static async getUserRoles(userId) {
        try {
            const sql = `
                SELECT r.id, r.name, r.description
                FROM user_roles ur
                INNER JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = ?
            `;
            const [roles] = await db.query(sql, [userId]);
            return roles;
        } catch (error) {
            console.error('Error en getUserRoles:', error);
            throw error;
        }
    }

    /**
     * Verificar si un usuario tiene un rol específico
     */
    static async hasRole(userId, roleName) {
        try {
            const sql = `
                SELECT COUNT(*) as count
                FROM user_roles ur
                INNER JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = ? AND r.name = ?
            `;
            const [result] = await db.query(sql, [userId, roleName]);
            return result[0].count > 0;
        } catch (error) {
            console.error('Error en hasRole:', error);
            throw error;
        }
    }

    /**
     * Asignar un rol a un usuario
     */
    static async assignRole(userId, roleName) {
        try {
            // Primero, obtener el ID del rol
            const [roleRows] = await db.query('SELECT id FROM roles WHERE name = ?', [roleName]);
            if (roleRows.length === 0) {
                throw new Error(`Role '${roleName}' not found`);
            }
            const roleId = roleRows[0].id;

            // Asignar el rol
            const sql = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)';
            const [result] = await db.query(sql, [userId, roleId]);
            return result.insertId;
        } catch (error) {
            console.error('Error en assignRole:', error);
            throw error;
        }
    }

    /**
     * Remover un rol de un usuario
     */
    static async removeRole(userId, roleName) {
        try {
            const sql = `
                DELETE FROM user_roles
                WHERE user_id = ? AND role_id = (SELECT id FROM roles WHERE name = ?)
            `;
            const [result] = await db.query(sql, [userId, roleName]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en removeRole:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los roles disponibles
     */
    static async getAllRoles() {
        try {
            const sql = 'SELECT id, name, description FROM roles';
            const [roles] = await db.query(sql);
            return roles;
        } catch (error) {
            console.error('Error en getAllRoles:', error);
            throw error;
        }
    }

    /**
     * Crear un nuevo rol
     */
    static async createRole(name, description) {
        try {
            const sql = 'INSERT INTO roles (name, description) VALUES (?, ?)';
            const [result] = await db.query(sql, [name, description]);
            return result.insertId;
        } catch (error) {
            console.error('Error en createRole:', error);
            throw error;
        }
    }
}

module.exports = User;
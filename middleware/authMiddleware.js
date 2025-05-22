


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db/index.js';
dotenv.config();

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user.userId) return res.status(401).json({ message: "Invalid or expired token" })
    const { rows: [findUser = null] } = await pool.query("SELECT * FROM users WHERE id = $1", [user.userId]);
    if (!findUser) return res.status(401).json({ message: "User not found" })
    req.user = findUser;
    next();

  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(403).json({ error: 'Invalid or expired token' });
  }

}

export default authMiddleware;





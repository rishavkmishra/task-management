

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
//import { registerSchema } from '../validations/registerSchema.js'; 
import { registerSchema, loginSchema, updatedSchema } from '../zod/task.js';


import dotenv from 'dotenv';

dotenv.config();

// User Registration


export const register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("req.body===>", req.body);
   //const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
 
  
 
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};







export const login = async (req, res) => {
  const { email, password } = req.body;


  
  

  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];  


    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '10h',
    });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};




export const updated = async (req, res) => {
 
  const result = updatedSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "result error"});
  }

  const { name, email, password } = result.data;
 
  const userId = req.user.id;

  try {
    const updatedUser = await pool.query(
      `UPDATE users
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING id, name, email`,
      [name.trim(), email.toLowerCase(), userId]
    );

   
    if (updatedUser.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser.rows[0],
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

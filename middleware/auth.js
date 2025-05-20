


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });
   
  try {


  const user = jwt.verify(token, process.env.JWT_SECRET);


  req.user = user;
  next();

} catch (err) {
  console.error("JWT verification failed:", err.message);
  res.status(403).json({ error: 'Invalid or expired token' });
}

}

export default authMiddleware;


  


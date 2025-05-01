export default function debugMiddleware(req, res, next) {
  console.log('Debug Middleware - Headers:', req.headers);
  console.log('Debug Middleware - User:', req.user);
  next();
}

// Em index.js ou onde são definidas as rotas
import debugMiddleware from './middleware/debugMiddleware.js';
app.use('/api/protected', authMiddleware, debugMiddleware, protectedRoutes); 
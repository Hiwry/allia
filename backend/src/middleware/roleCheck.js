export default function roleCheck(allowedRoles) {
  return (req, res, next) => {
    // Garantir que o middleware de autenticação já foi executado
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }
    
    // Verificar se a role do usuário está incluída nas roles permitidas
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    
    // Se não tiver permissão, retornar erro 403 (Forbidden)
    return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
  };
} 
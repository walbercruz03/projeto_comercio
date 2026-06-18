import jwt from 'jsonwebtoken';

// Verifica o cookie, se for válido, extrai os dados (ID, email, tipo) e salva em req.usuario
export const verificarToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        req.usuario = null;
        return next();
    }
    
    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'chave_super_secreta_123');
        req.usuario = decodificado;
        next();
    } catch (error) {
        req.usuario = null; // Token inválido ou expirado
        next();
    }
};

// Bloqueia imediatamente o acesso se o usuário não for Administrador
export const apenasAdmin = (req, res, next) => {
    verificarToken(req, res, () => {
        if (req.usuario && (req.usuario.tipo_usuario === 'admin' || req.usuario.tipo_usuario === 'admin_principal' || req.usuario.email === 'admin@gmail.com')) {
            next();
        } else {
            res.status(403).send("Acesso negado. Esta página é restrita para administradores.");
        }
    });
};
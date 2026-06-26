import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta_123';

// 1. 🌐 PARA ROTAS DE API (Usado no pedidoRoutes.js) - Retorna JSON em caso de erro
export const verificarToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ erro: "Acesso negado. Token não fornecido!" });
    }
    
    try {
        const decodificado = jwt.verify(token, JWT_SECRET);
        
        // ⚡ CORREÇÃO CRÍTICA: Garante que a propriedade '.id' exista 
        // mesmo se o payload original do JWT foi assinado como 'id_usuario'
        req.usuario = {
            ...decodificado,
            id: decodificado.id || decodificado.id_usuario
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ erro: "Token inválido ou expirado!" });
    }
};

// 2. 🖥️ PARA VIEWS/TELAS (Usado no viewRoutes.js) - Redireciona para o login se falhar
export const verificarTokenView = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const decodificado = jwt.verify(token, JWT_SECRET);
        
        req.usuario = {
            ...decodificado,
            id: decodificado.id || decodificado.id_usuario
        };
        
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// 3. 🛡️ PARA VIEWS ADMINISTRATIVAS (Usado no viewRoutes.js) - Bloqueia se não for admin
export const apenasAdminView = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decodificado = jwt.verify(token, JWT_SECRET);
        
        req.usuario = {
            ...decodificado,
            id: decodificado.id || decodificado.id_usuario
        };

        if (req.usuario && (req.usuario.tipo_usuario === 'admin' || req.usuario.tipo_usuario === 'admin_principal' || req.usuario.email === 'admin@gmail.com')) {
            return next();
        }
        
        return res.status(403).send("Acesso negado. Esta página é restrita para administradores.");
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// 4. 🔓 PARA VIEWS OPCIONAIS (Usado na rota /apresentacao) - Não barra o usuário se não estiver logado
export const verificarTokenOpcional = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        req.usuario = null;
        return next();
    }
    
    try {
        const decodificado = jwt.verify(token, JWT_SECRET);
        
        req.usuario = {
            ...decodificado,
            id: decodificado.id || decodificado.id_usuario
        };
        
        next();
    } catch (error) {
        req.usuario = null;
        next();
    }
};
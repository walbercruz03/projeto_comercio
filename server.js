// server.js
const express = require('express');
const path = require('path');
const usuarioRoutes = require('./src/routes/usuarioRoutes'); // Entra em src/
const produtoRoutes = require ('./src/routes/produtoRoutes')
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aponta para a pasta public dentro de src
app.use(express.static(path.join(__dirname, 'src', 'public'))); 

// Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use ('/api/produtos', produtoRoutes);
app.use ('/api/pedidos', pedidoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
import { Configuracao } from '../config/orm.js';

// Retorna todas as configurações salvas em formato de objeto simples JSON
export const obterConfiguracoes = async (req, res) => {
  try {
    const dados = await Configuracao.findAll({ raw: true });
    
    // Converte a lista de linhas do banco [ {chave: 'cor_fundo', valor: '#ffffff'} ]
    // Em um objeto limpo: { cor_fundo: '#ffffff' } para facilitar o uso no front
    const mapaConfig = dados.reduce((acc, item) => {
      acc[item.chave] = item.valor;
      return acc;
    }, {});

    res.json(mapaConfig);
  } catch (error) {
    console.error("❌ Erro ao buscar configurações de layout:", error);
    res.status(500).json({ erro: "Erro interno ao carregar a identidade visual da loja." });
  }
};

// Salva ou atualiza as cores e o arquivo da logo no banco de dados
export const salvarConfiguracoes = async (req, res) => {
  try {
    if (!req.usuario || (req.usuario.tipo_usuario !== 'admin' && req.usuario.tipo_usuario !== 'admin_principal')) {
      return res.status(403).json({ erro: "Acesso negado." });
    }

    const { cor_fundo, cor_primaria, pagina } = req.body;

    // 1. Se enviou uma cor de fundo e especificou a página (ex: 'produtos', 'carrinho')
    if (cor_fundo && pagina) {
      const chaveDinamica = `cor_fundo_${pagina}`;
      await Configuracao.upsert({ chave: chaveDinamica, valor: cor_fundo });
    }

    // 2. Atualiza a Cor Primária global se enviada
    if (cor_primaria) {
      await Configuracao.upsert({ chave: 'cor_primaria', valor: cor_primaria });
    }

    // 3. Atualiza a Logo se enviada
    let nomeImagemLogo = null;
    if (req.file) {
      nomeImagemLogo = "/uploads/" + req.file.filename;
      await Configuracao.upsert({ chave: 'logo_url', valor: nomeImagemLogo });
    }

    res.json({ mensagem: "Visual da página atualizado com sucesso!" });

  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error);
    res.status(500).json({ erro: "Erro interno ao salvar as alterações visuais." });
  }
};
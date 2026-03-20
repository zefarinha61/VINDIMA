const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    try {
        console.log('Tentando ligar à base de dados...');
        await sql.connect(dbConfig);
        console.log('Ligação estabelecida com sucesso!');

        const query = `
            select top 1 M.Campanha, F.Nome, A.Descricao as ArtigoDesc
            from VIN_RececaoUvaMovimentos M
            inner join Fornecedores F on F.Fornecedor=M.codsocio
            inner join Artigo A on A.Artigo = M.TipoUva
            where M.MovimentoAnulado='0'
        `;
        console.log('Executando consulta de teste...');
        const result = await sql.query(query);
        console.log('Consulta executada com sucesso!');
        console.log('Resultado:', result.recordset);
    } catch (err) {
        console.error('Erro no teste:', err.message);
        if (err.originalError) console.error('Detalhes:', err.originalError.message);
    } finally {
        await sql.close();
    }
}

testConnection();

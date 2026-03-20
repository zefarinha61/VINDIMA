const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.get('/api/entregas', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const query = `
            select M.Campanha,M.DataMovimento,M.CodSocio,F.Nome,M.TipoUva,A.Descricao as ArtigoDesc,m.grau,M.PesoLiquido,PV.Descricao as ProcessoDesc,M.ValorizacaoValorUnitario,M.ValorizacaoCustosCriteriosMultiplos,M.ValorizacaoTotalUva,M.ValorizacaoTotalTalao,P.Descricao as PropriedadeDesc,PAR.Descricao as ParcelaDesc,PAR.AreaCategoriasProducao,C.Descricao as CastaDesc,A.CDU_Cor 
            from VIN_RececaoUvaMovimentos M
            inner join Fornecedores F on F.Fornecedor=M.codsocio
            inner join Artigo A on A.Artigo = M.TipoUva
            inner join Familias FA on FA.Familia=A.Familia
            inner join SubFamilias SA on SA.Familia=A.Familia and SA.SubFamilia=A.SubFamilia
            inner join Marcas MA on MA.Marca=A.Marca
            inner join VIN_Castas C on C.Codigo=A.CDU_Casta
            inner join VIN_ProcessoVindima PV on PV.Codigo=M.ProcessoVindima
            inner join VIN_RececaoUvaParcelas PA on PA.IDRececaoUvaMovimento=M.IDRececaoUvaMovimento
            inner join VIN_Propriedades P on P.CodPropriedade=PA.CodPropriedade and P.CodSocio=M.CodSocio
            inner join VIN_Parcelas PAR on PAR.CodParcela=PA.CodParcela and PAR.CodPropriedade=PA.CodPropriedade and PAR.CodSocio=M.CodSocio
            where M.MovimentoAnulado='0' 
        `;
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Database connection or query error:', err);
        res.status(500).json({ error: 'Erro ao obter dados da base de dados', details: err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Servidor a correr na porta ${port}`);
});

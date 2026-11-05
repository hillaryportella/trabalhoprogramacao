import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const ARQUIVO_USUARIOS = path.join(__dirname, 'usuarios.json');

function lerUsuarios() {
    if (!fs.existsSync(ARQUIVO_USUARIOS)) {
        return [];
    }
    const dados = fs.readFileSync(ARQUIVO_USUARIOS, 'utf-8');
    try {
        return JSON.parse(dados);
    } catch (e) {
        return [];
    }
}

function salvarUsuarios(usuarios) {
    fs.writeFileSync(ARQUIVO_USUARIOS, JSON.stringify(usuarios, null, 2), 'utf-8');
}

app.post('/api/registrar', async (req, res) => {
    try {
        const { nome, nomeUsuario, email, senha, dataNascimento } = req.body;
        
        const usuarios = lerUsuarios();
        
        const usuarioExiste = usuarios.find(u => u.email === email || u.nomeUsuario === nomeUsuario);
        if (usuarioExiste) {
            return res.status(400).json({ erro: 'E-mail ou Nome de usuário já cadastrados!' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = {
            id: Date.now(),
            nome,
            nomeUsuario,
            email,
            senha: senhaCriptografada,
            dataNascimento
        };

        usuarios.push(novoUsuario);
        salvarUsuarios(usuarios);

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
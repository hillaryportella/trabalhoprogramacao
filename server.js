import express from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const usuarios = [];

app.post('/api/registrar', async (req, res) => {
    try {
        const { nome, nomeUsuario, email, senha, dataNascimento } = req.body;
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
        console.log("Usuários cadastrados:", usuarios);

        return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`SERVIDOR RODANDO COM SUCESSO EM http://localhost:${PORT}`);
});
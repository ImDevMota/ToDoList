import express from "express"
import cors from "cors"
import { getRedisInstance } from "./redis.js";
import bodyParser from "body-parser"

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/register", async (req,res) => {
    console.log("oi")
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).send('Os campos acima são obrigatórios');
    }

    const redisInstance = getRedisInstance();
    const userExists = await redisInstance.exists(`user:${email}`);

    if (userExists) {
      return res.status(400).send('Usuário já existe');
    }

    await redisInstance.hmset(`user:${email}`, 'username', username, 'password', password);

    res.status(201).send('Usuário cadastrado com sucesso');
});

app.post("/login", async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    const redisInstance = getRedisInstance();

    if (!email || !password) {
        return res.status(400).send('E-mail e senha são obrigatórios');
    }

    const user = await redisInstance.hgetall(`user:${email}`);

    if(!user || user.password !== password) {
        return res.status(401).send('Usuário ou senha inválidos');
    } 

    res.status(200).send('Login bem-sucedido!');
});

app.listen(5501, () => {
    console.log("Server running on port 5501")
});
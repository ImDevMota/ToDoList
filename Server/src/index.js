import express from "express";
import cors from "cors";
import { getRedisInstance } from "./redis.js";
import pusher from "./pusher.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post("/register", async (req, res) => {
    const { email, userId, password, username } = req.body;

    if (!email || !password || !username || !userId) {
        return res.status(400).send("Os campos acima são obrigatórios");
    }

    const redisInstance = getRedisInstance();
    const userExists = await redisInstance.exists(`user:${email}`);
    const expiry = 60000 * 60 * 24;

    if (userExists) {
        return res.status(400).send("Usuário já existe");
    }

    await redisInstance.hmset(`user:${email}`, "userId", userId, "username", username, "password", password);
    await redisInstance.pexpire(`user:${email}`, expiry);

    res.status(201).send("Usuário cadastrado com sucesso");
});

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const redisInstance = getRedisInstance();

    if (!email || !password) {
        return res.status(400).send("E-mail e senha são obrigatórios");
    }

    const user = await redisInstance.hgetall(`user:${email}`);

    if (!user || user.password !== password) {
        return res.status(401).send("Usuário ou senha inválidos");
    }

    res.status(200).send("Login bem-sucedido!");
});

app.post("/newList", async (req, res) => {
    const { listName } = req.body;

    const redisInstance = getRedisInstance();

    const listAlreadyExists = await redisInstance.exists(`list:${listName}`);

    if (listAlreadyExists) {
        return res.status(400).send("Essa lista já existe!");
    }

    const expiry = 60000 * 60 * 24;
    
    await redisInstance.hset(`list:${listName}`, "listName", listName);

    const savedList = await redisInstance.hgetall(`list:${listName}`);
    console.log("Lista salva no Redis:", savedList);

    await redisInstance.pexpire(`list:${listName}`, expiry);
});

app.get("/getLists", async (req, res) => { 
    const redisInstance = getRedisInstance();
    
    // Pega todas as chaves de tarefas do Redis (assumindo que todas começam com 'task:')
    const listKeys = await redisInstance.keys("list:*");

    // Pega todos os dados das tarefas
    const lists = [];

    for (const key of listKeys) {
        const list = await redisInstance.hgetall(key);
        lists.push(list); // Adiciona cada tarefa à lista
    }

    if (lists.length > 0) {
        return res.status(200).json(lists); // Retorna todas as tarefas
    }

    return res.status(404).send("Nenhuma lista encontrada.");
});

app.post("/newTask", async (req, res) => {
    const { taskName, listNameChannel, description, startDate, endDate, progress, userId } = req.body;
    
    if (!taskName || taskName.trim() === "") {
        return res.status(400).send("O nome da tarefa não pode estar vazio.");
    }

    const redisInstance = getRedisInstance();

    const taskObj = {
        taskName,
        listNameChannel,
        description,
        startDate,
        endDate,
        progress,
        userId,
    };

    const taskAlreadyExists = await redisInstance.exists(`task:${taskName}`);

    if (taskAlreadyExists) {
        const taskExists = await redisInstance.hgetall(`task:${taskName}`);

        if (taskExists.progress == taskObj.progress && (taskExists.progress == 0 || taskExists.progress == 1)) {
            return res.status(400).send("Essa Tarefa já existe e não foi concluída.");
        }
    }

    const expiry = 60000 * 60 * 24;

    await redisInstance.hmset(
        `task:${taskName}`,
        "taskName", taskName,
        "listNameChannel", listNameChannel, 
        "description", description,
        "startDate", startDate,
        "endDate", endDate,
        "progress", progress
    );

    const savedTask = await redisInstance.hgetall(`task:${taskName}`);
    console.log("Tarefa salva no Redis:", savedTask);

    await redisInstance.pexpire(`task:${taskName}`, expiry);

    if (listNameChannel && taskObj) {
        try {
            pusher.trigger(listNameChannel, "new-task", taskObj); // channel vai ser o nome da lista; criar página só para criar e mostrar listas
            console.log("Evento disparado com sucesso!");
        } catch (error) {
            console.error("Erro ao disparar evento:", error);
        }
    } else {
        console.error("O nome do canal, evento ou dados estão faltando.");
    }

    res.status(201).send(taskObj);
});

app.get("/getTasks", async (req, res) => {
    const redisInstance = getRedisInstance();
    
    // Pega todas as chaves de tarefas do Redis (assumindo que todas começam com 'task:')
    const taskKeys = await redisInstance.keys("task:*");

    // Pega todos os dados das tarefas
    const tasks = [];

    for (const key of taskKeys) {
        const task = await redisInstance.hgetall(key);
        tasks.push(task); // Adiciona cada tarefa à lista
    }

    if (tasks.length > 0) {
        return res.status(200).json(tasks); // Retorna todas as tarefas
    }

    return res.status(404).send("Nenhuma tarefa encontrada.");
});

app.post("/pusher/authenticate", async (req, res) => {
    const socketId = req.body.socket_id;
    const user_id = req.body.user_id;
    const username = req.body.username;

    const user = {
        id: user_id,
        name: username,
    } 

    const pusherUser = pusher.authenticateUser(socketId, user);
    return res.status(200).send(pusherUser);
});

app.post("/pusher/authorize", async (req, res) => {
    const socketId = req.body.socket_id;
    const user_id = req.body.user_id;
    const username = req.body.username;
    const listNameChannel = req.body.listNameChannel;

    const data = {
        user_id: user_id, 
        user_info: {
            id: user_id,
            username,
        }
    }

    const authorizedUser = pusher.authorizeChannel(socketId, listNameChannel, data);
    return res.status(200).send(authorizedUser);
});

app.delete("/deleteTask", async (req, res) => {
    const { taskName } = req.body; // O nome da tarefa que será excluída
    const redisInstance = getRedisInstance();

    // Verifica se a tarefa existe no Redis
    const taskExists = await redisInstance.exists(`task:${taskName}`);

    if (!taskExists) {
        return res.status(404).send("Tarefa não encontrada.");
    }

    // Apaga a tarefa do Redis
    await redisInstance.del(`task:${taskName}`);
    res.status(200).send(`Tarefa '${taskName}' excluída com sucesso.`);
});

app.listen(5501, () => {
    console.log("Server running on port 5501");
});
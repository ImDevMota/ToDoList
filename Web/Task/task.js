const listNameLabel = document.getElementById("listNameLabel"); // fazer a lista um canal privado e fazer autenticação e autorização do usuário pelo pusher

const params = new URLSearchParams(window.location.search);
const listName = params.get("name");
listNameLabel.innerText = listName;

const listNameChannel = listName.replaceAll(" ", "-");

Pusher.logToConsole = true;

const pusher = new Pusher("a54ab26105acf3591692", { 
    cluster: 'us2',
    channelAuthorization: {
        endpoint: "http://localhost:5501/pusher/authorize",
        paramsProvider: () => {
            return {
                user_id: localStorage.getItem("user_id"),
                username: localStorage.getItem("username"),
                listNameChannel: listNameChannel,
            }
        }
    },
    userAuthentication: {
        endpoint: "http://localhost:5501/pusher/authenticate",
        paramsProvider: () => {
            return {
                user_id: localStorage.getItem("user_id"),
                username: localStorage.getItem("username")
            }
        }
    }
});

const newList = document.getElementById("taskForm");

newList.addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskName = document.getElementById("taskName").value;
    const description = document.getElementById("description").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const progress = 0;
    const userId = pusher.sessionID;

    if(taskName == '') {
        alert("O nome da tarefa é obrigatório.");
        return;
    }

    if(!startDate || !endDate) {
        alert("As datas de início e fim da tarefa são obrigatórias.");
        return;
    }

    console.log("Enviando taskName:", taskName);

    const createTaskResponse = await fetch('http://localhost:5501/newTask', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ taskName, listNameChannel, description, startDate, endDate, progress, userId })
    });

    if (createTaskResponse.ok) {
    alert(`Tarefa criada com sucesso!`);
    } else {
    console.error("Erro ao criar tarefa:", createTaskResponse.statusText);
    }

    //window.location.reload();
});

if(listName) {
    pusher.signin();

    const channel = pusher.subscribe(listNameChannel); // fazer canal privado e autenticação

    channel.bind("new-task", data => {
        console.log("Evento 'new-task' recebido:", data);
    });

    channel.bind("pusher:subscription_succeeded", () => {
        console.log("aqui", { channel });
    });
}

window.addEventListener("load", async () => {
    try {
        const data = await fetch("http://localhost:5501/getTasks");

        if (!data.ok) {
            throw new Error("Erro ao buscar tarefas.");
        }

        const tasks = await data.json(); 
        const tasksContainer = document.getElementById("tasksContainer");
        if (!tasksContainer) {
            throw new Error("Não foi possível encontrar o container de tarefas.");
        }

        tasks.forEach((task) => {
            if(task.listNameChannel == listNameChannel) {
                const taskElement = document.createElement("div");
                taskElement.innerHTML = `
                    <div>
                        <h3>${task.taskName}</h3>
                            <p><strong>Descrição:</strong> ${task.description}</p>
                            <p><strong>Data de Início:</strong> ${task.startDate}</p>
                            <p><strong>Data de Conclusão:</strong> ${task.endDate}</p>
                            <p><strong>Status:</strong> ${task.progress == 0 ? "A Fazer" : task.progress == 1 ? "Em Andamento" : "Concluída"}</p>
                            <button class="delete-btn" data-taskname="${task.taskName}">Excluir</button> <!-- Botão de excluir -->
                    </div>
                `;
                tasksContainer.appendChild(taskElement);
            }
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", async (e) => {
                const taskName = e.target.getAttribute("data-taskname");

                try {
                    const response = await fetch("http://localhost:5501/deleteTask", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ taskName })
                    });

                    if (response.ok) {
                        alert(`Tarefa '${taskName}' excluída com sucesso!`);
                        window.location.reload(); 
                    } else {
                        alert("Erro ao excluir a tarefa.");
                    }
                } catch (error) {
                    console.error("Erro ao excluir a tarefa:", error);
                }
            });
        });
    } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
    }
});




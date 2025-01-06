const listNameInput = document.getElementById("listNameInput");
const createListButton = document.getElementById("createListButton");

createListButton.addEventListener("click", async (e) => { 
  e.preventDefault();
  
  const listName = listNameInput.value

  if(!listName){
    return;
  }

  const createListResponse = await fetch('http://localhost:5501/newList', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ listName })
    });

  // Verifica se a tarefa foi criada com sucesso
    if (createListResponse.ok) {
      alert(`Lista criada com sucesso!`);
    } else {
    console.error("Erro ao criar lista:", createListResponse.statusText);
    }

  // window.location.href= `/web/list/list.html?name=${listNameInput.value}`; 
})

window.addEventListener("load", async () => {
  try {
      const data = await fetch("http://localhost:5501/getLists");

      if (!data.ok) {
          throw new Error("Erro ao buscar listas.");
      }

      const lists = await data.json();  // Supondo que o backend retorna um array de tarefas

    // Garantir que o container existe antes de tentar adicionar tarefas
      const listsContainer = document.getElementById("listsContainer");
      if (!listsContainer) {
          throw new Error("Não foi possível encontrar o container de listas.");
      }

      lists.forEach((list) => {
          const listElement = document.createElement("div");
          listElement.innerHTML = `
              <div>
                  <button class="click-list" data-listname="${list.listName}">${list.listName}</button>
                    <!-- <button class="delete-btn" data-listname="${list.listName}">Excluir</button> -->
              </div>
          `;
          listsContainer.appendChild(listElement);
      });

      document.querySelectorAll(".click-list").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const listName = e.target.getAttribute("data-listname");
    
          window.location.href = `/web/task/task.html?name=${listName}`; // URL para onde você quer redirecionar
        });
      });

    // Adicionar o evento de deletar para os botões
      // document.querySelectorAll(".delete-btn").forEach((button) => {
      //     button.addEventListener("click", async (e) => {
      //         const listName = e.target.getAttribute("data-listname");

      //         try {
      //             const response = await fetch("http://localhost:5501/deleteList", {
      //                 method: "DELETE",
      //                 headers: {
      //                     "Content-Type": "application/json"
      //                 },
      //                 body: JSON.stringify({ listName })
      //             });

      //             if (response.ok) {
      //                 alert(`Tarefa '${listName}' excluída com sucesso!`);
      //                 window.location.reload();  // Recarregar a página para atualizar a lista
      //             } else {
      //                 alert("Erro ao excluir a tarefa.");
      //             }
      //         } catch (error) {
      //             console.error("Erro ao excluir a tarefa:", error);
      //         }
      //     });
      // });
  } catch (error) {
      console.error("Erro ao buscar listas:", error);
  }
});






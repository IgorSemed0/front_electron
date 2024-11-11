const axios = require('axios');
const apiUrl = 'http://127.0.0.1:8002/api/grupo1/rounds';

// Função para carregar todas as rounds
async function loadrounds() {
  try {
    const response = await axios.get(apiUrl);
    const rounds = response.data;

    const roundsTableBody = document.querySelector("#roundsTable tbody");
    roundsTableBody.innerHTML = "";

    rounds.forEach((round) => {

      console.log(round)
        const row = document.createElement("tr");
      
        row.innerHTML = `
          <td>${round.it_numero}</td>
          <td>${round.vc_nome}</td>         
          <td>
            <button onclick="editround(${round.id})">Editar</button>
            <button onclick="deleteround(${round.id})">Deletar</button>
          </td>
        `;
      
        roundsTableBody.appendChild(row);
      });
      
  } catch (error) {
    console.error('Erro ao carregar rounds:', error);
  }
}
// Função para salvar ou atualizar uma round
document.getElementById('roundForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const id = document.getElementById('roundId').value;
    const it_numero = document.getElementById('it_numero').value;
    const vc_nome = document.getElementById('vc_nome').value;
   
    
    try {
      if (id) {
        // Atualizar round
        await axios.put(`${apiUrl}/${id}`, { it_numero: it_numero, vc_nome: vc_nome});
      } else {
        // Criar nova round
        await axios.post('http://127.0.0.1:8002/api/grupo1/round', {
            it_numero: it_numero,
            vc_nome: vc_nome           
          });
                }
      loadrounds();
      clearForm();
    } catch (error) {
      console.error('Erro ao salvar round:', error.response ? error.response.data : error.message);
    }
  }); 
// Função para editar uma round
async function editround(id) {
  try {
    const response = await axios.get(`${apiUrl}/${id}`);
    const round = response.data;

    document.getElementById('roundId').value = round.id;
    document.getElementById('it_numero').value = round.it_numero;
    document.getElementById('vc_nome').value = round.vc_nome;    
  } catch (error) {
    console.error('Erro ao carregar round para edição:', error);
  }
}
// Função para deletar uma round
async function deleteround(id) {
  try {
    await axios.delete(`${apiUrl}/${id}`);
    loadrounds();
  } catch (error) {
    console.error('Erro ao deletar round:', error);
  }
}
// Função para limpar o formulário
function clearForm() {
  document.getElementById('roundId').value = '';
  document.getElementById('it_numero').value = '';
  document.getElementById('vc_nome').value = '';  
}
// Carregar rounds ao abrir a página
loadrounds();

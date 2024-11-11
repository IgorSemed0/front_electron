const axios = require('axios');
const apiUrl = 'http://127.0.0.1:8002/api/grupo1/posicoes';

// Função para carregar todas as posicoes
async function loadposicoes() {
  try {
    const response = await axios.get(apiUrl);
    const posicoes = response.data;

    const posicoesTableBody = document.querySelector("#posicoesTable tbody");
    posicoesTableBody.innerHTML = "";

    posicoes.forEach((posicao) => {

      console.log(posicao)
        const row = document.createElement("tr");
      
        row.innerHTML = `         
          <td>${posicao.vc_nome}</td>         
          <td>
            <button onclick="editposicao(${posicao.id})">Editar</button>
            <button onclick="deleteposicao(${posicao.id})">Deletar</button>
          </td>
        `;
      
        posicoesTableBody.appendChild(row);
      });
      
  } catch (error) {
    console.error('Erro ao carregar posicoes:', error);
  }
}
// Função para salvar ou atualizar uma posicao
document.getElementById('posicaoForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const id = document.getElementById('posicaoId').value;    
    const vc_nome = document.getElementById('vc_nome').value;
   
    
    try {
      if (id) {
        // Atualizar posicao
        await axios.put(`${apiUrl}/${id}`, {  vc_nome: vc_nome});
      } else {
        // Criar nova posicao
        await axios.post('http://127.0.0.1:8002/api/grupo1/posicao', {           
            vc_nome: vc_nome           
          });
                }
      loadposicoes();
      clearForm();
    } catch (error) {
      console.error('Erro ao salvar posicao:', error.response ? error.response.data : error.message);
    }
  }); 
// Função para editar uma posicao
async function editposicao(id) {
  try {
    const response = await axios.get(`${apiUrl}/${id}`);
    const posicao = response.data;

    document.getElementById('posicaoId').value = posicao.id;    
    document.getElementById('vc_nome').value = posicao.vc_nome;    
  } catch (error) {
    console.error('Erro ao carregar posicao para edição:', error);
  }
}
// Função para deletar uma posicao
async function deleteposicao(id) {
  try {
    await axios.delete(`${apiUrl}/${id}`);
    loadposicoes();
  } catch (error) {
    console.error('Erro ao deletar posicao:', error);
  }
}
// Função para limpar o formulário
function clearForm() {
  document.getElementById('posicaoId').value = ''; 
  document.getElementById('vc_nome').value = '';  
}
// Carregar posicoes ao abrir a página
loadposicoes();

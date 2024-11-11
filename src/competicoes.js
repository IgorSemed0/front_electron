const axios = require('axios');
const apiUrl = 'http://127.0.0.1:8002/api/grupo1/competicao';

// Função para carregar todas as competições
async function loadCompeticoes() {
  try {
    const response = await axios.get(apiUrl);
    const competicoes = response.data;

    const competicoesTableBody = document.querySelector("#competicoesTable tbody");
    competicoesTableBody.innerHTML = "";

    competicoes.forEach((competicao) => {

      console.log(competicao)
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${competicao.vc_name}</td>
          <td>${competicao.vc_local}</td>
          <td>${competicao.dt_data}</td>
          <td>
            <button onclick="editCompeticao(${competicao.id})">Editar</button>
            <button onclick="deleteCompeticao(${competicao.id})">Deletar</button>
          </td>
        `;

        competicoesTableBody.appendChild(row);
      });

  } catch (error) {
    console.error('Erro ao carregar competições:', error);
  }
}

// Função para salvar ou atualizar uma competição
document.getElementById('competicaoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const id = document.getElementById('competicaoId').value;
    const nome = document.getElementById('nome').value;
    const local = document.getElementById('local').value;
    const dataInput = document.getElementById('data').value;

    // Formatar a data para YYYY-MM-DD
    const data = new Date(dataInput);
    const formattedDate = data.toISOString().split('T')[0];

    try {
      if (id) {
        // Atualizar competição
        await axios.put(`${apiUrl}/${id}`, { vc_name: nome, vc_local: local, dt_data: formattedDate });
      } else {
        // Criar nova competição
        await axios.post('http://127.0.0.1:8002/api/grupo1/competicao', {
            vc_name: nome,
            vc_local: local,
            dt_data: formattedDate
          });
                }
      loadCompeticoes();
      clearForm();
    } catch (error) {
      console.error('Erro ao salvar competição:', error.response ? error.response.data : error.message);
    }
  });


// Função para editar uma competição
async function editCompeticao(id) {
  try {
    const response = await axios.get(`${apiUrl}/${id}`);
    const competicao = response.data;

    document.getElementById('competicaoId').value = competicao.id;
    document.getElementById('nome').value = competicao.vc_name;
    document.getElementById('local').value = competicao.vc_local;
    document.getElementById('data').value = competicao.dt_data;
  } catch (error) {
    console.error('Erro ao carregar competição para edição:', error);
  }
}

// Função para deletar uma competição
async function deleteCompeticao(id) {
  try {
    await axios.delete(`${apiUrl}/${id}`);
    loadCompeticoes();
  } catch (error) {
    console.error('Erro ao deletar competição:', error);
  }
}

// Função para limpar o formulário
function clearForm() {
  document.getElementById('competicaoId').value = '';
  document.getElementById('nome').value = '';
  document.getElementById('local').value = '';
  document.getElementById('data').value = '';
}

// Carregar competições ao abrir a página
loadCompeticoes();

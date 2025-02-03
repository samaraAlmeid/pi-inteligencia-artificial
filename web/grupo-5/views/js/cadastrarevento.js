async function postEvent(event) {
    event.preventDefault();  // Evita que o formulário seja enviado de forma tradicional

    const eventosEndpoint = '/eventos';  // Endpoint onde os eventos são cadastrados
    const URLCompleta = `http://localhost:3005${eventosEndpoint}`;

    let nomeEventoInput = document.querySelector('#nome');
    let telefoneInput = document.querySelector('#telefone');
    let numeroInput = document.querySelector('#numero');
    let cepInput = document.querySelector('#cep');
    let valorInput = document.querySelector('#valor');
    let complementoInput = document.querySelector('#complemento');
    let categoriaInput = document.querySelector('#categoria');
    let qtdIngressoInput = document.querySelector('#qtd-ingresso');
    let bannerInput = document.querySelector('#banner');
    let descricaoInput = document.querySelector('#descricao');
    let enderecoInput = document.querySelector('#endereco');

    let nome = nomeEventoInput.value;
    let telefone = telefoneInput.value;
    let numero = numeroInput.value;
    let cep = cepInput.value;
    let url_logo = bannerInput.value;
    let preco = parseFloat(valorInput.value);
    let complemento = complementoInput.value;
    let ingresso = qtdIngressoInput.value;
    let descricao = descricaoInput.value;
    let endereco = enderecoInput.value;
    let categoria = categoriaInput.value;

    if (nome && telefone && categoria && descricao && url_logo && preco >= 0 && complemento && numero && ingresso && endereco && cep) {

        nomeEventoInput.value = "";
        telefoneInput.value = "";
        numeroInput.value = "";
        cepInput.value = "";
        bannerInput.value = "";
        valorInput.value = "";
        complementoInput.value = "";
        qtdIngressoInput.value = "";
        descricaoInput.value = "";
        enderecoInput.value = "";
        categoriaInput.value = "";

        try {
            const response = await axios.post(URLCompleta, {
                nome,
                telefone,
                numero,
                cep,
                url_logo,
                preco,
                complemento,
                ingresso,
                descricao,
                endereco,
                categoria
            });

            const eventos = response.data;

            exibirAlerta('.alert-evento', 'Evento cadastrado com sucesso', ['show', 'alert-success'], ['d-none'], 2000);

        } catch (error) {
            console.error(error);
            exibirAlerta('.alert-evento', 'Erro ao cadastrar evento', ['show', 'alert-danger'], ['d-none'], 2000);
        }

    } else {
        exibirAlerta('.alert-evento', 'Preencha todos os campos corretamente', ['show', 'alert-danger'], ['d-none'], 2000);
    }
}

document.getElementById('eventoForm').addEventListener('submit', postEvent);

function exibirAlerta(seletor, innerHTML, classesToAdd, classesToRemove, timeout) {
    let alert = document.querySelector(seletor);

    if (alert) {
        alert.innerHTML = innerHTML;
        alert.classList.add(...classesToAdd);
        alert.classList.remove(...classesToRemove);

        setTimeout(() => {
            alert.classList.remove('show');
            alert.classList.add('d-none');
        }, timeout);
    } else {
        console.error("Elemento de alerta não encontrado. Verifique o seletor:", seletor);
    }
}

const GEMINI_API_KEY = 'AIzaSyCD2twcXxSqMwJfrhKWU4lE4LGyYGomLFE'; // Substitua por sua chave real

async function gerarDicas(categoria, tipo_evento) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Instrua dicas de como estruturar um evento da categoria "${categoria}" de tipo "${tipo_evento}". Forneça somente orientações e melhores práticas. Não utilize caracteres especiais como #, **, etc, apenas faça um texto corrido, mas completo. No final, dê um exemplo de nome e uma descrição para o evento da categoria "${categoria}" de tipo "${tipo_evento}" no formato: Nome: [Nome] Descrição: [Descrição]`
              }
            ]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    console.log("Resposta da API:", response.data);

    const dicasGeradas = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return dicasGeradas || "Dicas não geradas";
  } catch (error) {
    console.error("Erro ao gerar dicas do evento:", error.response?.data || error.message);
    return "";
  }
}

// Listener do botão para Obter Dicas
document.getElementById('btn-dicas').addEventListener('click', async () => {
  const categoria = document.getElementById('categoria').value;
  const tipo = document.getElementById('tipo-evento').value;

  if (!categoria) {
    alert("Por favor, selecione uma categoria antes de solicitar dicas.");
    return;
  }

  if (!tipo) {
    alert("Por favor, diga o tipo do evento.");
    return;
  }
  
  document.getElementById('dicasContent').innerText = "Carregando dicas...";
  
  const dicas = await gerarDicas(categoria, tipo);
  
  document.getElementById('dicasContent').innerText = dicas;
  
  var dicasModal = new bootstrap.Modal(document.getElementById('dicasModal'));
  dicasModal.show();
});

document.getElementById('btn-aplicar-dicas').addEventListener('click', () => {
    const dicasTexto = document.getElementById('dicasContent').innerText;
  
    const nomeMatch = dicasTexto.match(/Nome:\s*(.*)/i);
    const descricaoMatch = dicasTexto.match(/Descrição:\s*(.*)/i);
  
    const nome = nomeMatch ? nomeMatch[1].trim() : "";
    const descricao = descricaoMatch ? descricaoMatch[1].trim() : "";
  
    document.getElementById('nome').value = nome;
    document.getElementById('descricao').value = descricao;
  
    var dicasModal = bootstrap.Modal.getInstance(document.getElementById('dicasModal'));
    dicasModal.hide();
  });  
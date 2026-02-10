let dados = JSON.parse(localStorage.getItem('dados')) || [];

// ====================
// Configuração de Idiomas
// ====================
const traducoes = {
  pt: {
    saldo: "Saldo",
    entrada: "Entrada",
    saida: "Saída",
    divida: "Dívida",
    adicionar: "Adicionar",
    historico: "Histórico",
    dividaPendente: "Pendente",
    dividaPaga: "Paga",
    marcarPaga: "Marcar como paga",
    apagar: "Apagar",
    alertaValor: "Preencha o valor e a descrição",
    confirmarApagar: "Quer mesmo apagar este item?",
    placeholderValor: "Valor (€)",
    placeholderDescricao: "Descrição"
  },
  es: {
    saldo: "Saldo",
    entrada: "Entrada",
    saida: "Salida",
    divida: "Deuda",
    adicionar: "Agregar",
    historico: "Historial",
    dividaPendente: "Pendiente",
    dividaPaga: "Pagada",
    marcarPaga: "Marcar como pagada",
    apagar: "Borrar",
    alertaValor: "Complete el valor y la descripción",
    confirmarApagar: "¿Desea borrar este elemento?",
    placeholderValor: "Valor (€)",
    placeholderDescricao: "Descripción"
  },
  en: {
    saldo: "Balance",
    entrada: "Income",
    saida: "Expense",
    divida: "Debt",
    adicionar: "Add",
    historico: "History",
    dividaPendente: "Pending",
    dividaPaga: "Paid",
    marcarPaga: "Mark as paid",
    apagar: "Delete",
    alertaValor: "Fill in value and description",
    confirmarApagar: "Do you really want to delete this item?",
    placeholderValor: "Value (€)",
    placeholderDescricao: "Description"
  }
};

let idiomaAtual = localStorage.getItem('idioma') || 'pt';

function mudarIdioma(idioma) {
  idiomaAtual = idioma;
  localStorage.setItem('idioma', idiomaAtual);

  // Atualiza placeholders e opções do select
  document.getElementById('valor').placeholder = traducoes[idiomaAtual].placeholderValor;
  document.getElementById('descricao').placeholder = traducoes[idiomaAtual].placeholderDescricao;

  const selectTipo = document.getElementById('tipo');
  selectTipo.options[0].text = traducoes[idiomaAtual].entrada;
  selectTipo.options[1].text = traducoes[idiomaAtual].saida;
  selectTipo.options[2].text = traducoes[idiomaAtual].divida;


  // Atualiza o botão "Adicionar"
  document.querySelector('section.add button').textContent = traducoes[idiomaAtual].adicionar;


  atualizar();
}

// ====================
// Funções principais
// ====================
function adicionar() {
  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const descricao = document.getElementById('descricao').value;

  if (!valor || !descricao) {
    alert(traducoes[idiomaAtual].alertaValor);
    return;
  }

  const novaEntrada = { tipo, valor, descricao, data: new Date().toLocaleDateString() };

  if (tipo === 'divida') {
    novaEntrada.paga = false; // marca dívida como pendente
  }

  dados.push(novaEntrada);
  localStorage.setItem('dados', JSON.stringify(dados));

  document.getElementById('valor').value = '';
  document.getElementById('descricao').value = '';

  atualizar();
}

function atualizar() {
  const lista = document.getElementById('historico');
  lista.innerHTML = '';

  let saldo = 0;

  dados.forEach((item, index) => {
    const li = document.createElement('li');

    // Texto do histórico traduzido
    let tipoTexto = traducoes[idiomaAtual][item.tipo] || item.tipo;
    let statusDivida = '';
    if (item.tipo === 'divida') {
      statusDivida = ` - ${item.paga ? traducoes[idiomaAtual].dividaPaga : traducoes[idiomaAtual].dividaPendente}`;
    }
    li.textContent = `${tipoTexto} - €${item.valor.toFixed(2)} - ${item.descricao}${statusDivida}`;

    // Botão apagar
    const btnApagar = document.createElement('button');
    btnApagar.textContent = traducoes[idiomaAtual].apagar;
    btnApagar.style.marginLeft = "10px";
    btnApagar.style.background = "#e74c3c";
    btnApagar.style.color = "white";
    btnApagar.style.border = "none";
    btnApagar.style.padding = "2px 6px";
    btnApagar.style.borderRadius = "4px";
    btnApagar.style.cursor = "pointer";

    btnApagar.onclick = () => {
      if (confirm(traducoes[idiomaAtual].confirmarApagar)) {
        dados.splice(index, 1);
        localStorage.setItem('dados', JSON.stringify(dados));
        atualizar();
      }
    };

    li.appendChild(btnApagar);

    // Botão “Marcar como paga” para dívidas pendentes
    if (item.tipo === 'divida' && !item.paga) {
      const btnPagar = document.createElement('button');
      btnPagar.textContent = traducoes[idiomaAtual].marcarPaga;
      btnPagar.style.marginLeft = "10px";
      btnPagar.style.background = "#27ae60";
      btnPagar.style.color = "white";
      btnPagar.style.border = "none";
      btnPagar.style.padding = "2px 6px";
      btnPagar.style.borderRadius = "4px";
      btnPagar.style.cursor = "pointer";

      btnPagar.onclick = () => {
        marcarComoPaga(index);
      };

      li.appendChild(btnPagar);
    }

    lista.appendChild(li);

    // Calcula saldo: só entrada/saída
    if (item.tipo === 'entrada') saldo += item.valor;
    else if (item.tipo === 'saida') saldo -= item.valor;
    // dívida não altera saldo até ser paga
  });

  document.getElementById('saldo').textContent =
    `${traducoes[idiomaAtual].saldo}: €${saldo.toFixed(2)}`;
}

// Função para marcar dívida como paga
function marcarComoPaga(index) {
  const divida = dados[index];

  if (divida.tipo === 'divida' && !divida.paga) {
    divida.paga = true;

    // Cria uma entrada equivalente
    dados.push({
      tipo: 'entrada',
      valor: divida.valor,
      descricao: `Pagamento de dívida: ${divida.descricao}`,
      data: new Date().toLocaleDateString()
    });

    localStorage.setItem('dados', JSON.stringify(dados));
    atualizar();
  }
}

// Inicializa a tela
mudarIdioma(idiomaAtual);
atualizar();

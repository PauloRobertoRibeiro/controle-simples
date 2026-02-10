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
    placeholderDescricao: "Descrição",
    dividasPendentes: "Dívidas pendentes",
    pagamentoDivida: "Pagamento de dívida"
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
    placeholderDescricao: "Descripción",
    dividasPendentes: "Deudas pendientes",
    pagamentoDivida: "Pago de deuda"
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
    placeholderDescricao: "Description",
    dividasPendentes: "Pending debts",
    pagamentoDivida: "Debt payment"
  }
};

let idiomaAtual = localStorage.getItem('idioma') || 'pt';

// ====================
// Mudar idioma
// ====================
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

  // Atualiza botão Adicionar
  document.querySelector('section.add button').textContent = traducoes[idiomaAtual].adicionar;

  atualizar();
}

// ====================
// Adicionar transação
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

// ====================
// Atualizar tela
// ====================
function atualizar() {
  const lista = document.getElementById('historico');
  lista.innerHTML = '';

  let saldo = 0;
  let totalDividas = 0;

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
    btnApagar.classList.add("botao-apagar");
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
      btnPagar.classList.add("botao-pagar");
      btnPagar.onclick = () => {
        marcarComoPaga(index);
      };
      li.appendChild(btnPagar);
    }

    lista.appendChild(li);

    // Calcula saldo: só entrada/saída
    if (item.tipo === 'entrada') saldo += item.valor;
    else if (item.tipo === 'saida') saldo -= item.valor;

    // Soma dívidas pendentes
    if (item.tipo === 'divida' && !item.paga) totalDividas += item.valor;
  });

  // Atualiza saldo
  document.getElementById('saldo').textContent =
    `${traducoes[idiomaAtual].saldo}: €${saldo.toFixed(2)}`;

  // Atualiza total de dívidas pendentes
  document.getElementById('dividas-pendentes').textContent =
    `${traducoes[idiomaAtual].dividasPendentes}: €${totalDividas.toFixed(2)}`;
}

// ====================
// Marcar dívida como paga
// ====================
function marcarComoPaga(index) {
  const divida = dados[index];

  if (divida.tipo === 'divida' && !divida.paga) {
    divida.paga = true;

    // Cria uma entrada equivalente com descrição traduzida
    dados.push({
      tipo: 'entrada',
      valor: divida.valor,
      descricao: `${traducoes[idiomaAtual].pagamentoDivida}: ${divida.descricao}`,
      data: new Date().toLocaleDateString()
    });

    localStorage.setItem('dados', JSON.stringify(dados));
    atualizar();
  }
}

// ====================
// Inicializa a tela
// ====================
mudarIdioma(idiomaAtual);
atualizar();

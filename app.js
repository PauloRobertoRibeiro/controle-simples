import { carregarDados, salvarDados, carregarIdioma, salvarIdioma } from './storage.js';
import { criarTransacao } from './transactions.js';
import { atualizarUI } from './ui.js';
import { traducoes } from './i18n.js';

// ===== Dados e idioma =====
let dados = carregarDados();
let idiomaAtual = carregarIdioma();
let versaoPro = localStorage.getItem("versaoPro") === "true";

// ===== Inicializa interface =====
function atualizarInterfaceIdioma() {
  document.getElementById('valor').placeholder = traducoes[idiomaAtual].placeholderValor;
  document.getElementById('descricao').placeholder = traducoes[idiomaAtual].placeholderDescricao;
  
  const selectTipo = document.getElementById('tipo');
  selectTipo.options[0].text = traducoes[idiomaAtual].entrada;
  selectTipo.options[1].text = traducoes[idiomaAtual].saida;
  selectTipo.options[2].text = traducoes[idiomaAtual].divida;

  document.getElementById('btn-adicionar').textContent = traducoes[idiomaAtual].adicionar;
  document.getElementById('historico-titulo').textContent = traducoes[idiomaAtual].historico;
  
  document.getElementById('frase-app').textContent = traducoes[idiomaAtual].frase;

}

// ===== Função limite Free =====
function checarLimiteFree() {
  if (!versaoPro && dados.length >= 30) {
    alert(traducoes[idiomaAtual].limiteFree || "Você atingiu o limite de 30 transações na versão Free. Atualize para PRO!");
    return false;
  }
  return true;
}

// ===== Adicionar transação com verificação =====
function adicionarTransacaoSegura(tipo, valor, descricao) {
  if (!checarLimiteFree()) return false;

  const nova = criarTransacao(tipo, valor, descricao);
  dados.push(nova);
  salvarDados(dados);
  atualizarUI(dados, idiomaAtual, traducoes);
  atualizarGrafico();

  return true;
}

// Expor globalmente para testes no console
window.adicionarTransacaoSegura = adicionarTransacaoSegura;

// ===== Botão Adicionar =====
document.getElementById('btn-adicionar').addEventListener('click', () => {
  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const descricao = document.getElementById('descricao').value;

  if (!valor || !descricao) {
    alert(traducoes[idiomaAtual].alertaValor);
    return;
  }

  adicionarTransacaoSegura(tipo, valor, descricao);

  // ===== Botão para testar 30 transações =====
const btnTeste30 = document.getElementById('btn-teste-30');
if (btnTeste30) {
  btnTeste30.addEventListener('click', () => {
    for (let i = 1; i <= 30; i++) {
      adicionarTransacaoSegura('entrada', i * 10, `Teste ${i}`);
    }
    alert("30 transações adicionadas! Limite Free aplicado.");
  });
}


  // Limpar campos
  document.getElementById('valor').value = '';
  document.getElementById('descricao').value = '';
});

const CODIGO_PRO = "4321"; // você pode mudar depois

const btnUpgrade = document.getElementById('btn-upgrade-pro');

if (btnUpgrade) {
  btnUpgrade.addEventListener('click', () => {

    const codigo = prompt("Digite o código PRO:");

    if (!codigo) return;

    if (codigo === CODIGO_PRO) {
      localStorage.setItem("versaoPro", "true");
      versaoPro = true;

      alert("🎉 Versão PRO ativada com sucesso!");
      atualizarUI(dados, idiomaAtual, traducoes);
      atualizarGrafico();
    } else {
      alert("❌ Código inválido");
    }

  });
}


// ===== Mudança de idioma =====
document.querySelectorAll('[data-idioma]').forEach(btn => {
  btn.addEventListener('click', () => {
    idiomaAtual = btn.dataset.idioma;
    salvarIdioma(idiomaAtual);
    atualizarInterfaceIdioma();
    atualizarUI(dados, idiomaAtual, traducoes);
    atualizarGrafico();
  });
});

// ===== Exportar / Importar =====
document.getElementById('btn-exportar')?.addEventListener('click', () => {
  if (!versaoPro) {
    alert("A exportação está disponível apenas na versão PRO.");
    return;
  }
  const dadosJSON = JSON.stringify(dados, null, 2);
  const blob = new Blob([dadosJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-controle-simples.json';
  a.click();

  URL.revokeObjectURL(url);
});

const inputImportar = document.getElementById('input-importar');
document.getElementById('btn-importar')?.addEventListener('click', () => {
  if (!versaoPro) {
    alert("A importação está disponível apenas na versão PRO.");
    return;
  }
  inputImportar.click();
});
inputImportar?.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dadosImportados = JSON.parse(e.target.result);
      if (Array.isArray(dadosImportados)) {
        if (confirm("Substituir dados atuais pelos importados?")) {
          dados = dadosImportados;
          salvarDados(dados);
          atualizarUI(dados, idiomaAtual, traducoes);
          atualizarGrafico();
        }
      } else alert("Arquivo inválido.");
    } catch {
      alert("Erro ao importar arquivo.");
    }
  };
  reader.readAsText(file);
});

// ===== Controle de abas =====
const botoesAbas = document.querySelectorAll('.aba-btn');
const conteudosAbas = document.querySelectorAll('.aba-conteudo');
botoesAbas.forEach(botao => {
  botao.addEventListener('click', () => {
    const alvo = botao.dataset.aba;
    botoesAbas.forEach(b => b.classList.remove('ativa'));
    conteudosAbas.forEach(c => c.classList.remove('ativa'));
    botao.classList.add('ativa');
    document.getElementById(alvo).classList.add('ativa');
  });
});

// ===== GRÁFICO FINANCEIRO (PRO) =====
let grafico;
function atualizarGrafico() {
  if (!versaoPro) return;

  const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
  const entradas = dados.filter(d => d.tipo === 'entrada').reduce((sum, d) => sum + d.valor, 0);
  const saidas = dados.filter(d => d.tipo === 'saida').reduce((sum, d) => sum + d.valor, 0);
  const dividasPagas = dados.filter(d => d.tipo === 'divida' && d.paga).reduce((sum, d) => sum + d.valor, 0);

  const valores = [entradas, saidas, dividasPagas];
  const labels = [
    traducoes[idiomaAtual].entrada,
    traducoes[idiomaAtual].saida,
    traducoes[idiomaAtual].pagamentoDivida
  ];

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '€',
        data: valores,
        backgroundColor: ['#4caf50', '#f44336', '#2196f3']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}


// ===== Adicionar 30 transações de teste =====
function adicionarTestes() {
  for (let i = 1; i <= 30; i++) {
    // 'entrada' é só um exemplo; pode trocar por 'saida' ou 'divida'
    const tipo = 'entrada';
    const valor = i * 10; // valor de teste
    const descricao = `Teste ${i}`;

    adicionarTransacaoSegura(tipo, valor, descricao); // usa a função segura que respeita o limite Free
  }
  alert("30 transações adicionadas! Limite Free aplicado.");
}

// Expor globalmente para poder chamar no console
window.adicionarTestes = adicionarTestes;


// ===== Inicialização =====
atualizarInterfaceIdioma();
atualizarUI(dados, idiomaAtual, traducoes);
atualizarGrafico();

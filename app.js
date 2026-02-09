 let dados = JSON.parse(localStorage.getItem('dados')) || [];

function adicionar() {
  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const descricao = document.getElementById('descricao').value;

  if (!valor || !descricao) {
    alert('Preencha o valor e a descrição');
    return;
  }

  dados.push({ tipo, valor, descricao });
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
    li.textContent = `${item.tipo} - €${item.valor.toFixed(2)} - ${item.descricao}`;

    // Criar botão apagar
    const btnApagar = document.createElement('button');
    btnApagar.textContent = "Apagar";
    btnApagar.style.marginLeft = "10px";
    btnApagar.style.background = "#e74c3c";
    btnApagar.style.color = "white";
    btnApagar.style.border = "none";
    btnApagar.style.padding = "2px 6px";
    btnApagar.style.borderRadius = "4px";
    btnApagar.style.cursor = "pointer";

    btnApagar.onclick = () => {
      if (confirm("Quer mesmo apagar este item?")) {
        dados.splice(index, 1); // remove do array
        localStorage.setItem('dados', JSON.stringify(dados));
        atualizar(); // atualiza a lista
      }
    };

    li.appendChild(btnApagar);
    lista.appendChild(li);

    if (item.tipo === 'entrada') saldo += item.valor;
    if (item.tipo === 'saida') saldo -= item.valor;
  });

  document.getElementById('saldo').textContent =
    `Saldo: €${saldo.toFixed(2)}`;
}


atualizar();

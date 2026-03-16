function formatarMoeda(valor) {
    valor = valor.replace(/\D/g, "");
    return (Number(valor) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatarPorcentagem(valor) {
    valor = valor.replace(/\D/g, "");
    return (Number(valor) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '%';
}
function extrairNumeroFormatado(valor) {
    return parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}
['valorInicial', 'valorMensal'].forEach(id => {
    document.getElementById(id).addEventListener('input', function (e) {
        this.value = formatarMoeda(this.value);
    });
});
const taxaInput = document.getElementById('taxaJuros');
taxaInput.addEventListener('input', function () {
    const valor = this.value.replace(/\D/g, '');
    if (valor === '') {
        this.value = '';
        return;
    }
    this.value = (Number(valor) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '%';
});
taxaInput.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace') {
        e.preventDefault();
        const valor = this.value.replace(/\D/g, '');
        const novoValor = valor.slice(0, -1);
        if (novoValor.length === 0) {
            this.value = '';
        } else {
            this.value = (Number(novoValor) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '%';
        }
    }
});

function exibirErro(mensagem) {
    const erroDiv = document.getElementById('mensagem-erro');
    erroDiv.innerText = mensagem;
    erroDiv.style.display = 'block';
}

function ocultarErro() {
    const erroDiv = document.getElementById('mensagem-erro');
    erroDiv.style.display = 'none';
}

function criarGrafico(juros, investido) {
    const ctx = document.getElementById('grafico').getContext('2d');
    if (window.graficoChart)
        window.graficoChart.destroy();
    const labels = juros.map((_, idx) => idx);
    window.graficoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Total com Juros',
                    data: juros,
                    borderColor: '#28a745',
                    backgroundColor: '#28a745',
                    fill: false
                },
                {
                    label: 'Total Investido',
                    data: investido,
                    borderColor: 'black',
                    backgroundColor: 'black',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: tooltipItems => `Mês: ${tooltipItems[0].label}`,
                        label: tooltipItem => {
                            const valor = Number(tooltipItem.raw).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            });
                            return `${tooltipItem.dataset.label}: ${valor}`;
                        }
                    }
                },
                legend: {
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Período (Meses)',
                        font: {
                            size: 16
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor (R$)',
                        font: {
                            size: 16
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            elements: {
                point: {
                    radius: 2,
                    hoverRadius: 10,
                    backgroundColor: 'black'
                },
                line: {
                    tension: 0.5
                }
            }
        }
    });
}

function calcular() {
    ocultarErro();
    const valorInicial = extrairNumeroFormatado(document.getElementById('valorInicial').value);
    const valorMensal = extrairNumeroFormatado(document.getElementById('valorMensal').value);
    let taxa = extrairNumeroFormatado(document.getElementById('taxaJuros').value) / 100;
    const tipoTaxa = document.getElementById('tipoTaxa').value;
    let periodo = parseInt(document.getElementById('periodo').value);
    const tipoPeriodo = document.getElementById('tipoPeriodo').value;

    if (!valorInicial && !valorMensal)
        return exibirErro('Insira um valor inicial ou um valor mensal para continuar.');
    if (isNaN(periodo) || periodo <= 0)
        return exibirErro('Insira um período válido.');
    if (tipoPeriodo === 'anos')
        periodo *= 12;
    if (periodo > 1200)
        return exibirErro('Período muito longo. Por favor, reduza para no máximo 100 anos.');
    if (tipoTaxa === 'anual')
        taxa = Math.pow(1 + taxa, 1 / 12) - 1;

    let totalInvestido = valorInicial;
    let totalComJuros = valorInicial;
    let totalJurosAcumulado = 0;
    const juros = [];
    const investido = [];
    const tbody = document.querySelector('#tabela tbody');
    tbody.innerHTML = "";

    let rendimentoMes = totalComJuros * taxa;
    totalJurosAcumulado = rendimentoMes;
    tbody.innerHTML += `
        <tr>
            <td>0</td>
            <td>${rendimentoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${totalInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${totalJurosAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${(totalInvestido + totalJurosAcumulado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        </tr>
    `;
    juros.push(totalComJuros);
    investido.push(totalInvestido);

    for (let mes = 1; mes <= periodo; mes++) {
        totalInvestido += valorMensal;
        rendimentoMes = (totalInvestido + totalJurosAcumulado) * taxa;
        totalComJuros += valorMensal + rendimentoMes;
        totalJurosAcumulado += rendimentoMes;

        tbody.innerHTML += `
            <td>${mes}</td>
            <td>${rendimentoMes.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })}</td>
            <td>${totalInvestido.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })}</td>
            <td>${totalJurosAcumulado.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })}</td>
            <td>${(totalInvestido + totalJurosAcumulado).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })}</td>
        </tr>
        `;
        juros.push(totalComJuros);
        investido.push(totalInvestido);
    }

    document.getElementById('output-container').style.display = 'block';
    document.getElementById('resumo').innerHTML = `
        <div class="resumo">
            <div><strong>Total Acumulado:</strong><br>${(totalInvestido + totalJurosAcumulado).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })}</div>
            <div><strong>Total Investido:</strong><br>${totalInvestido.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })}</div>
            <div><strong>Total de Juros:</strong><br>${totalJurosAcumulado.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })}</div>
        </div>
    `;
    criarGrafico(juros, investido);
}



function limpar() {
    ['valorInicial', 'valorMensal', 'taxaJuros', 'periodo'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('tipoTaxa').selectedIndex = 0;
    document.getElementById('tipoPeriodo').selectedIndex = 0;
    document.querySelector('#tabela tbody').innerHTML = '';
    document.getElementById('output-container').style.display = 'none';
    if (window.graficoChart)
        window.graficoChart.destroy();
}


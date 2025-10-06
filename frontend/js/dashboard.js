const API_URL = window.location.hostname.includes('github.io') 
    ? 'https://seu-surebet-backend.herokuapp.com/api'
    : 'http://localhost:3000/api';
    
// Inicialização do Dashboard
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('surebet_token');
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar dados do usuário
    document.getElementById('userName').textContent = userData.name || '-';
    document.getElementById('userBankroll').textContent = userData.bankroll ? userData.bankroll.toFixed(2) : '0.00';
    
    // Conectar WebSocket
    socket = io(API_URL.replace('/api', ''));
    socket.emit('join_room', userData.id);
    
    // Carregar dados iniciais
    loadDashboardData();
    loadRecentOperations();
    
    // Configurar event listeners
    document.getElementById('quickCalcForm').addEventListener('submit', handleQuickCalculation);
});

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('surebet_token');
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateDashboardMetrics(data);
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// Atualizar métricas
function updateDashboardMetrics(data) {
    if (data.performance) {
        document.getElementById('totalProfit').textContent = 
            `R$ ${(data.performance.total_profit || 0).toFixed(2)}`;
        
        document.getElementById('avgROI').textContent = 
            `${((data.performance.avg_profit || 0) > 0 ? data.performance.avg_profit.toFixed(2) : '0.00')}%`;
        
        document.getElementById('totalOperations').textContent = 
            data.performance.total_ops || 0;
        
        document.getElementById('successRate').textContent = 
            data.performance.total_ops ? '85%' : '0%'; // Simulado
    }
}

// Carregar operações recentes
async function loadRecentOperations() {
    // Implementação similar à do dashboard
}

// Cálculo rápido de surebet
async function handleQuickCalculation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const calculationData = {
        odds1: parseFloat(formData.get('odd1')),
        odds2: parseFloat(formData.get('odd2')),
        stakeTotal: parseFloat(formData.get('stakeTotal')),
        casa1: formData.get('casa1'),
        casa2: formData.get('casa2')
    };
    
    try {
        const token = localStorage.getItem('surebet_token');
        const response = await fetch(`${API_URL}/calculate-surebet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(calculationData)
        });
        
        if (response.ok) {
            const result = await response.json();
            displayCalculationResult(result);
        } else {
            alert('Erro no cálculo');
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }
}

// Exibir resultado do cálculo
function displayCalculationResult(result) {
    const resultDiv = document.getElementById('calculationResult');
    
    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <h5><i class="fas fa-check-circle me-2"></i>OPORTUNIDADE ENCONTRADA!</h5>
            <p class="mb-1"><strong>Lucro Garantido:</strong> R$ ${result.guaranteedProfit}</p>
            <p class="mb-1"><strong>ROI:</strong> ${result.roi}%</p>
            <p class="mb-1"><strong>Margem de Lucro:</strong> ${result.profitPercentage}%</p>
        </div>
        
        <div class="row mt-3">
            <div class="col-6">
                <div class="card">
                    <div class="card-body text-center">
                        <h6>${result.stakeRecommendation.casa1.nome}</h6>
                        <p class="mb-1">Odd: ${result.stakeRecommendation.casa1.odd}</p>
                        <p class="mb-1"><strong>Stake: R$ ${result.stakeRecommendation.casa1.stake}</strong></p>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card">
                    <div class="card-body text-center">
                        <h6>${result.stakeRecommendation.casa2.nome}</h6>
                        <p class="mb-1">Odd: ${result.stakeRecommendation.casa2.odd}</p>
                        <p class="mb-1"><strong>Stake: R$ ${result.stakeRecommendation.casa2.stake}</strong></p>
                    </div>
                </div>
            </div>
        </div>
        
        <button class="btn btn-premium w-100 mt-3" onclick="registerOperation(${JSON.stringify(result).replace(/"/g, '&quot;')})">
            <i class="fas fa-save me-2"></i>Registrar Operação
        </button>
    `;
}

// Registrar operação
async function registerOperation(opportunity) {
    try {
        const token = localStorage.getItem('surebet_token');
        const response = await fetch(`${API_URL}/operations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                surebet_id: null, // Em produção, isso viria de uma surebet salva
                stake_amount: parseFloat(opportunity.stakeRecommendation.casa1.stake) + 
                            parseFloat(opportunity.stakeRecommendation.casa2.stake),
                expected_profit: parseFloat(opportunity.guaranteedProfit)
            })
        });
        
        if (response.ok) {
            alert('Operação registrada com sucesso!');
            loadDashboardData();
            loadRecentOperations();
        } else {
            alert('Erro ao registrar operação');
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }
}

// Logout
function logout() {
    localStorage.removeItem('surebet_token');
    localStorage.removeItem('user_data');
    window.location.href = 'index.html';
}
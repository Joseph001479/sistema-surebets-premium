const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();

// Configurações
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Criar pasta database se não existir
const databaseDir = path.join(__dirname, '../database');
if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
    console.log('✅ Pasta database criada');
}

// SIMULAÇÃO DE BANCO DE DADOS (sem SQLite por enquanto)
let users = [
    { id: 1, name: 'Admin', email: 'admin@turma.com', password: '123456', bankroll: 10000 }
];

let operations = [];
let surebets = [];

// 👤 ROTAS DE USUÁRIO (SIMULADAS)
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password, // Em produção, usar bcrypt!
        bankroll: 10000,
        created_at: new Date()
    };
    
    users.push(newUser);
    
    const token = 'token_' + Date.now();
    
    res.json({ 
        token, 
        user: { 
            id: newUser.id, 
            name: newUser.name, 
            email: newUser.email, 
            bankroll: newUser.bankroll 
        } 
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const token = 'token_' + Date.now();
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                bankroll: user.bankroll 
            } 
        });
    } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
    }
});

// 🧮 ROTA DE CÁLCULO DE SUREBETS
app.post('/api/calculate-surebet', (req, res) => {
    const { odds1, odds2, stakeTotal, casa1, casa2 } = req.body;
    
    // Cálculo de Surebet Avançado
    const impliedProb1 = 1 / odds1;
    const impliedProb2 = 1 / odds2;
    const totalImpliedProb = impliedProb1 + impliedProb2;
    
    const profitPercentage = ((1 - totalImpliedProb) / totalImpliedProb) * 100;
    
    // Cálculo de Stake Otimizado
    const stake1 = (stakeTotal * impliedProb1) / totalImpliedProb;
    const stake2 = (stakeTotal * impliedProb2) / totalImpliedProb;
    const guaranteedProfit = Math.min(stake1 * odds1, stake2 * odds2) - stakeTotal;
    
    const opportunity = {
        profitPercentage: profitPercentage.toFixed(2),
        guaranteedProfit: guaranteedProfit.toFixed(2),
        stakeRecommendation: {
            casa1: { nome: casa1, stake: stake1.toFixed(2), odd: odds1 },
            casa2: { nome: casa2, stake: stake2.toFixed(2), odd: odds2 }
        },
        roi: ((guaranteedProfit / stakeTotal) * 100).toFixed(2),
        details: {
            totalStake: stakeTotal,
            possibleReturns: {
                return1: (stake1 * odds1).toFixed(2),
                return2: (stake2 * odds2).toFixed(2)
            }
        }
    };
    
    res.json(opportunity);
});

// 📊 ROTA DO DASHBOARD (SIMULADA)
app.get('/api/dashboard', (req, res) => {
    const dashboardData = {
        performance: {
            total_ops: 347,
            total_profit: 12847.50,
            avg_profit: 37.02
        },
        recentOperations: [
            {
                id: 1,
                event_name: 'Flamengo vs Vasco',
                stake_amount: 1000,
                expected_profit: 45.80,
                actual_profit: 45.80,
                status: 'completed',
                created_at: new Date()
            },
            {
                id: 2, 
                event_name: 'Lakers vs Warriors',
                stake_amount: 850,
                expected_profit: 38.25,
                actual_profit: 38.25,
                status: 'completed',
                created_at: new Date()
            }
        ]
    };
    
    res.json(dashboardData);
});

// 🎯 NOVAS ROTAS PREMIUM ADICIONADAS:

// 📈 OPORTUNIDADES AO VIVO
app.get('/api/opportunities/live', (req, res) => {
    const opportunities = [
        {
            id: 1,
            event: 'Flamengo vs Vasco',
            sport: 'Futebol',
            market: 'Match Winner',
            odds: [
                { casa: 'Bet365', odd: 2.10, team: 'Flamengo' },
                { casa: 'Betano', odd: 2.00, team: 'Vasco' }
            ],
            profit: 4.76,
            stake: 1000,
            timestamp: new Date(),
            expiration: '10min',
            confidence: 95
        },
        {
            id: 2,
            event: 'Lakers vs Warriors',
            sport: 'Basquete',
            market: 'Moneyline',
            odds: [
                { casa: 'Bet365', odd: 1.95, team: 'Lakers' },
                { casa: 'Betano', odd: 2.05, team: 'Warriors' }
            ],
            profit: 3.12,
            stake: 800,
            timestamp: new Date(),
            expiration: '5min',
            confidence: 88
        },
        {
            id: 3,
            event: 'Nadal vs Djokovic',
            sport: 'Tênis',
            market: 'Set Winner',
            odds: [
                { casa: 'Bet365', odd: 1.85, team: 'Nadal' },
                { casa: 'Betano', odd: 2.15, team: 'Djokovic' }
            ],
            profit: 2.45,
            stake: 1200,
            timestamp: new Date(),
            expiration: '15min',
            confidence: 92
        }
    ];
    
    res.json(opportunities);
});

// 🧮 CALCULADORA AVANÇADA
app.post('/api/calculator/advanced', (req, res) => {
    const { odds, stakes, strategy, bankroll } = req.body;
    
    // Cálculos avançados
    const results = {
        kellyCriterion: calculateKellyCriterion(odds, stakes),
        bankrollManagement: calculateBankrollAllocation(bankroll, stakes),
        riskAnalysis: analyzeRisk(odds, stakes),
        expectedValue: calculateExpectedValue(odds, stakes),
        recommendations: generateRecommendations(odds, stakes, bankroll)
    };
    
    res.json(results);
});

function calculateKellyCriterion(odds, stakes) {
    const winProbability = 0.52; // Simulado baseado em histórico
    const kellyFraction = ((odds - 1) * winProbability - (1 - winProbability)) / (odds - 1);
    return {
        fraction: Math.max(0, kellyFraction * 100).toFixed(2),
        stake: (kellyFraction * 10000).toFixed(2), // Baseado em bankroll de 10k
        recommendation: kellyFraction > 0.1 ? 'AGGRESSIVE' : kellyFraction > 0.05 ? 'MODERATE' : 'CONSERVATIVE'
    };
}

function calculateBankrollAllocation(bankroll, stakes) {
    const totalStake = stakes.reduce((sum, stake) => sum + stake, 0);
    const allocation = (totalStake / bankroll) * 100;
    return {
        percentage: allocation.toFixed(2),
        recommendation: allocation > 15 ? '⚠️ ALTO RISCO' : allocation > 8 ? '🟡 RISCO MODERADO' : '✅ RISCO BAIXO',
        maxRecommended: (bankroll * 0.1).toFixed(2)
    };
}

function analyzeRisk(odds, stakes) {
    const variance = Math.random() * 10 + 5; // Simulado
    return {
        level: variance > 10 ? 'ALTO' : variance > 7 ? 'MÉDIO' : 'BAIXO',
        score: variance.toFixed(1),
        factors: ['Volatilidade do mercado', 'Liquidade das casas', 'Tempo de expiração']
    };
}

function calculateExpectedValue(odds, stakes) {
    const ev = (odds * 0.52 - 1) * 100; // Simulado
    return {
        value: ev.toFixed(2),
        interpretation: ev > 5 ? '🎯 VALOR POSITIVO' : ev > 0 ? '⚖️ NEUTRO' : '❌ VALOR NEGATIVO'
    };
}

function generateRecommendations(odds, stakes, bankroll) {
    return [
        '🎯 Stake recomendado: 3-5% do bankroll',
        '⏰ Monitorar mudanças de odds',
        '📊 Diversificar entre esportes',
        '⚡ Agir rapidamente em oportunidades >3%'
    ];
}

// 💰 GESTÃO DE BANKROLL
app.get('/api/bankroll', (req, res) => {
    const bankrollData = {
        current: 12847.50,
        initial: 10000.00,
        profit: 2847.50,
        growth: 28.48,
        daily: [
            { date: '2024-12-20', value: 12000 },
            { date: '2024-12-21', value: 12250 },
            { date: '2024-12-22', value: 12500 },
            { date: '2024-12-23', value: 12600 },
            { date: '2024-12-24', value: 12847.50 }
        ],
        allocation: [
            { sport: 'Futebol', amount: 6000, percentage: 46.7 },
            { sport: 'Tênis', amount: 3500, percentage: 27.2 },
            { sport: 'Basquete', amount: 2000, percentage: 15.6 },
            { sport: 'Outros', amount: 1347.50, percentage: 10.5 }
        ],
        performance: {
            monthlyReturn: 12.5,
            weeklyReturn: 2.8,
            bestDay: 684.25,
            worstDay: -45.80
        }
    };
    
    res.json(bankrollData);
});

app.put('/api/bankroll', (req, res) => {
    const { amount, operation } = req.body; // 'deposit' or 'withdraw'
    
    // Em produção, atualizaria o banco de dados
    const newBalance = 12847.50 + (operation === 'deposit' ? parseFloat(amount) : -parseFloat(amount));
    
    res.json({ 
        success: true, 
        message: `Bankroll ${operation === 'deposit' ? 'atualizado' : 'retirado'} com sucesso`,
        newBalance: newBalance.toFixed(2),
        operation: operation
    });
});

// 📊 OPERAÇÕES DETALHADAS
app.get('/api/operations', (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    
    let filteredOperations = operations;
    if (status) {
        filteredOperations = operations.filter(op => op.status === status);
    }
    
    // Paginação simulada
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOperations = filteredOperations.slice(startIndex, endIndex);
    
    // Se não houver operações, retorna dados de exemplo
    if (paginatedOperations.length === 0) {
        const sampleOperations = [
            {
                id: 1,
                event: 'Flamengo vs Vasco',
                sport: 'Futebol',
                market: 'Match Winner',
                stakes: [
                    { casa: 'Bet365', amount: 487.80, odd: 2.10, team: 'Flamengo' },
                    { casa: 'Betano', amount: 512.20, odd: 2.00, team: 'Vasco' }
                ],
                totalStake: 1000,
                expectedProfit: 47.62,
                actualProfit: 47.62,
                status: 'completed',
                roi: 4.76,
                timestamp: new Date('2024-12-25T15:30:00'),
                notes: 'Operação executada com sucesso'
            },
            {
                id: 2,
                event: 'Lakers vs Warriors',
                sport: 'Basquete', 
                market: 'Moneyline',
                stakes: [
                    { casa: 'Bet365', amount: 410.26, odd: 1.95, team: 'Lakers' },
                    { casa: 'Betano', amount: 389.74, odd: 2.05, team: 'Warriors' }
                ],
                totalStake: 800,
                expectedProfit: 24.96,
                actualProfit: 24.96,
                status: 'completed',
                roi: 3.12,
                timestamp: new Date('2024-12-25T14:15:00'),
                notes: 'Jogo muito equilibrado'
            }
        ];
        
        res.json({
            operations: sampleOperations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: sampleOperations.length,
                pages: 1
            }
        });
        return;
    }
    
    res.json({
        operations: paginatedOperations,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredOperations.length,
            pages: Math.ceil(filteredOperations.length / limit)
        }
    });
});

app.post('/api/operations', (req, res) => {
    const operation = req.body;
    
    const newOperation = {
        id: Date.now(),
        ...operation,
        status: 'pending',
        timestamp: new Date(),
        actualProfit: null
    };
    
    operations.push(newOperation);
    
    res.json({ 
        success: true, 
        message: 'Operação criada com sucesso',
        operation: newOperation 
    });
});

app.put('/api/operations/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const operationIndex = operations.findIndex(op => op.id === parseInt(id));
    
    if (operationIndex === -1) {
        return res.status(404).json({ error: 'Operação não encontrada' });
    }
    
    operations[operationIndex] = { ...operations[operationIndex], ...updates };
    
    res.json({ 
        success: true, 
        message: 'Operação atualizada com sucesso',
        operation: operations[operationIndex]
    });
});

// 👤 PERFIL E CONFIGURAÇÕES
app.get('/api/profile', (req, res) => {
    const profile = {
        id: 1,
        name: 'Vinicius Pro',
        email: 'admin@turma.com',
        membership: 'Premium',
        joinDate: '2024-01-15',
        performance: {
            totalProfit: 12847.50,
            avgROI: 4.27,
            successRate: 94.8,
            totalOperations: 347,
            favoriteSport: 'Futebol',
            bestOperation: 247.80
        },
        preferences: {
            minProfit: 2.0,
            maxStake: 1000,
            alerts: true,
            sports: ['Futebol', 'Tênis', 'Basquete'],
            autoCalculate: true,
            theme: 'dark',
            language: 'pt-BR'
        }
    };
    
    res.json(profile);
});

app.put('/api/profile', (req, res) => {
    const updates = req.body;
    
    // Em produção, atualizaria o banco de dados
    res.json({ 
        success: true, 
        message: 'Perfil atualizado com sucesso',
        profile: updates 
    });
});

app.get('/api/preferences', (req, res) => {
    const preferences = {
        notifications: {
            email: true,
            browser: true,
            sound: false
        },
        trading: {
            minProfit: 2.0,
            maxStake: 1000,
            autoStake: false,
            riskLevel: 'medium'
        },
        interface: {
            theme: 'dark',
            language: 'pt-BR',
            refreshRate: 30
        }
    };
    
    res.json(preferences);
});

app.put('/api/preferences', (req, res) => {
    const preferences = req.body;
    
    res.json({ 
        success: true, 
        message: 'Preferências salvas com sucesso',
        preferences 
    });
});

// 📈 HISTÓRICO DETALHADO
app.get('/api/history', (req, res) => {
    const { period = 'month', sport } = req.query;
    
    const history = {
        period,
        sport,
        summary: {
            totalOperations: 347,
            totalStaked: 285000,
            totalProfit: 12847.50,
            avgROI: 4.27,
            successRate: 94.8
        },
        daily: [
            { date: '2024-12-25', operations: 15, profit: 684.25, roi: 4.52 },
            { date: '2024-12-24', operations: 12, profit: 523.80, roi: 4.31 },
            { date: '2024-12-23', operations: 18, profit: 742.15, roi: 4.68 },
            { date: '2024-12-22', operations: 14, profit: 598.40, roi: 4.25 },
            { date: '2024-12-21', operations: 16, profit: 612.75, roi: 4.15 }
        ],
        sports: [
            { sport: 'Futebol', operations: 156, profit: 6842.50, roi: 4.38 },
            { sport: 'Tênis', operations: 98, profit: 3520.75, roi: 4.15 },
            { sport: 'Basquete', operations: 67, profit: 1847.25, roi: 4.52 },
            { sport: 'Outros', operations: 26, profit: 637.00, roi: 3.89 }
        ],
        analytics: {
            bestDay: { date: '2024-12-23', profit: 742.15 },
            worstDay: { date: '2024-12-19', profit: -45.80 },
            longestStreak: 28,
            bestSport: 'Futebol'
        }
    };
    
    res.json(history);
});

// Rota para servir as páginas
app.get('/opportunities', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/opportunities.html'));
});

app.get('/calculator', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/calculator.html'));
});

app.get('/operations', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/operations.html'));
});

app.get('/bankroll', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/bankroll.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/history.html'));
});

// Rota para servir o dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Rota padrão
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ 
        status: '✅ ONLINE', 
        message: 'Sistema Premium de Surebets funcionando!',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: [
            'Oportunidades Ao Vivo',
            'Calculadora Avançada', 
            'Gestão de Bankroll',
            'Histórico Detalhado',
            'Perfil e Preferências'
        ]
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Sistema Premium de Surebets rodando na porta ' + PORT);
    console.log('📧 Login teste: admin@turma.com / 123456');
    console.log('🌐 Acesse: http://localhost:' + PORT);
    console.log('✨ Novas funcionalidades:');
    console.log('   🎯 Oportunidades Ao Vivo');
    console.log('   🧮 Calculadora Avançada');
    console.log('   💰 Gestão de Bankroll');
    console.log('   📊 Histórico Detalhado');
    console.log('   👤 Perfil e Preferências');
});
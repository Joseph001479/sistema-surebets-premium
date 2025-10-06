const API_URL = window.location.hostname.includes('github.io') 
    ? 'https://sistema-surebets-premium-ba6dc287994f.herokuapp.com/api'
    : 'http://localhost:3000/api';

// Verificar se já está logado
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('surebet_token');
    if (token) {
        window.location.href = 'frontend/dashboard.html';
    }
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('surebet_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            window.location.href = 'frontend/dashboard.html';
        } else {
            alert('Erro: ' + data.error);
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }
});

// Registro
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('surebet_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            window.location.href = 'frontend/dashboard.html';
        } else {
            alert('Erro: ' + data.error);
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }

});

// script.js – Login com JSONBin.io + redirecionamento para app ou admin
(function() {
  "use strict";

  // ===== CONFIGURAÇÃO =====
  const APP_URL = 'https://devgabrielgarana20.github.io/GUARANItech-G3-IA/'; // URL do seu app de IA
  const API_KEY = '$2a$10$B9j5yKhIwDysYmdTVdLh2eYE/2IIcd5inVVdA55qQnzO3Hm5aXkCm';
  const BIN_ID = '6a3f3000f5f4af5e29370d37';
  const BASE_URL = `https://api.jsonbin.io/v3/b/6a3f3000f5f4af5e29370d37`;

  // ===== DOM =====
  const loginScreen = document.getElementById('loginScreen');
  const registerScreen = document.getElementById('registerScreen');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterLink = document.getElementById('showRegisterLink');
  const showLoginLink = document.getElementById('showLoginLink');
  const messageBox = document.getElementById('messageBox');
  const forgotLink = document.getElementById('forgotLink');
  const forgotModal = document.getElementById('forgotModal');
  const modalClose = document.querySelector('.modal-close');
  const resetBtn = document.getElementById('resetBtn');
  const resetEmail = document.getElementById('resetEmail');
  const adminRedirectBtn = document.getElementById('adminRedirectBtn');

  // Campos login
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const rememberMe = document.getElementById('rememberMe');

  // Campos cadastro
  const regName = document.getElementById('regName');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regConfirm = document.getElementById('regConfirm');

  // Botões
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  // ===== HELPERS =====
  function showMessage(text, type = 'info') {
    messageBox.textContent = text;
    messageBox.className = 'message-box show ' + type;
    clearTimeout(window.msgTimeout);
    window.msgTimeout = setTimeout(() => {
      messageBox.className = 'message-box';
    }, type === 'success' ? 5000 : 4000);
  }

  function clearMessage() {
    messageBox.className = 'message-box';
    clearTimeout(window.msgTimeout);
  }

  function setLoading(btn, loading) {
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    btn.disabled = loading;
    if (loading) {
      text.style.display = 'none';
      spinner.style.display = 'inline';
    } else {
      text.style.display = 'inline';
      spinner.style.display = 'none';
    }
  }

  function showLogin() {
    loginScreen.classList.add('active');
    registerScreen.classList.remove('active');
    clearMessage();
    loadStoredCredentials();
  }

  function showRegister() {
    registerScreen.classList.add('active');
    loginScreen.classList.remove('active');
    clearMessage();
    regName.value = '';
    regEmail.value = '';
    regPassword.value = '';
    regConfirm.value = '';
  }

  // ===== API =====
  async function fetchUsers() {
    try {
      const response = await fetch(BASE_URL, {
        headers: { 'X-Master-Key': API_KEY }
      });
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const data = await response.json();
      return data.record?.usuarios || [];
    } catch (error) {
      console.error('fetchUsers error:', error);
      return null;
    }
  }

  async function saveUsers(users) {
    try {
      const currentData = await fetch(BASE_URL, {
        headers: { 'X-Master-Key': API_KEY }
      }).then(res => res.json());
      const record = currentData.record || {};
      record.usuarios = users;
      const response = await fetch(BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(record)
      });
      if (!response.ok) throw new Error('Erro ao salvar dados');
      return true;
    } catch (error) {
      console.error('saveUsers error:', error);
      return false;
    }
  }

  // ===== LOCAL STORAGE =====
  function loadStoredCredentials() {
    const savedEmail = localStorage.getItem('minimal_remember');
    if (savedEmail) {
      loginEmail.value = savedEmail;
      rememberMe.checked = true;
    } else {
      loginEmail.value = '';
      rememberMe.checked = false;
    }
    loginPassword.value = '';
  }

  // ===== NAVEGAÇÃO =====
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });

  // ===== MOSTRAR/OCULTAR SENHA =====
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
      }
    });
  });

  // ===== MODAL RECUPERAR SENHA =====
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.classList.add('active');
    resetEmail.value = '';
  });

  modalClose.addEventListener('click', () => {
    forgotModal.classList.remove('active');
  });

  forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) forgotModal.classList.remove('active');
  });

  resetBtn.addEventListener('click', async () => {
    const email = resetEmail.value.trim();
    if (!email || !email.includes('@')) {
      showMessage('Digite um e-mail válido.', 'error');
      return;
    }
    showMessage(`📧 Link de recuperação enviado para ${email} (simulação)`, 'success');
    forgotModal.classList.remove('active');
  });

  // ===== REDIRECIONAMENTO PARA ADMIN =====
  adminRedirectBtn.addEventListener('click', function() {
    // Verifica se há um usuário logado e se ele é admin
    const logged = localStorage.getItem('user_logged');
    if (logged) {
      try {
        const user = JSON.parse(logged);
        if (user.is_admin) {
          window.location.href = 'admin.html';
          return;
        } else {
          showMessage('Você não tem permissão para acessar o painel admin.', 'error');
          return;
        }
      } catch(e) {}
    }
    // Se não estiver logado, tenta login e redireciona
    showMessage('Faça login com uma conta de administrador.', 'info');
    // Opcional: preencher com admin padrão para facilitar
    loginEmail.value = 'contaadmin';
    loginPassword.value = 'admin123';
    rememberMe.checked = true;
    // Dispara login automático? Não, melhor deixar o usuário clicar em "Entrar" depois.
  });

  // ===== LOGIN =====
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    setLoading(loginBtn, true);

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
      showMessage('Preencha e-mail e senha.', 'error');
      setLoading(loginBtn, false);
      return;
    }

    const users = await fetchUsers();
    if (users === null) {
      showMessage('Erro ao conectar com o servidor.', 'error');
      setLoading(loginBtn, false);
      return;
    }

    const user = users.find(u => u.email === email && u.senha === password);
    if (user) {
      // Salva o usuário logado no localStorage
      const userData = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        is_admin: user.is_admin || false,
        foto: user.foto || ''
      };
      localStorage.setItem('user_logged', JSON.stringify(userData));

      if (rememberMe.checked) {
        localStorage.setItem('minimal_remember', email);
      } else {
        localStorage.removeItem('minimal_remember');
      }

      showMessage(`✅ Bem-vindo, ${user.nome}! Redirecionando...`, 'success');

      // Redireciona baseado no tipo de usuário
      setTimeout(() => {
        if (user.is_admin) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = APP_URL;
        }
      }, 1500);

    } else {
      showMessage('E-mail ou senha incorretos.', 'error');
    }
    setLoading(loginBtn, false);
  });

  // ===== CADASTRO =====
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    setLoading(registerBtn, true);

    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    const confirm = regConfirm.value.trim();

    if (!name || !email || !password || !confirm) {
      showMessage('Preencha todos os campos obrigatórios.', 'error');
      setLoading(registerBtn, false);
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showMessage('Digite um e-mail válido.', 'error');
      setLoading(registerBtn, false);
      return;
    }
    if (password.length < 6) {
      showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
      setLoading(registerBtn, false);
      return;
    }
    if (password !== confirm) {
      showMessage('As senhas não coincidem.', 'error');
      setLoading(registerBtn, false);
      return;
    }

    const users = await fetchUsers();
    if (users === null) {
      showMessage('Erro ao conectar com o servidor.', 'error');
      setLoading(registerBtn, false);
      return;
    }

    if (users.some(u => u.email === email)) {
      showMessage('Este e-mail já está cadastrado.', 'error');
      setLoading(registerBtn, false);
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      nome: name,
      email: email,
      senha: password,
      foto: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=7a8cff&color=fff&size=64',
      is_admin: false,
      is_banido: false,
      data_criacao: new Date().toISOString()
    };

    users.push(newUser);
    const saved = await saveUsers(users);
    if (!saved) {
      showMessage('Erro ao salvar cadastro. Tente novamente.', 'error');
      setLoading(registerBtn, false);
      return;
    }

    showMessage('✅ Cadastro concluído! Agora faça login.', 'success');
    loginEmail.value = email;
    loginPassword.value = '';
    rememberMe.checked = true;
    localStorage.setItem('minimal_remember', email);

    regName.value = '';
    regEmail.value = '';
    regPassword.value = '';
    regConfirm.value = '';

    setTimeout(() => showLogin(), 1200);
    setLoading(registerBtn, false);
  });

  // ===== INICIALIZAÇÃO =====
  async function init() {
    // Se já houver um usuário logado, redireciona diretamente
    const logged = localStorage.getItem('user_logged');
    if (logged) {
      try {
        const user = JSON.parse(logged);
        // Verifica se ainda existe no banco
        const users = await fetchUsers();
        if (users) {
          const valid = users.find(u => u.id === user.id);
          if (valid) {
            if (user.is_admin) {
              window.location.href = 'admin.html';
            } else {
              window.location.href = APP_URL;
            }
            return;
          }
        }
      } catch(e) {
        localStorage.removeItem('user_logged');
      }
    }

    // Se não, mostra a tela de login
    const users = await fetchUsers();
    if (users === null) {
      showMessage('⚠️ Erro ao conectar com o servidor. Verifique sua API Key.', 'error');
    } else {
      if (users.length > 0) {
        showLogin();
      } else {
        showRegister();
        showMessage('📝 Primeiro acesso? Crie sua conta.', 'info');
      }
    }
  }

  init();
  console.log('🔐 Página de login com redirecionamento para app ou admin.');
})();
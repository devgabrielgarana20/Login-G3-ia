// script.js – lógica de login/cadastro com localStorage (salva no celular/PC)
(function() {
  "use strict";

  // elementos DOM
  const loginScreen = document.getElementById('loginScreen');
  const registerScreen = document.getElementById('registerScreen');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterLink = document.getElementById('showRegisterLink');
  const showLoginLink = document.getElementById('showLoginLink');
  const messageBox = document.getElementById('messageBox');
  const forgotLink = document.getElementById('forgotLink');

  // campos login
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const rememberMe = document.getElementById('rememberMe');

  // campos cadastro
  const regUsername = document.getElementById('regUsername');
  const regPassword = document.getElementById('regPassword');
  const regConfirm = document.getElementById('regConfirm');

  // ----- helpers -----
  function showMessage(text, type = 'info') {
    messageBox.textContent = text;
    messageBox.className = 'message-box show ' + type;
    // ocultar após 4s (mas manter se for success permanente?)
    if (type !== 'success') {
      clearTimeout(window.msgTimeout);
      window.msgTimeout = setTimeout(() => {
        messageBox.className = 'message-box';
      }, 4000);
    } else {
      // mensagem de sucesso fica um pouco mais, mas depois some
      clearTimeout(window.msgTimeout);
      window.msgTimeout = setTimeout(() => {
        messageBox.className = 'message-box';
      }, 5000);
    }
  }

  function clearMessage() {
    messageBox.className = 'message-box';
    clearTimeout(window.msgTimeout);
  }

  // alternar telas
  function showLogin() {
    loginScreen.classList.add('active');
    registerScreen.classList.remove('active');
    clearMessage();
    // preencher campos se houver dados salvos (lembrar)
    loadStoredCredentials();
  }

  function showRegister() {
    registerScreen.classList.add('active');
    loginScreen.classList.remove('active');
    clearMessage();
    // limpar campos do cadastro
    regUsername.value = '';
    regPassword.value = '';
    regConfirm.value = '';
  }

  // ----- localStorage (dados salvos no dispositivo) -----
  function getStoredUser() {
    try {
      const raw = localStorage.getItem('minimal_user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) { return null; }
  }

  function saveUser(username, password) {
    const userData = { username, password };
    localStorage.setItem('minimal_user', JSON.stringify(userData));
    // se "Lembre-me" estiver marcado, salvamos também o usuário para preencher
    if (rememberMe.checked) {
      localStorage.setItem('minimal_remember', username);
    } else {
      localStorage.removeItem('minimal_remember');
    }
  }

  // carrega credenciais salvas para preencher no login
  function loadStoredCredentials() {
    const user = getStoredUser();
    if (user) {
      loginUsername.value = user.username || '';
      // Não preenchemos a senha por segurança, mas podemos deixar vazio
      loginPassword.value = '';
      // Se existe usuário, marcamos o lembre-me (opcional)
      const remember = localStorage.getItem('minimal_remember');
      if (remember === user.username) {
        rememberMe.checked = true;
      } else {
        rememberMe.checked = false;
      }
    } else {
      loginUsername.value = '';
      loginPassword.value = '';
      rememberMe.checked = false;
    }
  }

  // verifica se já existe cadastro
  function hasUserRegistered() {
    return getStoredUser() !== null;
  }

  // ----- eventos de navegação entre telas -----
  showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    showRegister();
  });

  showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    showLogin();
  });

  // forgot link (apenas demonstração)
  forgotLink.addEventListener('click', function(e) {
    e.preventDefault();
    showMessage('🔐 Entre em contato com o instagram: @gb_zim17', 'info');
  });

  // ----- LOGIN -----
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessage();

    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
      showMessage('Preencha usuário e senha.', 'error');
      return;
    }

    // verifica se existe cadastro
    const stored = getStoredUser();
    if (!stored) {
      // nenhum cadastro: redireciona para cadastro
      showMessage('Nenhuma conta encontrada. Faça o cadastro primeiro.', 'error');
      setTimeout(() => showRegister(), 1200);
      return;
    }

    // valida credenciais
    if (stored.username === username && stored.password === password) {
      showMessage('✅ Login bem-sucedido! Redirecionando...', 'success');
      // salvar estado "lembre-me"
      if (rememberMe.checked) {
        localStorage.setItem('minimal_remember', username);
      } else {
        localStorage.removeItem('minimal_remember');
      }
      // Simula redirecionamento para outra página (aqui abrimos um link de exemplo)
      setTimeout(() => {
        // Exemplo: redireciona para uma página externa (substitua pelo seu link)
        window.location.href = 'https://devgabrielgarana20.github.io/GUARANItech-G3-IA/'; 
        // Caso queira apenas simular, descomente a linha abaixo e comente a de cima:
        // showMessage('🔗 Redirecionamento para a página principal (simulação).', 'info');
      }, 1200);
    } else {
      showMessage('Usuário ou senha incorretos.', 'error');
    }
  });

  // ----- CADASTRO (somente uma vez) -----
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearMessage();

    // verifica se já existe cadastro
    if (hasUserRegistered()) {
      showMessage('Já existe uma conta cadastrada. Faça login.', 'error');
      setTimeout(() => showLogin(), 1000);
      return;
    }

    const username = regUsername.value.trim();
    const password = regPassword.value.trim();
    const confirm = regConfirm.value.trim();

    if (!username || !password || !confirm) {
      showMessage('Preencha todos os campos.', 'error');
      return;
    }
    if (password.length < 4) {
      showMessage('A senha deve ter pelo menos 4 caracteres.', 'error');
      return;
    }
    if (password !== confirm) {
      showMessage('As senhas não coincidem.', 'error');
      return;
    }

    // salvar no localStorage
    saveUser(username, password);
    // marcar lembre-me automaticamente após cadastro
    rememberMe.checked = true;
    localStorage.setItem('minimal_remember', username);

    showMessage('✅ Cadastro concluído! Agora faça login.', 'success');
    // limpa campos de cadastro e vai para login
    regUsername.value = '';
    regPassword.value = '';
    regConfirm.value = '';

    // preenche login com os dados cadastrados
    loginUsername.value = username;
    loginPassword.value = ''; // não preenchemos a senha por segurança

    setTimeout(() => showLogin(), 1200);
  });

  // ----- INICIALIZAÇÃO -----
  // Se já houver cadastro, mostra login; senão, mostra cadastro (primeiro acesso)
  function init() {
    if (hasUserRegistered()) {
      showLogin();
      loadStoredCredentials();
      // Se houver usuário salvo e "lembre-me" ativo, podemos preencher
      const rememberUser = localStorage.getItem('minimal_remember');
      if (rememberUser) {
        const stored = getStoredUser();
        if (stored && stored.username === rememberUser) {
          loginUsername.value = stored.username;
          rememberMe.checked = true;
        }
      }
    } else {
      // primeiro acesso: tela de cadastro
      showRegister();
      // mensagem amigável
      showMessage('📝 Primeiro acesso? Crie sua conta.', 'info');
    }
  }

  init();

  // Anexar evento de limpeza quando trocar de tela (para não acumular mensagens)
  // já feito nas funções showLogin/showRegister
  // Pequeno truque: se clicar em "Registrar" vindo do login, limpa mensagem
  // já está nas funções.

  // extra: se houver erro de carregamento da imagem, manter o estilo
  console.log('🔐 Página de login minimalista com cadastro único e localStorage.');
})();
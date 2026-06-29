// admin.js – Painel Administrativo 100% Funcional
(function() {
    "use strict";

    // ===== CONFIGURAÇÃO DA API =====
    const API_KEY = '$2a$10$B9j5yKhIwDysYmdTVdLh2eYE/2IIcd5inVVdA55qQnzO3Hm5aXkCm';     // SUBSTITUA
    const BIN_ID = '6a3f3000f5f4af5e29370d37';       // SUBSTITUA
    const BASE_URL = `https://api.jsonbin.io/v3/b/6a3f3000f5f4af5e29370d37`;
    
    // ===== ESTADO =====
    let currentAdmin = null;
    let usuarios = [];
    let searchTerm = '';

    // ===== DOM REFS =====
    const $ = id => document.getElementById(id);
    const userTableBody = $('userTableBody');
    const statUsers = $('statUsers');
    const statAdmins = $('statAdmins');
    const statBanned = $('statBanned');
    const userCountBadge = $('userCountBadge');
    const adminNameDisplay = $('adminNameDisplay');
    const adminAvatarDisplay = $('adminAvatarDisplay');
    const welcomeAdmin = $('welcomeAdmin');
    const pageTitle = $('pageTitle');
    const searchInput = $('searchInput');

    // Tabs
    const tabItems = document.querySelectorAll('.sidebar-item[data-tab]');
    const tabPanes = {
        dashboard: $('tab-dashboard'),
        usuarios: $('tab-usuarios'),
        config: $('tab-config')
    };

    // Modais
    const userModal = $('userModal');
    const modalTitle = $('modalTitle');
    const userForm = $('userForm');
    const userId = $('userId');
    const userName = $('userName');
    const userEmail = $('userEmail');
    const userPassword = $('userPassword');
    const userAge = $('userAge');
    const userBirth = $('userBirth');
    const userAdmin = $('userAdmin');
    const userBanned = $('userBanned');

    // Config
    const configName = $('configName');
    const configEmail = $('configEmail');
    const configPassword = $('configPassword');
    const configForm = $('configForm');

    const toast = $('toast');
    const logoutBtn = $('logoutBtn');
    const btnAddUser = $('btnAddUser');
    const btnRefresh = $('btnRefresh');

    // ===== HELPERS =====
    function showToast(text, type = 'info') {
        toast.textContent = text;
        toast.className = 'toast show ' + type;
        clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => {
            toast.className = 'toast';
        }, 4000);
    }

    async function apiFetch() {
        try {
            const res = await fetch(BASE_URL, { headers: { 'X-Master-Key': API_KEY } });
            if (!res.ok) throw new Error('Erro ao buscar dados');
            const data = await res.json();
            return data.record || {};
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async function apiSave(record) {
        try {
            const res = await fetch(BASE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify(record)
            });
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async function loadData() {
        const data = await apiFetch();
        if (data) {
            usuarios = data.usuarios || [];
            return true;
        }
        return false;
    }

    async function saveData() {
        const data = await apiFetch();
        if (!data) return false;
        data.usuarios = usuarios;
        return await apiSave(data);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('pt-BR');
        } catch { return '-'; }
    }

    function calcularIdade(dataNasc) {
        if (!dataNasc) return '';
        try {
            const nasc = new Date(dataNasc);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const mes = hoje.getMonth() - nasc.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--;
            return idade;
        } catch { return ''; }
    }

    // ===== RENDER =====
    function renderStats() {
        const total = usuarios.length;
        const admins = usuarios.filter(u => u.is_admin).length;
        const banned = usuarios.filter(u => u.is_banido).length;
        statUsers.textContent = total;
        statAdmins.textContent = admins;
        statBanned.textContent = banned;
        userCountBadge.textContent = total;
    }

    function renderUsers() {
        let list = [...usuarios];
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            list = list.filter(u =>
                u.nome?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term)
            );
        }
        // Ordenar por ID decrescente
        list.sort((a,b) => b.id - a.id);

        userTableBody.innerHTML = '';
        if (list.length === 0) {
            userTableBody.innerHTML = `
                <tr><td colspan="8" style="text-align:center; padding:2rem; color:#94a3b8;">
                    <i class="fas fa-users" style="font-size:2rem; display:block; margin-bottom:0.5rem;"></i>
                    Nenhum usuário encontrado.
                </td></tr>
            `;
            return;
        }

        list.forEach(u => {
            const tr = document.createElement('tr');
            const adminBadge = u.is_admin ? '<span class="badge-status admin">Admin</span>' : '';
            const statusBadge = u.is_banido ? '<span class="badge-status banido">Banido</span>' : '<span class="badge-status ativo">Ativo</span>';
            const idade = u.idade || calcularIdade(u.data_nascimento) || '-';
            tr.innerHTML = `
                <td>${u.id}</td>
                <td><strong>${u.nome || 'Sem nome'}</strong></td>
                <td>${u.email}</td>
                <td>${idade}</td>
                <td>${formatDate(u.data_nascimento)}</td>
                <td>${adminBadge}</td>
                <td>${statusBadge}</td>
                <td class="actions-col">
                    <button class="action-btn primary" data-action="edit" data-id="${u.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn ${u.is_banido ? '' : 'danger'}" data-action="toggleBan" data-id="${u.id}" title="${u.is_banido ? 'Desbanir' : 'Banir'}">
                        <i class="fas ${u.is_banido ? 'fa-check-circle' : 'fa-ban'}"></i>
                    </button>
                    <button class="action-btn danger" data-action="delete" data-id="${u.id}" title="Deletar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });

        // Event listeners para ações
        userTableBody.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.dataset.action;
                const id = parseInt(this.dataset.id);
                if (action === 'edit') editUser(id);
                else if (action === 'toggleBan') toggleBan(id);
                else if (action === 'delete') deleteUser(id);
            });
        });
    }

    function renderAll() {
        renderStats();
        renderUsers();
    }

    // ===== CRUD USUÁRIOS =====
    async function editUser(id) {
        const user = usuarios.find(u => u.id === id);
        if (!user) {
            showToast('Usuário não encontrado.', 'error');
            return;
        }
        modalTitle.textContent = `✏️ Editar #${id}`;
        userId.value = id;
        userName.value = user.nome || '';
        userEmail.value = user.email || '';
        userPassword.value = '';
        userAge.value = user.idade || '';
        userBirth.value = user.data_nascimento || '';
        userAdmin.value = user.is_admin ? 'true' : 'false';
        userBanned.value = user.is_banido ? 'true' : 'false';
        userModal.classList.add('active');
    }

    async function deleteUser(id) {
        const user = usuarios.find(u => u.id === id);
        if (!user) {
            showToast('Usuário não encontrado.', 'error');
            return;
        }
        if (user.is_admin && user.id === currentAdmin.id) {
            showToast('Você não pode deletar a si mesmo.', 'error');
            return;
        }
        if (!confirm(`Deletar "${user.nome}" permanentemente?`)) return;

        usuarios = usuarios.filter(u => u.id !== id);
        const ok = await saveData();
        if (ok) {
            renderAll();
            showToast(`Usuário "${user.nome}" deletado.`, 'success');
        } else {
            showToast('Erro ao deletar.', 'error');
        }
    }

    async function toggleBan(id) {
        const user = usuarios.find(u => u.id === id);
        if (!user) {
            showToast('Usuário não encontrado.', 'error');
            return;
        }
        if (user.is_admin && user.id === currentAdmin.id) {
            showToast('Você não pode banir a si mesmo.', 'error');
            return;
        }
        user.is_banido = !user.is_banido;
        const ok = await saveData();
        if (ok) {
            renderAll();
            showToast(`Usuário ${user.is_banido ? 'banido' : 'desbanido'}.`, 'success');
        }
    }

    // ===== EVENTOS =====
    // Adicionar usuário
    btnAddUser.addEventListener('click', function() {
        modalTitle.textContent = '👤 Novo Usuário';
        userId.value = '';
        userName.value = '';
        userEmail.value = '';
        userPassword.value = '';
        userAge.value = '';
        userBirth.value = '';
        userAdmin.value = 'false';
        userBanned.value = 'false';
        userModal.classList.add('active');
    });

    // Submeter formulário
    userForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = userId.value ? parseInt(userId.value) : null;
        const nome = userName.value.trim();
        const email = userEmail.value.trim();
        const senha = userPassword.value.trim();
        const idade = userAge.value ? parseInt(userAge.value) : null;
        const data_nascimento = userBirth.value || null;
        const is_admin = userAdmin.value === 'true';
        const is_banido = userBanned.value === 'true';

        if (!nome || !email) {
            showToast('Nome e e-mail são obrigatórios.', 'error');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            showToast('E-mail inválido.', 'error');
            return;
        }
        if (!id && senha.length < 6) {
            showToast('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }

        // Verifica email duplicado
        const exists = usuarios.some(u => u.email === email && u.id !== id);
        if (exists) {
            showToast('Este e-mail já está cadastrado.', 'error');
            return;
        }

        if (id) {
            // Editar
            const user = usuarios.find(u => u.id === id);
            if (!user) {
                showToast('Usuário não encontrado.', 'error');
                return;
            }
            user.nome = nome;
            user.email = email;
            if (senha) user.senha = senha;
            user.idade = idade;
            user.data_nascimento = data_nascimento;
            user.is_admin = is_admin;
            user.is_banido = is_banido;
        } else {
            // Criar
            const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
            usuarios.push({
                id: newId,
                nome: nome,
                email: email,
                senha: senha || '123456',
                idade: idade,
                data_nascimento: data_nascimento,
                is_admin: is_admin,
                is_banido: is_banido,
                data_criacao: new Date().toISOString()
            });
        }

        const ok = await saveData();
        if (ok) {
            renderAll();
            showToast(id ? 'Usuário atualizado.' : 'Usuário criado.', 'success');
            userModal.classList.remove('active');
        } else {
            showToast('Erro ao salvar.', 'error');
        }
    });

    // Fechar modais
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = document.getElementById(this.dataset.modal);
            if (modal) modal.classList.remove('active');
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(el => {
        el.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('active');
        });
    });

    // Busca
    searchInput.addEventListener('input', function() {
        searchTerm = this.value;
        renderUsers();
    });

    // Refresh
    btnRefresh.addEventListener('click', async function() {
        await loadData();
        renderAll();
        showToast('Dados recarregados.', 'info');
    });

    // Configurações
    configForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nome = configName.value.trim();
        const email = configEmail.value.trim();
        const senha = configPassword.value.trim();

        if (!nome || !email) {
            showToast('Nome e e-mail são obrigatórios.', 'error');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            showToast('E-mail inválido.', 'error');
            return;
        }

        const admin = usuarios.find(u => u.id === currentAdmin.id);
        if (!admin) {
            showToast('Admin não encontrado.', 'error');
            return;
        }

        admin.nome = nome;
        admin.email = email;
        if (senha) {
            if (senha.length < 6) {
                showToast('Senha deve ter no mínimo 6 caracteres.', 'error');
                return;
            }
            admin.senha = senha;
        }

        const ok = await saveData();
        if (ok) {
            currentAdmin = admin;
            adminNameDisplay.textContent = admin.nome;
            adminAvatarDisplay.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nome)}&background=2563eb&color=fff&size=32`;
            welcomeAdmin.textContent = admin.nome;
            renderAll();
            showToast('Configurações salvas.', 'success');
            configPassword.value = '';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('user_logged');
        window.location.href = 'index.html';
    });

    // Navegação entre abas
    tabItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            tabItems.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            Object.keys(tabPanes).forEach(key => {
                tabPanes[key].classList.toggle('active', key === tab);
            });
            const titles = {
                dashboard: '📊 Dashboard',
                usuarios: '👥 Usuários',
                config: '⚙️ Configurações'
            };
            pageTitle.textContent = titles[tab] || 'Dashboard';
        });
    });

    // ===== INICIALIZAÇÃO =====
    async function init() {
        const logged = localStorage.getItem('user_logged');
        if (!logged) {
            window.location.href = 'index.html';
            return;
        }
        try {
            const userData = JSON.parse(logged);
            const ok = await loadData();
            if (!ok) {
                showToast('Erro ao carregar dados.', 'error');
                return;
            }
            const admin = usuarios.find(u => u.id === userData.id && u.is_admin === true);
            if (!admin) {
                localStorage.removeItem('user_logged');
                window.location.href = 'index.html';
                return;
            }
            currentAdmin = admin;
            adminNameDisplay.textContent = admin.nome;
            adminAvatarDisplay.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nome)}&background=2563eb&color=fff&size=32`;
            welcomeAdmin.textContent = admin.nome;
            configName.value = admin.nome || '';
            configEmail.value = admin.email || '';
            renderAll();
            showToast(`Bem-vindo, ${admin.nome}!`, 'success');
        } catch (e) {
            console.error(e);
            localStorage.removeItem('user_logged');
            window.location.href = 'index.html';
        }
    }

    init();
    console.log('📊 Painel Admin (planilha) carregado.');
})();
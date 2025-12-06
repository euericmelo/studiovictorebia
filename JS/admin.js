// Importa os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js";
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updatePassword, updateEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth-compat.js";
import { getFirestore, collection, getDocs, query, orderBy, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore-compat.js";

// ====================================
// CONFIGURAÇÃO DO FIREBASE (SUBSTITUA PELAS SUAS CHAVES REAIS)
// ====================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3WyAbgjZeEYcA9P-Tzzy6LOWLH28L0TM",
  authDomain: "studioveb.firebaseapp.com",
  projectId: "studioveb",
  storageBucket: "studioveb.firebasestorage.app",
  messagingSenderId: "218564543902",
  appId: "1:218564543902:web:96b2b767cbcfea734ec28f"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referências DOM
const loginContainer = document.getElementById('login-container');
const adminPanel = document.getElementById('admin-panel');
const listaAgendamentos = document.getElementById('lista');
const loginErro = document.getElementById('login-erro');


// ====================================
// FUNCIONALIDADE DE TEMA ESCURO (CORRIGIDO)
// ====================================

const themeToggleBtn = document.getElementById('btn-theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const localStorageThemeKey = 'studio-admin-theme';

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode'); // CORREÇÃO: Usando 'dark-mode'
        themeIcon.textContent = '☀️'; // Mudar ícone para Sol
    } else {
        document.body.classList.remove('dark-mode'); // CORREÇÃO: Usando 'dark-mode'
        themeIcon.textContent = '🌙'; // Mudar ícone para Lua
    }
}

// 1. Carregar tema salvo ao iniciar
const savedTheme = localStorage.getItem(localStorageThemeKey);
applyTheme(savedTheme || 'light');

// 2. Evento para alternar tema
themeToggleBtn.addEventListener('click', () => {
    // Verifica se a classe 'dark-mode' está no body
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem(localStorageThemeKey, newTheme); // Salvar a preferência
});

// ====================================
// 2. AUTENTICAÇÃO E MUDANÇA DE ESTADO
// ====================================

// Função para mostrar ou esconder o painel/login
function toggleView(isLoggedIn) {
    loginContainer.style.display = isLoggedIn ? 'none' : 'flex';
    adminPanel.style.display = isLoggedIn ? 'block' : 'none';

    if (isLoggedIn) {
        loadAgendamentos(); // Carrega os dados quando o admin loga
    } else {
        listaAgendamentos.innerHTML = '';
        // Limpa os campos de login após o logout
        document.getElementById('admin-user').value = '';
        document.getElementById('admin-pass').value = '';
    }
}

// Observa o estado de autenticação (mantém logado se o token for válido)
onAuthStateChanged(auth, (user) => {
    if (user) {
        toggleView(true);
    } else {
        toggleView(false);
    }
});

// Evento de Login
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('admin-user').value;
    const password = document.getElementById('admin-pass').value;
    loginErro.hidden = true;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Erro de Login:", error);
        loginErro.hidden = false;
    }
});

// Evento de Logout
document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert("Deslogado com sucesso!");
    } catch (error) {
        console.error("Erro ao fazer Logout:", error);
    }
});

// Implementação de Recuperação de Senha
document.getElementById('btn-esqueci').addEventListener('click', () => {
    document.getElementById('recover-box').hidden = false;
    document.getElementById('recover-msg').hidden = true; // Limpa mensagem anterior
    document.getElementById('recover-email').value = ''; // Limpa campo
});

document.getElementById('btn-close-recover').addEventListener('click', () => {
    document.getElementById('recover-box').hidden = true;
});

document.getElementById('btn-send-recover').addEventListener('click', async () => {
    const email = document.getElementById('recover-email').value;
    const recoverMsg = document.getElementById('recover-msg');
    recoverMsg.hidden = true;

    if (!email) {
        recoverMsg.textContent = "Digite um e-mail válido.";
        recoverMsg.style.color = 'red'; // Garante que o erro seja vermelho
        recoverMsg.hidden = false;
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        recoverMsg.textContent = "Link de recuperação enviado para seu e-mail!";
        recoverMsg.style.color = 'green'; // Mensagem de sucesso verde
        recoverMsg.hidden = false;
    } catch (error) {
        recoverMsg.textContent = "Erro ao enviar link. Verifique o e-mail digitado.";
        recoverMsg.style.color = 'red'; // Mensagem de erro vermelho
        recoverMsg.hidden = false;
        console.error("Erro de Recuperação:", error);
    }
});


// ====================================
// 3. LEITURA E EXIBIÇÃO DOS AGENDAMENTOS
// ====================================

function renderAgendamento(data, id) {
    // Correção: Garante que 'data' é uma string no formato 'YYYY-MM-DD' antes de fazer split
    const dataString = data.data || '';
    const p = dataString.split("-");
    const dataFormatada = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataString;

    const item = document.createElement('div');
    item.className = 'agendamento-item';
    item.dataset.id = id;

    item.innerHTML = `
        <div class="info">
            <p><strong>Nome:</strong> ${data.nome || 'N/A'}</p>
            <p><strong>Serviço:</strong> ${data.servico || 'N/A'}</p>
        </div>
        <div class="detalhes">
            <p>📅 ${dataFormatada} às ⏰ ${data.hora || 'N/A'}</p>
            <p>📞 ${data.telefone || 'N/A'}</p>
        </div>
        <button class="btn-delete btn danger" data-id="${id}">🗑️ Excluir</button>
    `;
    
    // Adiciona evento de exclusão ao botão
    item.querySelector('.btn-delete').addEventListener('click', async (e) => {
        const agendamentoId = e.target.dataset.id;
        if (confirm("Tem certeza que deseja excluir este agendamento?")) {
            await deleteAgendamento(agendamentoId);
            loadAgendamentos(); // Recarrega a lista
        }
    });

    return item;
}

async function loadAgendamentos() {
    listaAgendamentos.innerHTML = '<div>Carregando agendamentos...</div>';
    
    let q = query(collection(db, "agendamentos"), orderBy("data", "asc"), orderBy("hora", "asc"));

    // FILTRO POR DATA
    const dataFiltro = document.getElementById('filtro-data').value;
    if (dataFiltro) {
        q = query(q, where("data", "==", dataFiltro));
    }
    
    // FILTRO POR TEXTO (Busca simples por Nome)
    const termoBusca = document.getElementById('buscar').value.toLowerCase().trim();
    
    try {
        const querySnapshot = await getDocs(q);
        listaAgendamentos.innerHTML = '';
        const resultadosFiltrados = [];
        
        querySnapshot.forEach((doc) => {
            const agendamento = doc.data();
            // Implementação do filtro de texto por Nome/Serviço (filtragem local)
            if (!termoBusca || 
                agendamento.nome.toLowerCase().includes(termoBusca) || 
                agendamento.servico.toLowerCase().includes(termoBusca)) {
                resultadosFiltrados.push({ data: agendamento, id: doc.id });
            }
        });

        if (resultadosFiltrados.length === 0) {
            document.getElementById('not-found').hidden = false;
            return;
        }

        document.getElementById('not-found').hidden = true;
        
        resultadosFiltrados.forEach((item) => {
            listaAgendamentos.appendChild(renderAgendamento(item.data, item.id));
        });

    } catch (e) {
        console.error("Erro ao carregar agendamentos:", e);
        listaAgendamentos.innerHTML = '<div>Erro ao carregar os dados. Verifique a conexão com o Firebase e as regras de segurança.</div>';
    }
}

// Eventos de Filtro/Busca
document.getElementById('filtro-data').addEventListener('change', loadAgendamentos);
// Adiciona evento de busca (debounce seria ideal, mas usaremos 'keyup' simples por enquanto)
document.getElementById('buscar').addEventListener('keyup', loadAgendamentos);


// ====================================
// 4. GERENCIAMENTO E CONFIGURAÇÕES
// ====================================

// Função para Excluir
async function deleteAgendamento(id) {
    try {
        await deleteDoc(doc(db, "agendamentos", id));
        console.log("Agendamento excluído com sucesso:", id);
    } catch (e) {
        console.error("Erro ao excluir agendamento:", e);
        alert("Erro ao excluir agendamento. Tente novamente. Pode ser necessário re-autenticar se o Firebase exigir.");
    }
}

// Evento de Limpar Tudo (ALERTA: Isso apaga toda a coleção!)
document.getElementById('btn-clear').addEventListener('click', async () => {
    if (confirm("AVISO: Esta ação irá APAGAR TODOS os agendamentos salvos no Firebase. Tem certeza?")) {
        // Para coleções grandes, é melhor usar uma Cloud Function. Para coleções pequenas, a iteração abaixo funciona.
        try {
            const agendamentosRef = collection(db, "agendamentos");
            const snapshot = await getDocs(agendamentosRef);
            
            // Usamos Promise.all para executar todas as exclusões em paralelo
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            alert("Todos os agendamentos foram excluídos.");
            loadAgendamentos();
        } catch (e) {
            console.error("Erro ao limpar tudo:", e);
            alert("Erro ao limpar todos os agendamentos. Verifique as regras de segurança do Firebase e se você está logado.");
        }
    }
});

// Evento de Salvar Novas Credenciais (Altera o usuário logado)
document.getElementById('save-access').addEventListener('click', async () => {
    const user = auth.currentUser;
    const newEmail = document.getElementById('new-user').value;
    const newPassword = document.getElementById('new-pass').value;
    
    if (!user) {
        alert("Você precisa estar logado para alterar as credenciais.");
        return;
    }

    // Validação mínima para evitar chamadas desnecessárias ao Firebase
    if (!newEmail && !newPassword) {
        alert("Digite um novo usuário ou nova senha.");
        return;
    }

    try {
        let successMessage = "";
        
        if (newEmail && newEmail !== user.email) {
            await updateEmail(user, newEmail);
            successMessage += "Usuário (e-mail) alterado com sucesso! ";
        }
        if (newPassword) {
            await updatePassword(user, newPassword);
            successMessage += "Senha alterada com sucesso!";
        }
        
        if (successMessage) {
             // Limpa os campos após o sucesso
            document.getElementById('new-user').value = '';
            document.getElementById('new-pass').value = '';
            alert(successMessage + " Você pode precisar fazer login novamente se o token expirar.");
        } else {
             alert("Nenhuma alteração foi feita.");
        }

    } catch (error) {
        console.error("Erro ao salvar acesso:", error);
        // Erro 401: auth/requires-recent-login
        alert("ERRO: O Firebase exige que você faça **login novamente** antes de alterar credenciais de segurança. Faça logout, login e tente a alteração novamente.");
    }
});

// Evento de Exportar CSV
document.getElementById('btn-export').addEventListener('click', async () => {
    const q = query(collection(db, "agendamentos"), orderBy("data", "asc"), orderBy("hora", "asc"));
    const querySnapshot = await getDocs(q);
    
    let csvContent = "Nome,Telefone,Serviço,Data,Hora\n";
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Garantindo que todos os campos sejam string e escapando vírgulas com aspas
        const values = [
            `"${(data.nome || '').replace(/"/g, '""')}"`,
            `"${(data.telefone || '').replace(/"/g, '""')}"`,
            `"${(data.servico || '').replace(/"/g, '""')}"`,
            `"${(data.data || '').replace(/"/g, '""')}"`,
            `"${(data.hora || '').replace(/"/g, '""')}"`
        ];
        csvContent += values.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    // Formata o nome do arquivo com a data e hora atual
    const now = new Date();
    const fileName = `agendamentos_studio_${now.toISOString().slice(0, 10)}.csv`;
    link.download = fileName;
    
    // Simula o clique
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Exportação de agendamentos concluída.");
});
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3WyAbgjZeEYcA9P-Tzzy6LOWLH28L0TM",
  authDomain: "studioveb.firebaseapp.com",
  projectId: "studioveb",
  storageBucket: "studioveb.firebasestorage.app",
  messagingSenderId: "218564543902",
  appId: "1:218564543902:web:96b2b767cbcfea734ec28f"
};

// Inicializa o Firebase e o Firestore
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ====================================
// INICIALIZAÇÃO
// ====================================

const form = document.getElementById("form-agenda");
const listaHorarios = document.getElementById("lista-horarios");
const KEY = "agendamentos";

// ====================================
// LOCAL STORAGE
// ====================================

function getStore() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveStore(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}

// ====================================
// FIREBASE DATABASE
// ====================================

async function saveToDatabase(dados) {
    try {
        // Salva na coleção "agendamentos" e adiciona o timestamp do servidor
        await db.collection("agendamentos").add(dados);
        console.log("Agendamento salvo no Firebase.");
    } catch (e) {
        console.error("Erro ao adicionar documento ao Firebase: ", e);
        // O cliente deve ser notificado que o agendamento foi salvo localmente/WhatsApp, 
        // mas que houve um erro no salvamento remoto.
    }
}

// ====================================
// GERA HORÁRIOS (09:30 → 18:00 de 30 em 30min)
// ====================================

const horariosPadrao = [];
let start = 9 * 60 + 30; 
const end = 18 * 60;

while (start <= end) {
  const h = String(Math.floor(start / 60)).padStart(2, '0');
  const m = String(start % 60).padStart(2, '0');
  horariosPadrao.push(`${h}:${m}`);
  start += 30;
}

// ====================================
// CARREGAR HORÁRIOS DA DATA ESCOLHIDA
// ====================================

document.getElementById("data").addEventListener("change", (e) => {
  carregarHorarios(e.target.value);
});

function carregarHorarios(dataEscolhida) {
  listaHorarios.innerHTML = "";

  if (!dataEscolhida) return;

  const parts = dataEscolhida.split("-");
  const dataLocal = new Date(parts[0], parts[1] - 1, parts[2]);
  const diaSemana = dataLocal.getDay(); // 0 domingo, 1 segunda

  const store = getStore();
  const ocupados = store[dataEscolhida]?.map(a => a.hora) || [];

  horariosPadrao.forEach(hora => {
    const div = document.createElement("div");
    div.className = "horario";
    div.textContent = hora;

    if (ocupados.includes(hora)) div.classList.add("ocupado");
    if (diaSemana === 0 || diaSemana === 1) div.classList.add("desabilitado");

    if (!div.classList.contains("ocupado") && !div.classList.contains("desabilitado")) {
      div.addEventListener("click", () => {
        document.querySelectorAll(".horario").forEach(x => x.classList.remove("selecionado"));
        div.classList.add("selecionado");
      });
    }

    listaHorarios.appendChild(div);
  });
}

// ====================================
// ENVIO PARA WHATSAPP
// ====================================

function enviarWhatsApp(nome, telefone, servico, data, hora) {

  const numero = "5511972776263"; // Altere seu número aqui se necessário

  const p = data.split("-");
  const dataFormatada = `${p[2]}/${p[1]}/${p[0]}`;

  const msg =
    "🔔 *NOVO AGENDAMENTO*\n\n" +
    `👤 *Nome:* ${nome}\n` +
    `📞 *Telefone:* ${telefone}\n` +
    `💇‍♀️ *Serviço:* ${servico}\n` +
    `📅 *Data:* ${dataFormatada}\n` +
    `⏰ *Hora:* ${hora}`;

  const link = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

  window.open(link, "_blank");
}

// ====================================
// SUBMIT DO FORMULÁRIO (ATUALIZADO)
// ====================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const servico = document.getElementById("servico").value.trim();
  const data = document.getElementById("data").value;

  const servicosValidos = ["masculino", "feminino", "manicure", "pedicure"];

  if (!servicosValidos.includes(servico.toLowerCase())) {
    alert("Escolha um serviço válido!");
    return;
  }

  const horarioSelecionado = document.querySelector(".horario.selecionado");

  if (!horarioSelecionado) {
    alert("Selecione um horário!");
    return;
  }

  const hora = horarioSelecionado.textContent;

  // Objeto de agendamento a ser salvo
  const novoAgendamento = {
    nome,
    telefone,
    servico,
    data,
    hora,
    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Para melhor ordenação no DB
  };

  try {
    // 1. Salvar no LocalStorage (Mantém a lógica de ocupação de horário local)
    const store = getStore();
    if (!store[data]) store[data] = [];
    store[data].push(novoAgendamento);
    saveStore(store);

    // 2. Salvar no Database (Firebase)
    await saveToDatabase(novoAgendamento); 

    // 3. Enviar para WhatsApp (Geralmente abre a janela e não espera a conclusão)
    enviarWhatsApp(nome, telefone, servico, data, hora);

    alert("Agendamento realizado com sucesso!");
    
    // Limpar formulário e horários
    form.reset();
    listaHorarios.innerHTML = "";
    
    // Recarrega os horários para desabilitar o horário selecionado
    carregarHorarios(data); 

  } catch (error) {
    console.error("Falha geral no agendamento:", error);
    alert("Ocorreu um erro ao finalizar o agendamento. Verifique sua conexão.");
  }
});

// ====================================
// LOGO → CLIQUE SEGURO PARA PAINEL ADMIN
// ====================================

let clicks = 0;
const logo = document.querySelector(".logo");

if (logo) {
  logo.addEventListener("click", () => {
    clicks++;
    if (clicks >= 3) {
      const adminPath = "./admin.html";
      fetch(adminPath, { method: "HEAD" })
        .then(resp => {
          if (resp.ok) window.location.href = adminPath;
          else alert("Painel administrativo não encontrado!");
        })
        .catch(() => alert("Erro ao tentar abrir o painel administrativo!"));
      clicks = 0;
    }
    setTimeout(() => clicks = 0, 800);
  });
}

// ====================================
// MENU HAMBÚRGUER + OVERLAY
// ====================================

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");
const overlay = document.getElementById("overlay");

if (menuBtn && navbar && overlay) {

  function abrirMenu() {
    menuBtn.classList.add("active");
    navbar.classList.add("mobile-show");
    navbar.classList.remove("mobile-hidden");
    overlay.classList.add("show");
  }

  function fecharMenu() {
    menuBtn.classList.remove("active");
    navbar.classList.remove("mobile-show");
    navbar.classList.add("mobile-hidden");
    overlay.classList.remove("show");
  }

  menuBtn.addEventListener("click", () => {
    if (navbar.classList.contains("mobile-show")) fecharMenu();
    else abrirMenu();
  });

  overlay.addEventListener("click", () => fecharMenu());
}
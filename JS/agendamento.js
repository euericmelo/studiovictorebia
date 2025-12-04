document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("form-agenda");
  const listaHorarios = document.getElementById("lista-horarios");
  const KEY = "agendamentos";

  function getStore() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  }

  function saveStore(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj));
  }

  // ===============================
  // GERA HORÁRIOS
  // ===============================
  const horariosPadrao = [];
  let start = 9 * 60 + 30;
  const end = 18 * 60;
  while (start <= end) {
    const h = String(Math.floor(start / 60)).padStart(2, '0');
    const m = String(start % 60).padStart(2, '0');
    horariosPadrao.push(`${h}:${m}`);
    start += 30;
  }

  document.getElementById("data").addEventListener("change", (e) => carregarHorarios(e.target.value));

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

  // ===============================
  // ENVIO PARA WHATSAPP – CORRIGIDO
  // ===============================
  function enviarWhatsApp(nome, telefone, servico, data, hora) {
    const numero = "5511972776263"; // Seu número com DDI

    // Formatar data para DD/MM/YYYY
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
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    window.open(link, "_blank");
  }

  // ===============================
  // ENVIO DO FORMULÁRIO – CORRIGIDO
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const servico = document.getElementById("servico").value.trim();
    const data = document.getElementById("data").value;

    const servicosValidos = ["masculino", "feminino", "manicure", "pedicure"];

    // Corrige problema de capitalização
    if (!servicosValidos.includes(servico.toLowerCase())) {
      alert("Escolha um serviço válido!");
      return;
    }

    const horarioSelecionado = document.querySelector(".horario.selecionado");
    if (!horarioSelecionado) { alert("Selecione um horário!"); return; }

    const hora = horarioSelecionado.textContent;

    // SALVAMENTO NO LOCALSTORAGE — CORRIGIDO
    const store = getStore();
    if (!store[data]) store[data] = [];

    store[data].push({ hora, nome, telefone, servico });
    saveStore(store);

    // tempo para garantir gravação no localStorage
    await Promise.resolve();

    enviarWhatsApp(nome, telefone, servico, data, hora);

    alert("Agendamento realizado com sucesso!");
    form.reset();
    listaHorarios.innerHTML = "";
  });

  // ===============================
  // CLIQUE SEGURO NA LOGO
  // ===============================
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

});

// ===============================
// MENU HAMBÚRGUER + OVERLAY
// ===============================

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

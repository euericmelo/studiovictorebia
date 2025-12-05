// =========================
//  IMPORTS DO FIREBASE
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBgswcxd4RxFqz1j0ZQTv43Aj1Xy95Z8Bo",
  authDomain: "studio-victor-e-bia-d6201.firebaseapp.com",
  projectId: "studio-victor-e-bia-d6201",
  storageBucket: "studio-victor-e-bia-d6201.firebasestorage.app",
  messagingSenderId: "893601916740",
  appId: "1:893601916740:web:8d9cf3c0b581791575d911"
};

// INICIALIZAR FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================
//  ELEMENTOS DO FORMULÁRIO
// =========================
const form = document.getElementById("form-agendamento");
const servicoSelect = document.getElementById("servico");
const calendario = document.getElementById("calendario");
const horarioSelect = document.getElementById("horario");

// =========================
//  HORÁRIOS DISPONÍVEIS
// =========================
const horariosPadrao = [
  "09:00","09:30","10:00","10:30",
  "11:00","11:30","13:00","13:30",
  "14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00"
];

// =========================
//  LOCALSTORAGE (opcional)
// =========================
function getStore() {
  return JSON.parse(localStorage.getItem("agenda")) || {};
}

function saveStore(store) {
  localStorage.setItem("agenda", JSON.stringify(store));
}

// =========================
//  GERAR HORÁRIOS  DISPONÍVEIS
// =========================
function gerarHorarios() {
  horarioSelect.innerHTML = "<option value=''>Selecione um horário</option>";

  const data = calendario.value;
  const servico = servicoSelect.value;

  if (!data || !servico) return;

  const store = getStore();
  const agendados = store[data] ? store[data].map(a => a.hora) : [];

  horariosPadrao.forEach(h => {
    if (!agendados.includes(h)) {
      const option = document.createElement("option");
      option.value = h;
      option.textContent = h;
      horarioSelect.appendChild(option);
    }
  });
}

// Atualiza horários quando muda serviço ou data
servicoSelect.addEventListener("change", gerarHorarios);
calendario.addEventListener("change", gerarHorarios);

// =========================
//  SALVAR NO FIRESTORE
// =========================
async function salvarNoFirestore(agendamento) {
  try {
    await addDoc(collection(db, "agendamentos"), agendamento);
  } catch (erro) {
    console.error("Erro ao salvar no Firestore:", erro);
  }
}

// =========================
//  SUBMIT DO FORMULÁRIO
// =========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = calendario.value;
  const hora = horarioSelect.value;
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const servico = servicoSelect.value;

  const agendamento = { data, hora, nome, telefone, servico };

  // ✔️ SALVAR NO FIRESTORE
  await salvarNoFirestore(agendamento);

  // ✔️ SALVAR NO LOCALSTORAGE (opcional, usado pelo admin)
  const store = getStore();
  if (!store[data]) store[data] = [];
  store[data].push({ hora, nome, telefone, servico });
  saveStore(store);

  alert("Agendamento realizado com sucesso!");
  form.reset();
  horarioSelect.innerHTML = "<option value=''>Selecione uma data</option>";
});
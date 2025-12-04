// ===============================
//  FIREBASE CONFIG
// ===============================
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { 
  getAuth, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9kYlC5ftPlfk9mUfu6e3hnk6JuGq_i4o",
  authDomain: "studio-victor-e-bia-d6201.firebaseapp.com",
  projectId: "studio-victor-e-bia-d6201",
  storageBucket: "studio-victor-e-bia-d6201.firebasestorage.app",
  messagingSenderId: "893601916740",
  appId: "1:893601916740:web:8d9cf3c0b581791575d911"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();


// ===============================
//  ELEMENTOS DO HTML
// ===============================
const loginContainer = document.getElementById("login-container");
const adminPanel = document.getElementById("admin-panel");

// Campos login
const userInput = document.getElementById("admin-user");
const passInput = document.getElementById("admin-pass");
const btnLogin = document.getElementById("btn-login");
const loginErro = document.getElementById("login-erro");

// Recuperação
const btnEsqueci = document.getElementById("btn-esqueci");
const recoverBox = document.getElementById("recover-box");
const recoverEmail = document.getElementById("recover-email");
const btnSendRecover = document.getElementById("btn-send-recover");
const btnCloseRecover = document.getElementById("btn-close-recover");
const recoverMsg = document.getElementById("recover-msg");

// Logout
const btnLogout = document.getElementById("btn-logout");


// ===============================
//  FUNÇÕES DE TELA
// ===============================
function showLogin() {
  loginContainer.style.display = "flex";
  adminPanel.style.display = "none";
}

function showAdmin() {
  loginContainer.style.display = "none";
  adminPanel.style.display = "block";
  loadAgendamentos(); // carregará os agendamentos assim que o admin entrar
}

function openRecover() {
  recoverBox.hidden = false;
}

function closeRecover() {
  recoverBox.hidden = true;
  recoverMsg.hidden = true;
  recoverMsg.innerText = "";
}


// ===============================
//  LOGIN
// ===============================
btnLogin.addEventListener("click", () => {
  const email = userInput.value.trim();
  const senha = passInput.value.trim();

  if (!email || !senha) {
    loginErro.hidden = false;
    loginErro.innerText = "Preencha usuário e senha";
    return;
  }

  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      loginErro.hidden = true;
      showAdmin();
    })
    .catch(() => {
      loginErro.hidden = false;
      loginErro.innerText = "Usuário ou senha incorretos";
    });
});


// ===============================
//  RECUPERAR SENHA
// ===============================
btnEsqueci.addEventListener("click", openRecover);
btnCloseRecover.addEventListener("click", closeRecover);

btnSendRecover.addEventListener("click", () => {
  const email = recoverEmail.value.trim();

  if (!email) {
    recoverMsg.hidden = false;
    recoverMsg.innerText = "Digite o e-mail!";
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      recoverMsg.hidden = false;
      recoverMsg.innerText = "E-mail enviado!";
    })
    .catch(() => {
      recoverMsg.hidden = false;
      recoverMsg.innerText = "Erro ao enviar";
    });
});


// ===============================
//  AUTO LOGIN
// ===============================
onAuthStateChanged(auth, (user) => {
  if (user) showAdmin();
  else showLogin();
});


// ===============================
//  LOGOUT
// ===============================
btnLogout.addEventListener("click", () => {
  signOut(auth);
});


// ===============================
//  SALVAR NOVO USUÁRIO E SENHA
// ===============================
document.getElementById("save-access").addEventListener("click", async () => {
  const newUser = document.getElementById("new-user").value.trim();
  const newPass = document.getElementById("new-pass").value.trim();

  if (!newUser || !newPass) {
    alert("Preencha usuário e senha");
    return;
  }

  await setDoc(doc(db, "barbearia", "config"), {
    painelUser: newUser,
    painelPass: newPass
  });

  alert("Acesso salvo!");
});


// ===============================
//  SALVAR AGENDAMENTO NO FIRESTORE
// ===============================
export async function salvarAgendamento(data) {
  await addDoc(collection(db, "agendamentos"), data);
}


// ===============================
//  CARREGAR AGENDAMENTOS NO PAINEL
// ===============================
async function loadAgendamentos() {
  const lista = document.getElementById("lista-agendamentos");
  lista.innerHTML = "<p>Carregando...</p>";

  const snap = await getDocs(collection(db, "agendamentos"));

  lista.innerHTML = "";

  snap.forEach(doc => {
    const a = doc.data();
    lista.innerHTML += `
      <div class="agendamento-item">
        <strong>${a.nome}</strong><br>
        Data: ${a.data}<br>
        Hora: ${a.hora}<br>
        Serviço: ${a.servico}
      </div>
    `;
  });

  if (lista.innerHTML === "") {
    lista.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
  }
}
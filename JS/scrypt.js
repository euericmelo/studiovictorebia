document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // MENU HAMBÚRGUER + OVERLAY
    // ===============================

    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");
    const overlay = document.getElementById("overlay");

    if (menuBtn && navbar && overlay) {

        // Função abrir menu
        function abrirMenu() {
            menuBtn.classList.add("active");
            navbar.classList.add("mobile-show");
            navbar.classList.remove("mobile-hidden");
            overlay.classList.add("show");
        }

        // Função fechar menu
        function fecharMenu() {
            menuBtn.classList.remove("active");
            navbar.classList.remove("mobile-show");
            navbar.classList.add("mobile-hidden");
            overlay.classList.remove("show");
        }

        // Toggle do botão
        menuBtn.addEventListener("click", () => {
            if (navbar.classList.contains("mobile-show")) {
                fecharMenu();
            } else {
                abrirMenu();
            }
        });

        // Fechar menu ao clicar no overlay
        overlay.addEventListener("click", () => {
            fecharMenu();
        });
    }


    // ===============================
    // BOTÕES WHATSAPP POR ID
    // ===============================

    const numeroWhatsApp = "5511972776263";

    const mensagem = "Olá! Gostaria de agendar um horário no Studio Victor e Bia.";
    
    const linkWhats = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    const botoesIds = ["btn-reserva", "btn-reserva-2", "btn-reserva-3"];
    botoesIds.forEach(id => {
        const botao = document.getElementById(id);
        if (botao) {
            botao.addEventListener("click", (e) => {
                e.preventDefault();
                window.open(linkWhats, "_blank");
            });
        }
    });


});

// Botão Flutuante WhatsApp
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("wa-float");

  if (!btn) return;

  const phone = btn.getAttribute("data-phone");
  const message = btn.getAttribute("data-msg") || "";
  const encodedMessage = encodeURIComponent(message);

  btn.href = `https://wa.me/${phone}?text=${encodedMessage}`;

  btn.setAttribute("target", "_blank");
  btn.setAttribute("rel", "noopener noreferrer");
});

// depoimentos
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
let currentIndex = 0;

function showSlide(index) {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    slides[index].classList.add("active");
    dots[index].classList.add("active");
}

dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        currentIndex = index;
        showSlide(index);
    });
});

// AUTO CARROSSEL (a cada 3 segundos)
setInterval(() => {
    currentIndex++;
    if (currentIndex >= slides.length) currentIndex = 0;
    showSlide(currentIndex);
}, 3000);


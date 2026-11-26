gsap.registerPlugin(ScrollTrigger);

// =================================
// ПЕРСОНАЛЬНЫЕ ПРИГЛАШЕНИЯ
// =================================

document.body.classList.add("locked");

const entryScreen = document.querySelector("#entryScreen");
const codeForm = document.querySelector("#codeForm");
const codeInput = document.querySelector("#inviteCode");
const entryError = document.querySelector("#entryError");

let sceneStarted = false;

// Подстановка персонального изображения письма.
function setPersonalLetter(invitation) {
    const letterImage = document.querySelector("#personalLetter");

    if (!invitation || !letterImage) return;

    letterImage.src = invitation.image;
    letterImage.alt = "Приглашение для " + invitation.names;
}

// =================================
// ПРОВЕРКА КОДА
// =================================

function unlockInvitation(code) {
    const invitation = window.INVITATIONS[code];

    if (!invitation) {
        entryError.textContent = "Такого кода не существует. Проверьте ввод.";
        codeInput.value = "";
        codeInput.focus();
        return;
    }

    entryError.textContent = "";

    // Сохраняем выбранное приглашение.
    window.currentInvitation = invitation;

    // Запоминаем код в текущей сессии.
    sessionStorage.setItem("invitationCode", code);

    // Загружаем персональное письмо.
    setPersonalLetter(invitation);

    // Плавно убираем экран входа.
    gsap.to(entryScreen, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
            entryScreen.classList.add("hidden");
            document.body.classList.remove("locked");

            startInvitationScene();
        }
    });
}

// Обработка формы.
codeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const code = codeInput.value
        .trim()
        .toUpperCase()
        .replace(/\s/g, "");

    unlockInvitation(code);
});

// =================================
// ЗАПУСК СЦЕНЫ С КОНВЕРТОМ
// =================================

function startInvitationScene() {
    if (sceneStarted) return;

    sceneStarted = true;

    window.scrollTo(0, 0);

    // Начальное положение конверта.
    gsap.set(".envelope", {
        y: "120vh",
        opacity: 0,
        scale: 0.95
    });

    // Конверт выезжает снизу.
    gsap.to(".envelope", {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 2,
        ease: "power3.out",
        delay: 0.2
    });

    // =================================
    // ОСНОВНАЯ АНИМАЦИЯ ПРИ ПРОКРУТКЕ
    // =================================

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".intro",
            start: "top top",
            end: "+=1600",
            scrub: 1,
            pin: true,
            anticipatePin: 1
        }
    });

    // 1. Открываем крышку.
    timeline.to(".envelope-flap", {
        rotationX: 180,
        duration: 2,
        ease: "power2.inOut"
    });

    // 2. Крышка уходит за письмо.
    timeline.set(".envelope-flap", {
        zIndex: 1
    });

    // 3. Письмо выезжает из конверта.
    timeline.to(".letter", {
        yPercent: -115,
        duration: 2.5,
        ease: "none"
    });

    // 4. Перемещаем письмо на передний план.
    timeline.set(".letter-layer", {
        zIndex: 6
    });

    // 5. Возвращаем письмо в центральную позицию.
    timeline.to(".letter", {
        yPercent: 0,
        duration: 1.5,
        ease: "power2.inOut"
    });

    // 6. Увеличиваем письмо.
    timeline.to(".letter", {
        width: () => Math.min(window.innerWidth * 0.92, 850),
        height: () => Math.min(window.innerHeight * 0.82, 1100),
        left: "50%",
        top: "50%",
        bottom: "auto",
        xPercent: -50,
        yPercent: -50,
        duration: 2,
        ease: "power2.inOut"
    });

    // 7. Убираем подсказку.
    timeline.to(".hint", {
        opacity: 0,
        duration: 0.5
    }, 0);

    ScrollTrigger.refresh();
}

// =================================
// ВОССТАНОВЛЕНИЕ СЕССИИ
// =================================

// Если посетитель уже вводил код в этой вкладке,
// повторно спрашивать его не нужно.

const savedCode = sessionStorage.getItem("invitationCode");

if (savedCode && window.INVITATIONS[savedCode]) {
    window.currentInvitation = window.INVITATIONS[savedCode];

    setPersonalLetter(window.currentInvitation);

    entryScreen.classList.add("hidden");
    document.body.classList.remove("locked");

    startInvitationScene();
}
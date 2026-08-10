/* =========================================
   LOADER
========================================= */

window.addEventListener("load", () => {

    setTimeout(() => {

        document.getElementById("loader").style.display = "none";

    }, 1500);

});


/* =========================================
   OPEN INVITATION
========================================= */

const openBtn = document.getElementById("openInvitation");
const opening = document.getElementById("opening");
const music = document.getElementById("music");

openBtn.addEventListener("click", () => {

    opening.style.display = "none";

    music.play().catch(() => {});

});


/* =========================================
   MUSIC BUTTON
========================================= */

const musicBtn = document.getElementById("musicBtn");

musicBtn.addEventListener("click", () => {

    if (music.paused) {

        music.play();
        musicBtn.innerHTML = "♫";

    } else {

        music.pause();
        musicBtn.innerHTML = "▶";

    }

});


/* =========================================
   COUNTDOWN
========================================= */

const weddingDate = new Date("December 19, 2026 08:00:00").getTime();

function countdown() {

    const now = new Date().getTime();

    const gap = weddingDate - now;

    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    document.getElementById("days").innerHTML =
        Math.floor(gap / day);

    document.getElementById("hours").innerHTML =
        Math.floor((gap % day) / hour);

    document.getElementById("minutes").innerHTML =
        Math.floor((gap % hour) / minute);

    document.getElementById("seconds").innerHTML =
        Math.floor((gap % minute) / 1000);

}

setInterval(countdown, 1000);

countdown();


/* =========================================
   FALLING PETALS
========================================= */

const canvas = document.getElementById("petals");
const ctx = canvas.getContext("2d");

let petals = [];

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

for (let i = 0; i < 30; i++) {

    petals.push({

        x: Math.random() * canvas.width,

        y: Math.random() * canvas.height,

        r: Math.random() * 6 + 4,

        speed: Math.random() * 1.5 + 1,

        swing: Math.random() * 2

    });

}

function drawPetals() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach(p => {

        ctx.beginPath();

        ctx.fillStyle = "rgba(220,170,170,.8)";

        ctx.ellipse(
            p.x,
            p.y,
            p.r,
            p.r / 2,
            Math.PI / 4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        p.y += p.speed;

        p.x += Math.sin(p.y * 0.01) * p.swing;

        if (p.y > canvas.height) {

            p.y = -20;
            p.x = Math.random() * canvas.width;

        }

    });

    requestAnimationFrame(drawPetals);

}

drawPetals();


/* =========================================
   SCROLL FADE
========================================= */

const sections = document.querySelectorAll("section,header,footer");

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

}, {

    threshold: 0.2

});

sections.forEach(section => {

    section.style.opacity = "0";
    section.style.transform = "translateY(60px)";
    section.style.transition = "1s";

    observer.observe(section);

});
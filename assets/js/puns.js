const puns = [
    {
        setup: "O que o próton disse para o elétron?",
        punchline: "Hoje você está muito negativo! ⚛️"
    },
    {
        setup: "O que um vetor disse para o outro?",
        punchline: "Você tem um ótimo sentido! ➡️"
    },
    {
        setup: "O que a gravidade disse para a maçã?",
        punchline: "Você me atrai! 🍎"
    },
    {
        setup: "Por que o livro de física é triste?",
        punchline: "Porque ele tem muitos problemas. 📚"
    },
    {
        setup: "O que o físico disse quando viu o mar?",
        punchline: "Que onda! 🌊"
    },
    {
        setup: "O que o Newton disse para o Einstein?",
        punchline: "A sua teoria é relativa! 🧠"
    },
    {
        setup: "Por que o elétron nunca é convidado para festas?",
        punchline: "Porque ele é muito negativo. ⚡"
    },
    {
        setup: "O que a lâmpada disse para o interruptor?",
        punchline: "Você me liga! 💡"
    },
    {
        setup: "Qual é o cúmulo da força?",
        punchline: "Dobrar a esquina! 💪"
    },
    {
        setup: "O que um imã disse para o outro?",
        punchline: "Sinto uma forte atração por você! 🧲"
    },
    {
        setup: "Por que o átomo foi ao psicólogo?",
        punchline: "Porque ele perdeu um elétron e não sabia se era positivo! ➕"
    },
    {
        setup: "O que a física quântica disse para a física clássica?",
        punchline: "Você é muito previsível! 🎲"
    },
    {
        setup: "Qual é o barulho de um elétron caindo?",
        punchline: "Planck! 💥"
    },
    {
        setup: "O que o termômetro disse para o outro?",
        punchline: "Estou com febre de te ver! 🌡️"
    }
];

let currentPunIndex = -1;
const cardContainer = document.getElementById('pun-card-container');
const nextBtn = document.getElementById('next-pun-btn');

function getRandomPun() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * puns.length);
    } while (newIndex === currentPunIndex && puns.length > 1);
    
    currentPunIndex = newIndex;
    return puns[currentPunIndex];
}

function createCard(pun) {
    const card = document.createElement('div');
    card.className = 'pun-display-card';
    
    card.innerHTML = `
        <div class="pun-inner">
            <div class="pun-front">
                <div class="pun-icon">🤔</div>
                <p class="pun-text">${pun.setup}</p>
                <span class="tap-hint">Toque para ver a resposta</span>
            </div>
            <div class="pun-back">
                <div class="pun-icon">😂</div>
                <p class="pun-text">${pun.punchline}</p>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        if (card.classList.contains('flipped')) {
            triggerConfetti(card);
        }
    });

    return card;
}

function showNextPun() {
    // Disable button temporarily
    nextBtn.disabled = true;
    
    const oldCard = cardContainer.querySelector('.pun-display-card');
    const newPun = getRandomPun();
    const newCard = createCard(newPun);

    // Prepare new card (start off-screen right)
    newCard.classList.add('entering');
    cardContainer.appendChild(newCard);

    // Animate old card out (to left)
    if (oldCard) {
        oldCard.classList.add('exiting');
        setTimeout(() => {
            oldCard.remove();
        }, 500); // Match CSS transition
    }

    // Animate new card in
    requestAnimationFrame(() => {
        newCard.classList.remove('entering');
    });

    setTimeout(() => {
        nextBtn.disabled = false;
    }, 500);
}

function triggerConfetti(element) {
    // Simple emoji burst effect
    const rect = element.getBoundingClientRect();
    const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };

    for (let i = 0; i < 10; i++) {
        createEmojiParticle(center.x, center.y);
    }
}

function createEmojiParticle(x, y) {
    const emojis = ['😂', '🤣', '😹', '💀', '✨'];
    const particle = document.createElement('div');
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.className = 'emoji-particle';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 100;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showNextPun();
    nextBtn.addEventListener('click', showNextPun);
});

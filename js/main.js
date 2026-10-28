// --- SISTEMA DE CONTROLE DE TELAS ---
let currentScreen = 'menu';
let playerName = "";
let score = 0;
let lives = 3;

// --- TECLADO VIRTUAL ---
const keyboardLayout = [
    ['A','B','C','D','E','F','G'],
    ['H','I','J','K','L','M','N'],
    ['O','P','Q','R','S','T','U'],
    ['V','W','X','Y','Z','<','OK']
];
let kx = 0, ky = 0; // Posição do cursor no teclado

// --- LÓGICA DO JOGO ---
let playerLane = 1; // 0=Cima, 1=Meio, 2=Baixo
let gameLoop;
let entities = [];
let gameSpeed = 8;
let isPausedForQuestion = false;

// --- DADOS DAS PERGUNTAS ---
const questions = [
    { q: "Qual é a cor do céu?", options: ["AZUL", "VERDE"], ans: 0 },
    { q: "2 + 2 é igual a?", options: ["3", "4"], ans: 1 },
    { q: "Qual animal faz Miau?", options: ["GATO", "CACHORRO"], ans: 0 }
];
let qSelection = 0;
let currentQuestionObj = null;

// INICIALIZAÇÃO
window.onload = () => {
    buildKeyboard();
    document.addEventListener('keydown', handleInput);
};

function switchScreen(newScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${newScreen}`).classList.add('active');
    currentScreen = newScreen;
}

// --- GERENCIADOR DE INPUT (ARCADE STYLE) ---
function handleInput(e) {
    const key = e.key;

    if (currentScreen === 'menu') {
        const btnPlay = document.getElementById('btn-play');
        const btnCtrl = document.getElementById('btn-controls');
        
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            btnPlay.classList.toggle('selected');
            btnCtrl.classList.toggle('selected');
        } else if (key === 'Enter') {
            if (btnPlay.classList.contains('selected')) {
                switchScreen('name');
                updateKeyboardUI();
            }
        }
    } 
    
    else if (currentScreen === 'name') {
        if (key === 'ArrowRight' && kx < 6) kx++;
        if (key === 'ArrowLeft' && kx > 0) kx--;
        if (key === 'ArrowDown' && ky < 3) ky++;
        if (key === 'ArrowUp' && ky > 0) ky--;
        
        if (key === 'Enter') {
            let char = keyboardLayout[ky][kx];
            if (char === '<') {
                playerName = playerName.slice(0, -1);
            } else if (char === 'OK') {
                if (playerName.length === 0) playerName = "JOGADOR";
                startGame();
            } else if (playerName.length < 8) {
                playerName += char;
            }
            document.getElementById('player-name').innerText = playerName || "_";
        }
        updateKeyboardUI();
    }
    
    else if (currentScreen === 'game') {
        if (isPausedForQuestion) {
            const opts = document.querySelectorAll('.q-opt');
            if (key === 'ArrowRight' || key === 'ArrowLeft') {
                qSelection = qSelection === 0 ? 1 : 0;
                opts[0].classList.toggle('selected');
                opts[1].classList.toggle('selected');
            } else if (key === 'Enter') {
                answerQuestion();
            }
        } else {
            // Movimento da corrida
            if (key === 'ArrowDown' && playerLane < 2) playerLane++;
            if (key === 'ArrowUp' && playerLane > 0) playerLane--;
            updatePlayerPosition();
        }
    }
    
    else if (currentScreen === 'gameover') {
        const btnRep = document.getElementById('btn-replay');
        const btnHome = document.getElementById('btn-home');
        
        if (key === 'ArrowRight' || key === 'ArrowLeft') {
            btnRep.classList.toggle('selected');
            btnHome.classList.toggle('selected');
        } else if (key === 'Enter') {
            if (btnRep.classList.contains('selected')) {
                startGame();
            } else {
                switchScreen('menu');
            }
        }
    }
}

// --- FUNÇÕES DO TECLADO VIRTUAL ---
function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    keyboardLayout.forEach((row, y) => {
        row.forEach((keyStr, x) => {
            let div = document.createElement('div');
            div.className = 'key';
            div.id = `key-${x}-${y}`;
            div.innerText = keyStr;
            kb.appendChild(div);
        });
    });
}

function updateKeyboardUI() {
    document.querySelectorAll('.key').forEach(k => k.classList.remove('selected'));
    document.getElementById(`key-${kx}-${ky}`).classList.add('selected');
}

// --- FUNÇÕES DO JOGO ---
function startGame() {
    score = 0;
    lives = 3;
    playerLane = 1;
    entities.forEach(e => e.el.remove());
    entities = [];
    document.getElementById('hud-name').innerText = playerName;
    updateHUD();
    updatePlayerPosition();
    switchScreen('game');
    gameLoop = setInterval(updateGame, 1000 / 30); // 30 FPS
}

function updatePlayerPosition() {
    // Calcula o 'top' em CSS baseado na lane (150px por lane aprox)
    const yPos = 80 + (playerLane * 150); 
    document.getElementById('player').style.top = yPos + 'px';
}

function updateHUD() {
    document.getElementById('hud-score').innerText = score;
    document.getElementById('hud-lives').innerText = '❤️'.repeat(lives);
}

function updateGame() {
    if (isPausedForQuestion) return;

    // Spawnar entidades aleatoriamente
    if (Math.random() < 0.05) {
        let type = Math.random() < 0.2 ? 'star' : 'obstacle';
        if (Math.random() < 0.02) type = 'question'; // Objeto especial raro
        
        let el = document.createElement('div');
        el.className = 'entity';
        el.innerText = type === 'star' ? '⭐' : (type === 'question' ? '❓' : '🪨');
        
        let lane = Math.floor(Math.random() * 3);
        el.style.top = (80 + (lane * 150)) + 'px';
        el.style.left = '900px'; // Começa fora da tela
        
        document.getElementById('track').appendChild(el);
        entities.push({ el: el, x: 900, lane: lane, type: type });
    }

    // Mover entidades e checar colisão
    for (let i = entities.length - 1; i >= 0; i--) {
        let ent = entities[i];
        ent.x -= gameSpeed;
        ent.el.style.left = ent.x + 'px';

        // Colisão (Player X fixo em 50, largura ~50)
        if (ent.lane === playerLane && ent.x < 100 && ent.x > 30) {
            ent.el.remove();
            
            if (ent.type === 'obstacle') {
                lives--;
                updateHUD();
                if (lives <= 0) gameOver();
            } else if (ent.type === 'star') {
                score += 10;
                updateHUD();
            } else if (ent.type === 'question') {
                showQuestion();
            }
            entities.splice(i, 1);
        }
        // Remove se saiu da tela
        else if (ent.x < -50) {
            ent.el.remove();
            entities.splice(i, 1);
        }
    }
}

// --- SISTEMA DE PERGUNTAS ---
function showQuestion() {
    isPausedForQuestion = true;
    currentQuestionObj = questions[Math.floor(Math.random() * questions.length)];
    
    document.getElementById('q-text').innerText = currentQuestionObj.q;
    const opts = document.querySelectorAll('.q-opt');
    opts[0].innerText = currentQuestionObj.options[0];
    opts[1].innerText = currentQuestionObj.options[1];
    
    qSelection = 0;
    opts[0].classList.add('selected');
    opts[1].classList.remove('selected');
    
    document.getElementById('question-overlay').classList.remove('hidden');
}

function answerQuestion() {
    if (qSelection === currentQuestionObj.ans) {
        score += 50; // Bônus de acerto
        updateHUD();
    }
    document.getElementById('question-overlay').classList.add('hidden');
    isPausedForQuestion = false;
}

// --- GAME OVER ---
function gameOver() {
    clearInterval(gameLoop);
    document.getElementById('go-name').innerText = playerName;
    document.getElementById('go-score').innerText = score;
    
    // Atualiza Pódio
    document.getElementById('podium-1-name').innerText = playerName;
    document.getElementById('podium-1-pts').innerText = score + " pts";
    
    switchScreen('gameover');
}
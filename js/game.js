class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        this.player = new Player();
        this.selectedAge = 'junior';
        this.currentLevelIndex = 0;
        this.coins = 0;
        this.trashCount = 0;
        this.score = 0;
        this.distance = 0;
        this.maxDistance = 2000;
        this.gameSpeed = 6;
        this.isRunning = false;
        this.isPaused = false;

        this.obstacles = [];
        this.trashList = [];
        this.surpriseBoxes = [];
        this.bgParticles = [];
        this.spawnTimer = 0;

        this.unlockedChars = ["🤖"];
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.initEventListeners();
        this.updateLevelsMenu();
        this.initBgParticles();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    initBgParticles() {
        this.bgParticles = [];
        for (let i = 0; i < 15; i++) {
            this.bgParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - 150),
                size: Math.random() * 20 + 10,
                speed: Math.random() * 2 + 1
            });
        }
    }

    playSound(type) {
        if (!document.getElementById('setting-sfx').checked) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        if (type === 'trash') {
            osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, this.audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.1);
        } else if (type === 'upgrade') {
            osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(900, this.audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.3);
        } else if (type === 'wrong') {
            osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.2);
        }
    }

    speakText(text) {
        if (!document.getElementById('setting-tts').checked) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
        }
    }

    startLevel(index) {
        this.currentLevelIndex = index;
        this.distance = 0;
        this.obstacles = [];
        this.trashList = [];
        this.surpriseBoxes = [];
        this.isRunning = true;
        this.isPaused = false;

        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('phase-display').innerText = `Fase ${index + 1}`;

        this.loop();
    }

    spawnElements() {
        this.spawnTimer++;
        const level = LEVELS_DATA[this.currentLevelIndex];

        if (this.spawnTimer % 60 === 0) {
            const rand = Math.random();

            if (rand < 0.45) {
                // Spawn de Lixo Reciclável
                const trashType = level.trashItems[Math.floor(Math.random() * level.trashItems.length)];
                this.trashList.push({
                    x: this.canvas.width + 50,
                    y: Math.random() > 0.5 ? 60 : 0, // No chão ou flutuando levemente
                    type: trashType
                });
            } else if (rand < 0.85) {
                // Spawn de Obstáculos (Baixo = Pular | Alto = Agachar)
                const isHigh = Math.random() > 0.5;
                const obsList = isHigh ? level.obstaclesHigh : level.obstaclesLow;
                const obsType = obsList[Math.floor(Math.random() * obsList.length)];

                this.obstacles.push({
                    x: this.canvas.width + 50,
                    y: isHigh ? 65 : 0,
                    type: obsType,
                    isHigh: isHigh
                });
            } else if (this.surpriseBoxes.length === 0 && Math.random() > 0.6) {
                // Spawn de Caixa Surpresa 📦
                this.surpriseBoxes.push({
                    x: this.canvas.width + 50,
                    y: 30,
                    type: "🎁"
                });
            }
        }
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        this.player.update();
        this.distance += this.gameSpeed;

        // Exibir Banner de Upgrade se estiver ativo
        const bonusBanner = document.getElementById('bonus-banner');
        if (this.player.hasUpgrade) {
            bonusBanner.classList.remove('hidden');
        } else {
            bonusBanner.classList.add('hidden');
        }

        // Progresso da Fase
        const progress = Math.min((this.distance / this.maxDistance) * 100, 100);
        document.getElementById('phase-progress-bar').style.width = `${progress}%`;

        if (this.distance >= this.maxDistance) {
            this.completeLevel();
            return;
        }

        this.spawnElements();

        // 1. Movimentação e Coleta de Lixo
        for (let i = this.trashList.length - 1; i >= 0; i--) {
            let trash = this.trashList[i];
            trash.x -= this.gameSpeed;

            if (Math.abs(trash.x - this.player.x) < 35 && Math.abs(trash.y - this.player.y) < 50) {
                this.trashList.splice(i, 1);
                this.playSound('trash');
                
                const multiplier = this.player.hasUpgrade ? 2 : 1;
                this.trashCount++;
                this.coins += 2 * multiplier;
                this.score += 10 * multiplier;

                document.getElementById('trash-display').innerText = this.trashCount;
                document.getElementById('coins-display').innerText = this.coins;
                document.getElementById('score-display').innerText = this.score;
            } else if (trash.x < -50) {
                this.trashList.splice(i, 1);
            }
        }

        // 2. Colisão com Obstáculos (Subway Surfers)
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            if (Math.abs(obs.x - this.player.x) < 35) {
                let hit = false;
                if (obs.isHigh && !this.player.isSliding) hit = true; // Não agachou
                if (!obs.isHigh && this.player.y < 30) hit = true;     // Não pulou

                if (hit) {
                    this.obstacles.splice(i, 1);
                    this.playSound('wrong');
                    this.coins = Math.max(0, this.coins - 3);
                    document.getElementById('coins-display').innerText = this.coins;
                }
            } else if (obs.x < -50) {
                this.obstacles.splice(i, 1);
            }
        }

        // 3. Pegar Caixa Surpresa 📦 -> Ativa Desafio Educativo
        for (let i = this.surpriseBoxes.length - 1; i >= 0; i--) {
            let box = this.surpriseBoxes[i];
            box.x -= this.gameSpeed;

            if (Math.abs(box.x - this.player.x) < 40) {
                this.surpriseBoxes.splice(i, 1);
                this.triggerQuiz();
            } else if (box.x < -50) {
                this.surpriseBoxes.splice(i, 1);
            }
        }
    }

    draw() {
        const level = LEVELS_DATA[this.currentLevelIndex];

        // 1. Céu
        this.ctx.fillStyle = level.skyColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Parallax Decorativo
        this.ctx.font = '30px Arial';
        this.bgParticles.forEach(p => {
            p.x -= p.speed * 0.5;
            if (p.x < -50) p.x = this.canvas.width + 50;
            const bgElem = level.bgElements[Math.floor(p.size) % level.bgElements.length];
            this.ctx.fillText(bgElem, p.x, p.y);
        });

        // 3. Chão
        const groundHeight = this.player.groundY;
        const groundY = this.canvas.height - groundHeight;

        this.ctx.fillStyle = level.groundColor;
        this.ctx.fillRect(0, groundY, this.canvas.width, 20);

        this.ctx.fillStyle = level.dirtColor;
        this.ctx.fillRect(0, groundY + 20, this.canvas.width, groundHeight - 20);

        // 4. Desenhar Lixos Recicláveis
        this.trashList.forEach(t => {
            const tY = groundY - 25 - t.y;
            this.ctx.font = '35px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(t.type, t.x, tY);
        });

        // 5. Desenhar Obstáculos
        this.obstacles.forEach(obs => {
            const obsY = groundY - 25 - obs.y;
            this.ctx.font = '45px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(obs.type, obs.x, obsY);
        });

        // 6. Desenhar Caixa Surpresa
        this.surpriseBoxes.forEach(box => {
            const boxY = groundY - 30 - box.y;
            this.ctx.font = '45px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(box.type, box.x, boxY);
        });

        // 7. Desenhar Personagem
        this.player.draw(this.ctx, this.canvas.height);
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    triggerQuiz() {
        this.isRunning = false;
        const ageQuestions = QUESTIONS_BY_AGE[this.selectedAge];
        const qData = ageQuestions[Math.floor(Math.random() * ageQuestions.length)];

        document.getElementById('quiz-category').innerText = "📦 CAIXA SURPRESA!";
        document.getElementById('quiz-question').innerText = qData.question;
        this.speakText(qData.question);

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt';
            btn.innerText = opt;
            btn.onclick = () => this.handleAnswer(idx, qData.correct);
            optionsContainer.appendChild(btn);
        });

        document.getElementById('screen-quiz').classList.remove('hidden');
    }

    handleAnswer(selected, correct) {
        const options = document.querySelectorAll('.quiz-opt');
        options.forEach(opt => opt.style.pointerEvents = 'none');

        if (selected === correct) {
            options[selected].classList.add('correct');
            this.playSound('upgrade');

            // RECOMPENSA DE UPGRADE E BÔNUS!
            this.player.activateUpgrade();
            this.coins += 25; // Mais dinheiro para comprar personagens na loja!
            this.score += 150;

            document.getElementById('coins-display').innerText = this.coins;
            document.getElementById('score-display').innerText = this.score;
        } else {
            options[selected].classList.add('wrong');
            options[correct].classList.add('correct');
            this.playSound('wrong');
        }

        setTimeout(() => {
            document.getElementById('screen-quiz').classList.add('hidden');
            this.isRunning = true;
            this.loop();
        }, 1500);
    }

    completeLevel() {
        this.isRunning = false;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('bonus-banner').classList.add('hidden');

        if (this.currentLevelIndex + 1 < LEVELS_DATA.length) {
            document.getElementById('reward-trash').innerText = this.trashCount;
            document.getElementById('reward-coins').innerText = this.coins;
            document.getElementById('reward-score').innerText = this.score;
            document.getElementById('screen-reward').classList.remove('hidden');
        } else {
            document.getElementById('screen-victory').classList.remove('hidden');
        }
    }

    updateLevelsMenu() {
        const grid = document.getElementById('levels-grid');
        grid.innerHTML = '';
        LEVELS_DATA.forEach((lvl, idx) => {
            const card = document.createElement('div');
            card.className = 'level-card';
            card.innerHTML = `<div style="font-size:2rem">${lvl.icon}</div><strong>Fase ${lvl.id}</strong><br><small>${lvl.name}</small>`;
            card.onclick = () => this.startLevel(idx);
            grid.appendChild(card);
        });
    }

    initEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        // Controles de Pulo / Agachamento
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') this.player.jump();
            if (e.key === 'ArrowDown' || e.key === 's') this.player.slide();
        });

        document.getElementById('btn-select-age').onclick = () => {
            document.getElementById('screen-main').classList.add('hidden');
            document.getElementById('screen-age').classList.remove('hidden');
        };

        document.querySelectorAll('.btn-age').forEach(btn => {
            btn.onclick = (e) => {
                this.selectedAge = e.currentTarget.getAttribute('data-age');
                document.getElementById('screen-age').classList.add('hidden');
                this.startLevel(0);
            };
        });

        document.getElementById('btn-back-age').onclick = () => {
            document.getElementById('screen-age').classList.add('hidden');
            document.getElementById('screen-main').classList.remove('hidden');
        };

        // Loja de Personagens por Moedas
        document.getElementById('btn-char-select').onclick = () => {
            document.getElementById('shop-coins').innerText = this.coins;
            document.getElementById('screen-main').classList.add('hidden');
            document.getElementById('screen-chars').classList.remove('hidden');
        };

        document.querySelectorAll('.char-card').forEach(card => {
            card.onclick = (e) => {
                const selected = e.currentTarget;
                const charSkin = selected.getAttribute('data-char');
                const price = parseInt(selected.getAttribute('data-price'));

                if (!this.unlockedChars.includes(charSkin)) {
                    if (this.coins >= price) {
                        this.coins -= price;
                        this.unlockedChars.push(charSkin);
                        document.getElementById('shop-coins').innerText = this.coins;
                        selected.querySelector('small').innerText = "Desbloqueado!";
                    } else {
                        alert("Moedas insuficientes! Pegue mais lixos e Caixas Surpresa para ganhar moedas.");
                        return;
                    }
                }

                document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
                selected.classList.add('selected');
                this.player.skin = charSkin;
                document.getElementById('main-avatar-display').innerText = this.player.skin;
            };
        });

        document.getElementById('btn-back-chars').onclick = () => {
            document.getElementById('screen-chars').classList.add('hidden');
            document.getElementById('screen-main').classList.startLevel ? null : document.getElementById('screen-main').classList.remove('hidden');
        };

        document.getElementById('btn-levels').onclick = () => {
            document.getElementById('screen-main').classList.add('hidden');
            document.getElementById('screen-levels').classList.remove('hidden');
        };

        document.getElementById('btn-back-levels').onclick = () => {
            document.getElementById('screen-levels').classList.add('hidden');
            document.getElementById('screen-main').classList.remove('hidden');
        };

        document.getElementById('btn-settings').onclick = () => {
            document.getElementById('screen-main').classList.add('hidden');
            document.getElementById('screen-settings').classList.remove('hidden');
        };

        document.getElementById('btn-back-settings').onclick = () => {
            document.getElementById('screen-settings').classList.add('hidden');
            document.getElementById('screen-main').classList.remove('hidden');
        };

        document.getElementById('btn-jump').onclick = () => this.player.jump();
        document.getElementById('btn-slide').onclick = () => this.player.slide();

        document.getElementById('btn-pause').onclick = () => {
            this.isPaused = true;
            document.getElementById('screen-pause').classList.remove('hidden');
        };
        document.getElementById('btn-resume').onclick = () => {
            this.isPaused = false;
            document.getElementById('screen-pause').classList.add('hidden');
        };
        document.getElementById('btn-next-level').onclick = () => {
            this.startLevel(this.currentLevelIndex + 1);
        };
        document.getElementById('btn-victory-restart').onclick = () => location.reload();
    }
}

window.onload = () => {
    window.game = new Game();
};
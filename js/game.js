class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        this.player = new Player();
        this.selectedAge = 'junior';
        this.askedQuestions = [];
        
        this.trashCount = 0;
        this.score = 0;
        this.gameSpeed = 4.5; // VELOCIDADE EQUILIBRADA ESTILO SUBWAY SURFERS
        this.isRunning = false;
        this.isPaused = false;
        this.hasUsedRescue = false;

        this.obstacles = [];
        this.trashItems = [];
        this.bgEffects = [];
        this.spawnTimer = 0;

        this.quizTimerInterval = null;
        this.quizTimeLeft = 30;

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.initEventListeners();
        this.initBgEffects();
        this.renderCharacterPreviews();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        if (this.player) {
            this.player.laneX = [
                this.canvas.width * 0.22,
                this.canvas.width * 0.50,
                this.canvas.width * 0.78
            ];
        }
    }

    renderCharacterPreviews() {
        document.querySelectorAll('.preview-canvas').forEach(c => {
            const ctx = c.getContext('2d');
            const hero = c.getAttribute('data-hero');
            ctx.clearRect(0, 0, 70, 70);
            Player.drawHeroSprite(ctx, hero, 35, 60, 45, false, 0);
        });
    }

    initBgEffects() {
        this.bgEffects = [];
        const symbols = ["*", "+", "o", "#"];
        for (let i = 0; i < 20; i++) {
            this.bgEffects.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                speed: Math.random() * 1.2 + 0.4
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
            osc.frequency.setValueAtTime(650, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1300, this.audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.1);
        } else if (type === 'hit') {
            osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.45, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.25);
        }
    }

    startInfiniteGame() {
        const currentSkin = this.player.skin;
        this.player = new Player();
        this.player.skin = currentSkin;
        this.player.laneX = [
            this.canvas.width * 0.22,
            this.canvas.width * 0.50,
            this.canvas.width * 0.78
        ];
        this.trashCount = 0;
        this.score = 0;
        this.gameSpeed = 4.5;
        this.obstacles = [];
        this.trashItems = [];
        this.hasUsedRescue = false;
        this.isRunning = true;
        this.isPaused = false;

        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('hud').classList.remove('hidden');
        this.updateLivesDisplay();

        this.loop();
    }

    updateLivesDisplay() {
        document.getElementById('lives-display').innerText = `HP ${this.player.lives}/3`;
    }

    spawnElements() {
        this.spawnTimer++;
        if (this.spawnTimer % 55 === 0) {
            const lane = Math.floor(Math.random() * 3);
            const rand = Math.random();

            if (rand > 0.40) {
                const isBlockade = Math.random() < 0.35;
                const isHigh = Math.random() > 0.5;
                const type = isBlockade ? "BARRICADA" : SPOOKY_THEME.obstacles[Math.floor(Math.random() * SPOOKY_THEME.obstacles.length)];

                this.obstacles.push({ lane, y: -80, type, isHigh, isBlockade });
            } else {
                const type = SPOOKY_THEME.trashItems[Math.floor(Math.random() * SPOOKY_THEME.trashItems.length)];
                this.trashItems.push({ lane, y: -80, type });
            }
        }
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        this.player.update();
        this.score += 1;
        this.gameSpeed += 0.0003;

        document.getElementById('score-display').innerText = this.score;

        this.spawnElements();

        const groundY = this.canvas.height - 130;

        for (let i = this.trashItems.length - 1; i >= 0; i--) {
            let item = this.trashItems[i];
            item.y += this.gameSpeed;

            if (item.y > groundY - 60 && item.y < groundY + 50 && item.lane === this.player.targetLane) {
                this.trashItems.splice(i, 1);
                this.playSound('trash');
                this.trashCount++;
                this.score += 50;
                document.getElementById('trash-display').innerText = this.trashCount;
            } else if (item.y > this.canvas.height + 80) {
                this.trashItems.splice(i, 1);
            }
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.y += this.gameSpeed;

            if (obs.y > groundY - 60 && obs.y < groundY + 50 && obs.lane === this.player.targetLane) {
                let hit = false;
                
                if (obs.isBlockade) {
                    hit = true;
                } else if (obs.isHigh && !this.player.isSliding) {
                    hit = true;
                } else if (!obs.isHigh && this.player.y < 35) {
                    hit = true;
                }

                if (hit) {
                    this.obstacles.splice(i, 1);
                    this.playSound('hit');
                    this.player.lives--;
                    this.updateLivesDisplay();

                    if (this.player.lives <= 0) {
                        this.handlePlayerDeath();
                        return;
                    }
                }
            } else if (obs.y > this.canvas.height + 80) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    // Renderizador de Sprites dos Lixos
    drawTrashSprite(ctx, x, y, size, type) {
        ctx.save();
        ctx.translate(x, y);

        // Aura Neon Verde de Destaque
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.stroke();

        if (type === "GARRAFA") {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-size/6, -size/3, size/3, size/1.8);
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-size/12, -size/2, size/6, size/6);
        } else if (type === "LATA") {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-size/4, -size/3, size/2, size/1.8);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-size/4 + 2, -size/3 + 4, size/2 - 4, 6);
        } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(-size/4, -size/3, size/2, size/1.8);
        }

        ctx.restore();
    }

    // Renderizador de Sprites dos Obstáculos
    drawObstacleSprite(ctx, x, y, size, type) {
        ctx.save();
        ctx.translate(x, y);

        // Aura Vermelha de Alerta
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 5;
        ctx.stroke();

        if (type === "BARRICADA") {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-size/1.8, -size/3, size * 1.1, size/2);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-size/1.8 + 5, -size/3 + 5, size * 1.1 - 10, 8);
        } else {
            ctx.fillStyle = '#78716c';
            ctx.fillRect(-size/3, -size/3, size/1.5, size/1.5);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-4, -4, 8, 8);
        }

        ctx.restore();
    }

    draw() {
        const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGrad.addColorStop(0, '#090514');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#0f172a');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = '24px "Press Start 2P"';
        this.ctx.fillStyle = '#a855f7';
        this.bgEffects.forEach(bg => {
            bg.y += bg.speed * 0.35;
            if (bg.y > this.canvas.height) bg.y = -40;
            this.ctx.fillText(bg.symbol, bg.x, bg.y);
        });

        if (!this.isRunning) return;

        const horizonY = this.canvas.height * 0.22;
        
        this.ctx.fillStyle = '#18103c';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.20, horizonY);
        this.ctx.lineTo(this.canvas.width * 0.80, horizonY);
        this.ctx.lineTo(this.canvas.width * 0.98, this.canvas.height);
        this.ctx.lineTo(this.canvas.width * 0.02, this.canvas.height);
        this.ctx.fill();

        this.ctx.strokeStyle = '#a855f7';
        this.ctx.lineWidth = 6;
        [0.33, 0.66].forEach(ratio => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width * 0.20 + (this.canvas.width * 0.60 * ratio), horizonY);
            this.ctx.lineTo(this.canvas.width * ratio, this.canvas.height);
            this.ctx.stroke();
        });

        // Desenhar Sprites dos Lixos (Verde)
        this.trashItems.forEach(item => {
            const progress = (item.y - horizonY) / (this.canvas.height - horizonY);
            if (progress < 0) return;

            const currentX = this.player.laneX[item.lane];
            const size = Math.max(35, 80 * progress);
            this.drawTrashSprite(this.ctx, currentX, item.y, size, item.type);
        });

        // Desenhar Sprites dos Obstáculos (Vermelho)
        this.obstacles.forEach(obs => {
            const progress = (obs.y - horizonY) / (this.canvas.height - horizonY);
            if (progress < 0) return;

            const currentX = this.player.laneX[obs.lane];
            const size = Math.max(40, 90 * progress);
            this.drawObstacleSprite(this.ctx, currentX, obs.y, size, obs.type);
        });

        this.player.draw(this.ctx, this.canvas.height);
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    handlePlayerDeath() {
        this.isRunning = false;

        if (!this.hasUsedRescue) {
            this.hasUsedRescue = true;
            this.triggerRescueQuiz();
        } else {
            this.gameOver();
        }
    }

    getNonRepeatingQuestion() {
        const pool = QUESTIONS_BY_AGE[this.selectedAge];
        
        if (this.askedQuestions.length >= pool.length) {
            this.askedQuestions = [];
        }

        const available = pool.filter((_, idx) => !this.askedQuestions.includes(idx));
        const randomIndex = Math.floor(Math.random() * available.length);
        const originalIndex = pool.indexOf(available[randomIndex]);
        
        this.askedQuestions.push(originalIndex);
        return pool[originalIndex];
    }

    triggerRescueQuiz() {
        const qData = this.getNonRepeatingQuestion();
        document.getElementById('quiz-question').innerText = qData.question;

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt';
            btn.innerText = opt;
            btn.onclick = () => this.handleRescueAnswer(idx, qData.correct);
            optionsContainer.appendChild(btn);
        });

        document.getElementById('screen-quiz').classList.remove('hidden');

        this.quizTimeLeft = 30;
        document.getElementById('quiz-timer').innerText = this.quizTimeLeft;

        clearInterval(this.quizTimerInterval);
        this.quizTimerInterval = setInterval(() => {
            this.quizTimeLeft--;
            document.getElementById('quiz-timer').innerText = this.quizTimeLeft;

            if (this.quizTimeLeft <= 0) {
                clearInterval(this.quizTimerInterval);
                document.getElementById('screen-quiz').classList.add('hidden');
                this.gameOver();
            }
        }, 1000);
    }

    handleRescueAnswer(selected, correct) {
        clearInterval(this.quizTimerInterval);

        if (selected === correct) {
            this.player.lives = 1;
            this.updateLivesDisplay();
            document.getElementById('screen-quiz').classList.add('hidden');
            this.isRunning = true;
        } else {
            document.getElementById('screen-quiz').classList.add('hidden');
            this.gameOver();
        }
    }

    gameOver() {
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('go-trash').innerText = this.trashCount;
        document.getElementById('go-score').innerText = this.score;
        document.getElementById('screen-gameover').classList.remove('hidden');
    }

    initEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.renderCharacterPreviews();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.player.moveLeft();
            if (e.key === 'ArrowRight' || e.key === 'd') this.player.moveRight();
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') this.player.jump();
            if (e.key === 'ArrowDown' || e.key === 's') this.player.slide();
        });

        document.getElementById('btn-left').onclick = () => this.player.moveLeft();
        document.getElementById('btn-right').onclick = () => this.player.moveRight();
        document.getElementById('btn-jump').onclick = () => this.player.jump();
        document.getElementById('btn-slide').onclick = () => this.player.slide();

        document.getElementById('btn-start').onclick = () => {
            document.getElementById('screen-main').classList.add('hidden');
            document.getElementById('screen-char-select').classList.remove('hidden');
            this.renderCharacterPreviews();
        };

        document.getElementById('btn-back-char').onclick = () => {
            document.getElementById('screen-char-select').classList.add('hidden');
            document.getElementById('screen-main').classList.remove('hidden');
        };

        document.querySelectorAll('.mk-fighter').forEach(card => {
            card.onclick = (e) => {
                document.querySelectorAll('.mk-fighter').forEach(c => c.classList.remove('selected'));
                const selected = e.currentTarget;
                selected.classList.add('selected');
                this.player.skin = selected.getAttribute('data-char');
            };
        });

        document.getElementById('btn-confirm-char').onclick = () => {
            document.getElementById('screen-char-select').classList.add('hidden');
            document.getElementById('screen-age-select').classList.remove('hidden');
        };

        document.getElementById('btn-back-age').onclick = () => {
            document.getElementById('screen-age-select').classList.add('hidden');
            document.getElementById('screen-main').classList.remove('hidden');
        };

        document.querySelectorAll('.btn-age').forEach(btn => {
            btn.onclick = (e) => {
                this.selectedAge = e.currentTarget.getAttribute('data-age');
                document.getElementById('screen-age-select').classList.add('hidden');
                this.startInfiniteGame();
            };
        });

        document.getElementById('btn-restart').onclick = () => {
            document.getElementById('screen-gameover').classList.add('hidden');
            document.getElementById('screen-char-select').classList.remove('hidden');
        };

        document.getElementById('btn-go-home').onclick = () => {
            document.getElementById('screen-gameover').classList.add('hidden');
            document.getElementById('screen-main').classList.remove('hidden');
        };

        document.getElementById('btn-pause').onclick = () => {
            this.isPaused = true;
            document.getElementById('screen-pause').classList.remove('hidden');
        };
        document.getElementById('btn-resume').onclick = () => {
            this.isPaused = false;
            document.getElementById('screen-pause').classList.add('hidden');
        };
        document.getElementById('btn-menu-pause').onclick = () => {
            this.isRunning = false;
            document.getElementById('screen-pause').classList.add('hidden');
            document.getElementById('hud').classList.add('hidden');
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

        this.loop();
    }
}

window.onload = () => {
    window.game = new Game();
};
this.renderCharacterPreviews();
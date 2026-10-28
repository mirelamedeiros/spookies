class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UI();
        this.player = new Player();
        this.spawner = new SpawnManager();
        
        this.state = 'MENU'; // MENU, RUNNING, QUESTION, PAUSED, MAP, END
        this.currentWorld = 1;
        
        this.stats = { stars: 0, candies: 0, distance: 0 };
        this.currentSpeed = 0;
        
        this.questionData = null;
        this.qSelectedIndex = 0;

        this.bindEvents();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    bindEvents() {
        document.addEventListener('btnPause', () => {
            if (this.state === 'RUNNING') this.togglePause();
            else if (this.state === 'PAUSED') this.togglePause();
        });

        document.addEventListener('btnConfirm', () => {
            audio.init(); // Permissão do navegador para áudio
            if (this.state === 'MENU') {
                this.startWorld(1);
            } else if (this.state === 'MAP') {
                document.getElementById('btn-next-world').click();
            } else if (this.state === 'QUESTION' && !this.waitingFeedback) {
                this.answerQuestion();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (this.state === 'QUESTION' && !this.waitingFeedback) {
                if (e.code === 'ArrowLeft' && this.qSelectedIndex > 0) {
                    this.qSelectedIndex--;
                    this.ui.updateQuestionSelection(this.qSelectedIndex);
                    audio.playTone(500, 'sine', 0.1);
                } else if (e.code === 'ArrowRight' && this.qSelectedIndex < this.questionData.options.length - 1) {
                    this.qSelectedIndex++;
                    this.ui.updateQuestionSelection(this.qSelectedIndex);
                    audio.playTone(500, 'sine', 0.1);
                }
            }
        });
    }

    resetGame() {
        this.stats = { stars: 0, candies: 0, distance: 0 };
        this.currentWorld = 1;
        this.player.reset();
    }

    startWorld(worldNum) {
        if (worldNum > 6) {
            this.state = 'END';
            this.ui.showScreen('end');
            return;
        }
        this.currentWorld = worldNum;
        this.currentSpeed = levels[worldNum - 1].speed;
        this.spawner.reset();
        this.player.health = 3;
        this.stats.distance = 0; // Zera a distância no mundo
        this.state = 'RUNNING';
        this.ui.showScreen(null);
    }

    togglePause() {
        if (this.state === 'RUNNING') {
            this.state = 'PAUSED';
            this.ui.showScreen('pause');
        } else {
            this.state = 'RUNNING';
            this.ui.showScreen(null);
        }
    }

    triggerQuestion() {
        this.state = 'QUESTION';
        audio.playSpecial();
        this.questionData = getRandomQuestion(this.currentWorld);
        this.qSelectedIndex = 0;
        this.waitingFeedback = false;
        this.ui.setupQuestion(this.questionData);
        this.spawner.questionsHit++;
    }

    answerQuestion() {
        this.waitingFeedback = true;
        const isCorrect = (this.qSelectedIndex === this.questionData.answer);
        
        this.ui.showFeedback(isCorrect);
        
        if (isCorrect) {
            audio.playCorrect();
            this.stats.stars += 5;
            setTimeout(() => {
                this.state = 'RUNNING';
                this.ui.showScreen(null);
            }, 2000);
        } else {
            audio.playWrong();
            setTimeout(() => {
                this.waitingFeedback = false;
                this.ui.document.getElementById('question-feedback').classList.add('hidden');
            }, 2000);
        }
    }

    checkCollisions() {
        const pz = this.player.z;
        const hitboxRange = 20;

        this.spawner.objects.forEach(obj => {
            if (!obj.active) return;
            
            // Colisão Z e Lane
            if (Math.abs(obj.z - pz) < hitboxRange && obj.lane === Math.round(this.player.lane)) {
                
                // Obstáculo
                if (obj.category === 'obstacle') {
                    if (this.player.isJumping || this.player.isHit) return; // Desviou por cima ou imune
                    
                    obj.active = false;
                    this.player.health--;
                    this.player.isHit = true;
                    this.player.hitTimer = 60; // 1 seg invulnerável
                    audio.playHurt();
                    this.currentSpeed = Math.max(5, this.currentSpeed - 5); // Tropeça e perde vel

                    if (this.player.health <= 0) {
                        this.startWorld(this.currentWorld); // Tenta o nível de novo suavemente
                    }
                } 
                // Coletável
                else if (obj.category === 'collectible') {
                    if (this.player.isJumping && obj.type === '🍬') return; // Se pulou, não pega o doce no chão
                    obj.active = false;
                    if (obj.type === '⭐') this.stats.stars++;
                    else this.stats.candies++;
                    audio.playCoin();
                }
                // Especial (Pergunta)
                else if (obj.category === 'special') {
                    obj.active = false;
                    this.triggerQuestion();
                }
            }
        });
    }

    drawBackground(ctx, levelData) {
        ctx.fillStyle = levelData.bgColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
        
        ctx.fillStyle = levelData.groundColor;
        ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);
        
        // Linhas de perspectiva (Chão)
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        const cy = this.canvas.height / 2;
        const cx = this.canvas.width / 2;
        
        // Linhas das faixas
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx - 300, this.canvas.height);
        ctx.moveTo(cx, cy); ctx.lineTo(cx - 100, this.canvas.height);
        ctx.moveTo(cx, cy); ctx.lineTo(cx + 100, this.canvas.height);
        ctx.moveTo(cx, cy); ctx.lineTo(cx + 300, this.canvas.height);
        ctx.stroke();
        
        // Pseudo horizonte simulando velocidade (linhas horizontais)
        const offset = (this.stats.distance * 10) % 50;
        for(let i = 1; i < 5; i++) {
            let y = cy + i * 40 + offset;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
        }
    }

    update() {
        if (this.state !== 'RUNNING') return;
        
        const levelData = levels[this.currentWorld - 1];
        
        // Recupera velocidade gradualmente se tropeçou
        if (this.currentSpeed < levelData.speed) {
            this.currentSpeed += 0.05;
        }

        this.player.update();
        this.spawner.update(this.currentSpeed, levelData);
        this.checkCollisions();
        
        this.stats.distance += this.currentSpeed / 10;
        this.ui.updateHUD(this.stats.stars, this.stats.candies, this.stats.distance, this.player.health);

        // Fim do mundo (Ex: 1000 metros e respondeu as 2 perguntas)
        if (this.stats.distance > 500 && this.spawner.questionsHit >= 2) {
            this.state = 'MAP';
            this.ui.showMap(this.currentWorld);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'MENU' || this.state === 'END') return; // Telas HTML cobrem
        
        const levelData = levels[this.currentWorld - 1] || levels[0];
        this.drawBackground(this.ctx, levelData);
        
        this.spawner.draw(this.ctx, this.canvas.width, this.canvas.height);
        this.player.draw(this.ctx, this.canvas.width, this.canvas.height);
    }

    loop(timestamp) {
        this.update();
        this.draw();
        requestAnimationFrame((ts) => this.loop(ts));
    }
}
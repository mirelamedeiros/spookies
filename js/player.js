class Player {
    constructor() {
        this.lane = 1; // 0: Esquerda, 1: Centro, 2: Direita
        this.targetLane = 1;
        this.laneX = [150, 300, 450];
        this.x = this.laneX[1];
        
        this.y = 0;
        this.jumpVelocity = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.skin = "KIKO"; // KIKO, FOXIE, LEO, BATTY
        this.lives = 3;

        this.runFrame = 0;
        this.animTimer = 0;
    }

    moveLeft() {
        if (this.targetLane > 0) this.targetLane--;
    }

    moveRight() {
        if (this.targetLane < 2) this.targetLane++;
    }

    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.jumpVelocity = 15;
        }
    }

    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 30;
        }
    }

    update() {
        this.x += (this.laneX[this.targetLane] - this.x) * 0.35;

        this.animTimer++;
        if (this.animTimer % 4 === 0) {
            this.runFrame = (this.runFrame + 1) % 4;
        }

        if (this.isJumping) {
            this.y += this.jumpVelocity;
            this.jumpVelocity -= 0.85;
            if (this.y <= 0) {
                this.y = 0;
                this.isJumping = false;
            }
        }

        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }
    }

    // Desenhar Sprite Gráfico Vetorial dos Personagens
    static drawHeroSprite(ctx, skin, x, y, size = 60, isSliding = false, runFrame = 0) {
        ctx.save();
        ctx.translate(x, y);

        const bob = isSliding ? 10 : Math.sin(runFrame * Math.PI / 2) * 4;

        if (skin === "KIKO") {
            // KIKO ROBÔ (Azul / Cyber)
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-size/2, -size + bob, size, size * 0.8);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-size/2 + 6, -size + 6 + bob, size - 12, size * 0.4);
            // Olhos Neon
            ctx.fillStyle = '#34d399';
            ctx.fillRect(-size/4, -size + 12 + bob, 10, 10);
            ctx.fillRect(size/4 - 10, -size + 12 + bob, 10, 10);
            // Antena
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-3, -size - 12 + bob, 6, 12);
        } else if (skin === "FOXIE") {
            // FOXIE (Laranja / Raposa Super-Herói)
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.arc(0, -size/2 + bob, size/2, 0, Math.PI * 2);
            ctx.fill();
            // Orelhas
            ctx.beginPath();
            ctx.moveTo(-size/2, -size/2 + bob);
            ctx.lineTo(-size/3, -size + bob);
            ctx.lineTo(-size/8, -size/2 + bob);
            ctx.fillStyle = '#f97316';
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(size/2, -size/2 + bob);
            ctx.lineTo(size/3, -size + bob);
            ctx.lineTo(size/8, -size/2 + bob);
            ctx.fill();
            // Máscara
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-size/3, -size/2 - 4 + bob, size*0.66, 10);
        } else if (skin === "LEO") {
            // LEO (Amarelo / Leão Herói)
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(0, -size/2 + bob, size/1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, -size/2 + bob, size/2.5, 0, Math.PI * 2);
            ctx.fill();
            // Olhos de Herói
            ctx.fillStyle = '#000';
            ctx.fillRect(-12, -size/2 - 4 + bob, 8, 8);
            ctx.fillRect(4, -size/2 - 4 + bob, 8, 8);
        } else if (skin === "BATTY") {
            // BATTY (Morcego Noturno / Estilo Batman)
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(-size/2.2, -size + bob, size * 0.9, size * 0.75);
            // Orelhas de Morcego
            ctx.beginPath();
            ctx.moveTo(-size/2, -size + bob);
            ctx.lineTo(-size/3, -size - 14 + bob);
            ctx.lineTo(-size/6, -size + bob);
            ctx.fillStyle = '#312e81';
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(size/2, -size + bob);
            ctx.lineTo(size/3, -size - 14 + bob);
            ctx.lineTo(size/6, -size + bob);
            ctx.fill();
            // Emblema Amarelo no Peito
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.ellipse(0, -size/2 + 6 + bob, 14, 8, 0, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.restore();
    }

    draw(ctx, canvasHeight) {
        const renderY = canvasHeight - 130 - this.y;

        ctx.save();
        ctx.translate(this.x, renderY);

        // Sombra Arcade sob o personagem
        ctx.beginPath();
        ctx.ellipse(0, 32, 38, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fill();

        const tilt = (this.laneX[this.targetLane] - this.x) * 0.03;
        ctx.rotate(tilt);

        Player.drawHeroSprite(ctx, this.skin, 0, 30, 65, this.isSliding, this.runFrame);

        ctx.restore();
    }
}
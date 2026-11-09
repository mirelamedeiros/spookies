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

    // Método estático para desenhar os personagens em pixel/vetor estilo Halloween
    static drawHeroSprite(ctx, skin, x, y, size = 60, isSliding = false, runFrame = 0) {
        ctx.save();
        ctx.translate(x, y);

        const bob = isSliding ? 10 : Math.sin(runFrame * Math.PI / 2) * 4;

        if (skin === "KIKO") {
            // FRANKIKO (Frankenstein)
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(-size/2, -size + bob, size, size * 0.8);
            
            ctx.fillStyle = '#7e22ce'; 
            ctx.fillRect(-size/2 - 2, -size/3 + bob, size + 4, size/3 + 5);

            ctx.fillStyle = '#000';
            ctx.fillRect(-size/2, -size + bob, size, 15);

            ctx.fillStyle = '#000';
            ctx.fillRect(-size/4, -size + 25 + bob, 8, 8);
            ctx.fillRect(size/4 - 8, -size + 25 + bob, 8, 8);

            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-size/2 - 8, -size/2 + bob, 8, 10);
            ctx.fillRect(size/2, -size/2 + bob, 8, 10);

        } else if (skin === "FOXIE") {
            // BRUXIE (Bruxa)
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.arc(0, -size/2 + bob, size/2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(-size, -size/2 + bob);
            ctx.lineTo(size, -size/2 + bob);
            ctx.lineTo(0, -size - 20 + bob);
            ctx.fill();
            
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 4;
            ctx.strokeRect(-8, -size/2 - 12 + bob, 16, 12);

        } else if (skin === "LEO") {
            // MUMMY LEO (Múmia)
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(-size/2, -size + bob, size, size * 0.9);

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-size/2, -size + 15 + bob); ctx.lineTo(size/2, -size + 25 + bob);
            ctx.moveTo(-size/2, -size + 35 + bob); ctx.lineTo(size/2, -size + 30 + bob);
            ctx.moveTo(-size/2, -size + 45 + bob); ctx.lineTo(size/2, -size + 55 + bob);
            ctx.stroke();

            ctx.fillStyle = '#000';
            ctx.fillRect(-size/2 + 5, -size + 25 + bob, size - 10, 15);
            
            ctx.fillStyle = '#fde047';
            ctx.fillRect(-12, -size + 28 + bob, 6, 6);
            ctx.fillRect(6, -size + 28 + bob, 6, 6);

        } else if (skin === "BATTY") {
            // DRACBATTY (Vampiro)
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(0, -size/3 + bob);
            ctx.lineTo(-size, -size + bob);
            ctx.lineTo(-size/2, 0 + bob);
            ctx.lineTo(size/2, 0 + bob);
            ctx.lineTo(size, -size + bob);
            ctx.fill();

            ctx.fillStyle = '#f8fafc'; 
            ctx.beginPath();
            ctx.arc(0, -size/1.5 + bob, size/2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(-size/2.5, -size/1.5 + bob);
            ctx.lineTo(0, -size/1.5 + 15 + bob);
            ctx.lineTo(size/2.5, -size/1.5 + bob);
            ctx.lineTo(0, -size - 10 + bob);
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-10, -size/1.5 + 10 + bob, 5, 5);
            ctx.fillRect(5, -size/1.5 + 10 + bob, 5, 5);
            ctx.fillStyle = '#fff';
            ctx.fillRect(-6, -size/1.5 + 22 + bob, 3, 5);
            ctx.fillRect(3, -size/1.5 + 22 + bob, 3, 5);
        }

        ctx.restore();
    }

    draw(ctx, canvasHeight) {
        const renderY = canvasHeight - 130 - this.y;

        ctx.save();
        ctx.translate(this.x, renderY);

        // Sombra embaixo do personagem
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
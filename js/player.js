class Player {
    constructor() {
        this.x = 90;
        this.y = 0;
        this.groundY = 120;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.skin = "🤖";
        this.animFrame = 0;
        this.animTimer = 0;

        // Status de Upgrade
        this.hasUpgrade = false;
        this.upgradeTimer = 0;
    }

    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.velocityY = 15;
        }
    }

    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 35;
        }
    }

    activateUpgrade() {
        this.hasUpgrade = true;
        this.upgradeTimer = 600; // Duração do Upgrade (Aprox. 10 segundos)
    }

    update() {
        // Pulo
        if (this.isJumping) {
            this.y += this.velocityY;
            this.velocityY -= 0.8;
            if (this.y <= 0) {
                this.y = 0;
                this.isJumping = false;
            }
        }

        // Agachamento (Slide)
        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }

        // Timer de Upgrade
        if (this.hasUpgrade) {
            this.upgradeTimer--;
            if (this.upgradeTimer <= 0) {
                this.hasUpgrade = false;
            }
        }

        this.animTimer++;
        if (this.animTimer % 5 === 0) {
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    draw(ctx, canvasHeight) {
        const renderY = canvasHeight - this.groundY - this.y;

        ctx.save();
        ctx.translate(this.x, renderY);

        // Efeito Visual de Super Upgrade (Aura Brilhante)
        if (this.hasUpgrade) {
            ctx.beginPath();
            ctx.arc(0, -20, 40, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Renderização das animações do Personagem (Subway Surfers Style)
        if (this.isSliding) {
            ctx.rotate(0.5);
            ctx.font = '45px Arial';
            ctx.fillText(this.skin, 0, 15);
        } else if (this.isJumping) {
            ctx.rotate(-0.25);
            ctx.font = '55px Arial';
            ctx.fillText(this.skin, 0, 0);
        } else {
            const bobbing = Math.sin(this.animFrame * Math.PI / 2) * 5;
            ctx.rotate(Math.sin(this.animFrame * Math.PI / 2) * 0.1);
            ctx.font = '55px Arial';
            ctx.fillText(this.skin, 0, bobbing);
        }

        ctx.restore();
    }
}
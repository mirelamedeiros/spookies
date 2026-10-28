class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.lane = 0; // -1 (Esquerda), 0 (Centro), 1 (Direita)
        this.y = 0; // Altura do pulo
        this.z = 100; // Posição fixa no eixo Z (pseudo 3D)
        this.vy = 0;
        this.isJumping = false;
        this.isDucking = false;
        this.health = 3;
        this.targetLane = 0;
        this.laneSwitchTimer = 0;
        this.emoji = '👾';
        this.isHit = false;
        this.hitTimer = 0;
    }

    update(dt) {
        // Troca de faixa suave
        if (input.keys.left && this.laneSwitchTimer <= 0 && this.targetLane > -1) {
            this.targetLane--;
            this.laneSwitchTimer = 15; // frames de cooldown
        }
        if (input.keys.right && this.laneSwitchTimer <= 0 && this.targetLane < 1) {
            this.targetLane++;
            this.laneSwitchTimer = 15;
        }
        if (this.laneSwitchTimer > 0) this.laneSwitchTimer--;
        
        // Movimento suave para a faixa
        this.lane += (this.targetLane - this.lane) * 0.2;

        // Pulo
        if (input.keys.up && !this.isJumping) {
            this.isJumping = true;
            this.vy = 12;
            audio.playJump();
        }
        
        // Abaixar (Ducking)
        if (input.keys.down && !this.isJumping) {
            this.isDucking = true;
        } else {
            this.isDucking = false;
        }

        if (this.isJumping) {
            this.y += this.vy;
            this.vy -= 0.8; // Gravidade
            if (this.y <= 0) {
                this.y = 0;
                this.isJumping = false;
                this.vy = 0;
            }
        }

        // Piscar se foi atingido
        if (this.isHit) {
            this.hitTimer--;
            if (this.hitTimer <= 0) this.isHit = false;
        }
    }

    draw(ctx, width, height) {
        if (this.isHit && this.hitTimer % 4 < 2) return; // Efeito de piscar (invulnerabilidade)

        // Projeção 3D simples
        const scale = 300 / this.z;
        const x3d = this.lane * 150;
        const y3d = 50 + this.y * 2; // Altura do pulo afeta o Y
        
        const screenX = width / 2 + x3d * scale;
        const screenY = (height / 2 + 150) - y3d * scale;
        
        ctx.font = `${this.isDucking ? 40 * scale : 60 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        
        // Sombra
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(width/2 + x3d*scale, height/2 + 150 - 50*scale, 30*scale, 10*scale, 0, 0, Math.PI*2);
        ctx.fill();

        // Personagem
        ctx.fillText(this.emoji, screenX, screenY);
    }
}
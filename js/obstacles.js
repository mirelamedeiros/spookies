class GameObject {
    constructor(type, lane, z, category) {
        this.type = type; // Emoji string
        this.lane = lane; // -1, 0, 1
        this.z = z;
        this.category = category; // 'obstacle', 'collectible', 'special'
        this.active = true;
    }

    update(speed) {
        this.z -= speed;
        if (this.z < 10) this.active = false; // Passou da câmera
    }

    draw(ctx, width, height) {
        if (this.z < 20) return; // Não desenhar se estiver muito perto/atrás da câmera
        const scale = 300 / this.z;
        const x3d = this.lane * 150;
        
        const screenX = width / 2 + x3d * scale;
        const screenY = (height / 2 + 150) - 50 * scale;

        ctx.font = `${50 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(this.type, screenX, screenY);
    }
}

class SpawnManager {
    constructor() {
        this.objects = [];
        this.spawnTimer = 0;
        this.questionsHit = 0;
    }

    reset() {
        this.objects = [];
        this.spawnTimer = 0;
        this.questionsHit = 0;
    }

    update(speed, levelData) {
        this.spawnTimer--;
        
        if (this.spawnTimer <= 0) {
            this.spawn();
            this.spawnTimer = Math.max(20, 60 - speed); // Quanto mais rápido, mais spawns
        }

        this.objects.forEach(obj => obj.update(speed));
        this.objects = this.objects.filter(obj => obj.active);
    }

    spawn() {
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const rand = Math.random();
        const levelData = levels[game.currentWorld - 1];
        let type, category;

        // Lógica de Spawn: 5% Especial (Pergunta), 35% Coletável, 60% Obstáculo
        if (rand < 0.02 && this.questionsHit < 2) { // 2 perguntas por mundo
            type = '❓';
            category = 'special';
        } else if (rand < 0.40) {
            type = levelData.collectibles[Math.floor(Math.random() * levelData.collectibles.length)];
            category = 'collectible';
        } else {
            type = levelData.obstacles[Math.floor(Math.random() * levelData.obstacles.length)];
            category = 'obstacle';
        }

        this.objects.push(new GameObject(type, lane, 1000, category)); // Spawna no horizonte (z=1000)
    }

    draw(ctx, width, height) {
        // Ordenar por profundidade (Z-index) para renderização correta (fundo primeiro)
        this.objects.sort((a, b) => b.z - a.z).forEach(obj => obj.draw(ctx, width, height));
    }
}
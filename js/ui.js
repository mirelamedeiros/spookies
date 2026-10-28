class UI {
    constructor() {
        this.screens = {
            menu: document.getElementById('screen-menu'),
            controls: document.getElementById('screen-controls'),
            map: document.getElementById('screen-map'),
            question: document.getElementById('screen-question'),
            pause: document.getElementById('screen-pause'),
            end: document.getElementById('screen-end')
        };
        this.hud = document.getElementById('hud');
        
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('btn-play').addEventListener('click', () => game.startWorld(1));
        document.getElementById('btn-controls').addEventListener('click', () => this.showScreen('controls'));
        document.getElementById('btn-controls-back').addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('btn-next-world').addEventListener('click', () => game.startWorld(game.currentWorld + 1));
        document.getElementById('btn-resume').addEventListener('click', () => game.togglePause());
        document.getElementById('btn-quit').addEventListener('click', () => { game.resetGame(); this.showScreen('menu'); });
        document.getElementById('btn-end-menu').addEventListener('click', () => { game.resetGame(); this.showScreen('menu'); });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        if (screenName) {
            this.screens[screenName].classList.remove('hidden');
            this.hud.classList.add('hidden');
        } else {
            this.hud.classList.remove('hidden'); // Jogo rolando
        }
    }

    updateHUD(stars, candies, distance, health) {
        document.getElementById('score-stars').innerText = stars;
        document.getElementById('score-candies').innerText = candies;
        document.getElementById('score-distance').innerText = Math.floor(distance);
        document.getElementById('lives-container').innerText = '❤️'.repeat(health);
    }

    showMap(currentWorld) {
        this.showScreen('map');
        const mapTitle = document.getElementById('map-title');
        const mapProg = document.getElementById('map-progress');
        
        mapTitle.innerText = `Mundo ${currentWorld} Concluído!`;
        let html = '';
        for(let i=1; i<=6; i++) {
            if(i <= currentWorld) html += `⭐ Mundo ${i}<br>↓<br>`;
            else html += `🔒 Mundo ${i}<br>${i<6?'↓<br>':''}`;
        }
        mapProg.innerHTML = html;
        document.getElementById('btn-next-world').focus();
    }

    setupQuestion(q) {
        this.showScreen('question');
        document.getElementById('question-text').innerText = q.q;
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        
        q.options.forEach((opt, index) => {
            const div = document.createElement('div');
            div.className = 'option-box' + (index === 0 ? ' selected' : '');
            div.innerText = opt;
            container.appendChild(div);
        });
        
        document.getElementById('question-feedback').classList.add('hidden');
    }

    updateQuestionSelection(selectedIndex) {
        const boxes = document.querySelectorAll('.option-box');
        boxes.forEach((box, i) => {
            if (i === selectedIndex) box.classList.add('selected');
            else box.classList.remove('selected');
        });
    }

    showFeedback(isCorrect) {
        const fb = document.getElementById('question-feedback');
        fb.classList.remove('hidden');
        if (isCorrect) {
            fb.innerText = "Muito bem! A aventura continua!";
            fb.className = "feedback-correct";
        } else {
            fb.innerText = "Quase! Vamos tentar novamente.";
            fb.className = "feedback-wrong";
        }
    }
}
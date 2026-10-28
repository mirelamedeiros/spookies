class InputController {
    constructor() {
        this.keys = { left: false, right: false, up: false, down: false };
        this.actions = { confirm: false, pause: false };
        
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));
    }

    handleKey(e, isDown) {
        // Mapeamento Arcade/Teclado
        switch(e.code) {
            case 'ArrowLeft': this.keys.left = isDown; break;
            case 'ArrowRight': this.keys.right = isDown; break;
            case 'ArrowUp': this.keys.up = isDown; break;
            case 'ArrowDown': this.keys.down = isDown; break;
            case 'Space': 
            case 'Enter':
                if(isDown && !this.actions.confirm) {
                    this.actions.confirm = true; // Press trigger
                    document.dispatchEvent(new Event('btnConfirm'));
                } else if (!isDown) {
                    this.actions.confirm = false;
                }
                break;
            case 'Escape':
                if(isDown && !this.actions.pause) {
                    this.actions.pause = true;
                    document.dispatchEvent(new Event('btnPause'));
                } else if (!isDown) {
                    this.actions.pause = false;
                }
                break;
        }
    }
}

const input = new InputController();
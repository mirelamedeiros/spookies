/* Personagem e renderização 2D. Não precisa de sprites ou bibliotecas externas. */
(function(){
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  class RunnerPlayer {
    constructor(){
      this.lane = 1;
      this.visualLane = 1;
      this.jumpLeft = 0;
      this.runTime = 0;
      this.hitFlash = 0;
      this.lives = 3;
    }
    reset(){ this.lane = 1; this.visualLane = 1; this.jumpLeft = 0; this.runTime = 0; this.hitFlash = 0; this.lives = 3; }
    move(direction){ this.lane = clamp(this.lane + direction, 0, 2); }
    jump(){ if(this.jumpLeft <= 0) this.jumpLeft = 0.72; }
    isJumping(){ return this.jumpLeft > 0.13; }
    hit(){ this.hitFlash = 0.55; }
    update(dt){
      this.visualLane += (this.lane - this.visualLane) * Math.min(1, dt * 12);
      this.runTime += dt * (this.isJumping() ? 3 : 8);
      this.jumpLeft = Math.max(0, this.jumpLeft - dt);
      this.hitFlash = Math.max(0, this.hitFlash - dt);
    }
    draw(ctx, laneX, groundY){
      const cx = laneX(this.visualLane, 0.94);
      const jumpProgress = this.jumpLeft > 0 ? Math.sin((0.72 - this.jumpLeft) / 0.72 * Math.PI) : 0;
      const lift = jumpProgress * 100;
      const y = groundY - lift;
      const run = Math.sin(this.runTime);
      ctx.save();
      ctx.translate(cx, y);
      if(this.hitFlash > 0 && Math.floor(this.hitFlash * 20) % 2 === 0) ctx.globalAlpha = 0.5;
      // Sombra elíptica
      ctx.fillStyle = `rgba(6,12,32,${0.27 - jumpProgress * 0.13})`;
      ctx.beginPath(); ctx.ellipse(0, lift * 0.55 + 15, 33 - jumpProgress * 9, 9 - jumpProgress * 2, 0, 0, Math.PI*2); ctx.fill();
      // Pernas em movimento
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#35427b'; ctx.lineWidth = 13;
      ctx.beginPath(); ctx.moveTo(-10, -27); ctx.lineTo(-15 + run*8, -5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -27); ctx.lineTo(15 - run*8, -5); ctx.stroke();
      ctx.strokeStyle = '#eef1ff'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-10, -27); ctx.lineTo(-15 + run*8, -5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -27); ctx.lineTo(15 - run*8, -5); ctx.stroke();
      // Pés
      ctx.fillStyle = '#ffcf70';
      ctx.beginPath(); ctx.ellipse(-17 + run*8, -4, 13, 6, -0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(17 - run*8, -4, 13, 6, 0.15, 0, Math.PI*2); ctx.fill();
      // Braços
      ctx.strokeStyle = '#43aaa9'; ctx.lineWidth = 11;
      ctx.beginPath(); ctx.moveTo(-20, -61); ctx.lineTo(-30 - run*7, -41); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, -61); ctx.lineTo(30 + run*7, -45); ctx.stroke();
      ctx.strokeStyle = '#e0fff4'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-20, -61); ctx.lineTo(-30 - run*7, -41); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, -61); ctx.lineTo(30 + run*7, -45); ctx.stroke();
      // Corpo
      const bodyGrad = ctx.createLinearGradient(-23,-76,22,-24);
      bodyGrad.addColorStop(0,'#b6a7ff'); bodyGrad.addColorStop(1,'#7966e9');
      ctx.fillStyle = bodyGrad; ctx.strokeStyle = '#e5e5ff'; ctx.lineWidth = 3;
      roundedRect(ctx,-22,-77,44,54,14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff0a9'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('✦',0,-51);
      // Cabeça
      ctx.fillStyle = '#62d6c8'; ctx.strokeStyle = '#e4fff6'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0,-91,30,29,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#26345b';
      ctx.beginPath(); ctx.ellipse(-10,-92,3.5,6,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(10,-92,3.5,6,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#26345b'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0,-85,7,0.15,Math.PI-0.15); ctx.stroke();
      ctx.fillStyle = '#ff9eac'; ctx.beginPath(); ctx.ellipse(-18,-83,4.5,2.7,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(18,-83,4.5,2.7,0,0,Math.PI*2); ctx.fill();
      // Antena e brilho
      ctx.strokeStyle = '#a8fff1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0,-119); ctx.lineTo(0,-129); ctx.stroke();
      ctx.fillStyle = '#ffe08c'; ctx.shadowColor = '#ffe08c'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0,-132,5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  function roundedRect(ctx,x,y,w,h,r){
    const radius = Math.min(r,w/2,h/2);
    ctx.beginPath(); ctx.moveTo(x+radius,y); ctx.arcTo(x+w,y,x+w,y+h,radius); ctx.arcTo(x+w,y+h,x,y+h,radius); ctx.arcTo(x,y+h,x,y,radius); ctx.arcTo(x,y,x+w,y,radius); ctx.closePath();
  }

  window.RunnerPlayer = RunnerPlayer;
  window.GameDrawUtils = { roundedRect };
})();

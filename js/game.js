/* Mundos em Corrida — lógica principal. Feito em JavaScript puro + Canvas 2D. */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');
  const levels = window.GAME_LEVELS;
  const questionBank = window.GAME_QUESTIONS;
  const player = new window.RunnerPlayer();
  const screenIds = ['home-screen', 'levels-screen', 'game-screen', 'completion-screen'];
  const modalIds = ['question-modal', 'pause-modal', 'reward-modal', 'gameover-modal', 'settings-modal'];
  const challengeSpawnPoints = [0.17, 0.44, 0.71];
  const SAVE_KEY = 'mundos-em-corrida-save-v1';
  const SETTINGS_KEY = 'mundos-em-corrida-settings-v1';

  const freshStats = () => ({ score: 0, crystals: 0, completed: [], stars: {} });
  function readJSON(key, fallback){
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }
  const stats = Object.assign(freshStats(), readJSON(SAVE_KEY, {}));
  if (!Array.isArray(stats.completed)) stats.completed = [];
  if (!stats.stars || typeof stats.stars !== 'object') stats.stars = {};
  const settings = Object.assign({ music: true, effects: true, narration: false, volume: 0.5 }, readJSON(SETTINGS_KEY, {}));

  const game = {
    mode: 'home',
    levelIndex: 0,
    distance: 0,
    phaseScore: 0,
    phaseCrystals: 0,
    correctAnswers: 0,
    objects: [],
    obstacleTimer: 1.05,
    crystalTimer: 0.35,
    lastObstacleLane: 1,
    challengeSpawnIndex: 0,
    questionNo: 0,
    questionQueue: [],
    currentQuestion: null,
    questionAnswered: false,
    questionCorrect: false,
    dragPlaced: [],
    selectedDragSlot: 0,
    dragValue: null,
    noticeTimer: 0,
    pickupTimer: 0,
    runTime: 0,
    previousTime: 0,
    audio: null,
    musicTimer: null,
    musicNote: 0,
    modeBeforeSettings: null,
    memoryTimer: null,
    lastFrameTime: 0,
    lastSaveTime: 0,
    reducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  function saveStats(){
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(stats)); } catch { /* O jogo continua sem armazenamento local. */ }
  }
  function saveSettings(){
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* Configurações continuam na sessão. */ }
  }
  function currentLevel(){ return levels[game.levelIndex]; }
  function highestUnlocked(){ return Math.min(levels.length, Math.max(1, ...stats.completed.map(Number).filter(Number.isFinite).map(n => n + 1))); }
  function allCompleted(){ return levels.every(level => stats.completed.includes(level.id)); }
  function announce(message){ $('live-announcer').textContent = message; }
  function showNotice(message){
    const el = $('stage-notice');
    el.textContent = message; el.classList.add('show'); game.noticeTimer = 1.5;
  }
  function updateTopStats(){ $('top-crystals').textContent = stats.crystals; }

  function showScreen(id){
    for(const screenId of screenIds){
      const element = $(screenId);
      const active = screenId === id;
      element.hidden = !active;
      element.classList.toggle('active', active);
    }
    if(id !== 'game-screen') stopMusicIfNeeded();
  }
  function showModal(id){ $(id).hidden = false; }
  function hideModal(id){ $(id).hidden = true; }
  function hideAllModals(){ modalIds.forEach(hideModal); }
  function goHome(){
    game.mode = 'home'; hideAllModals(); showScreen('home-screen'); updateTopStats();
  }
  function goLevels(){
    game.mode = 'levels'; hideAllModals(); renderLevelCards(); showScreen('levels-screen'); updateTopStats();
  }

  function renderLevelCards(){
    const grid = $('level-grid');
    grid.innerHTML = '';
    const unlocked = highestUnlocked();
    for(const level of levels){
      const completed = stats.completed.includes(level.id);
      const allowed = level.id <= unlocked;
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'level-card'; card.disabled = !allowed;
      card.style.setProperty('--level-a', level.skyTop); card.style.setProperty('--level-b', level.skyBottom);
      const art = document.createElement('div'); art.className = 'level-art';
      const emoji = document.createElement('span'); emoji.className = 'level-emoji'; emoji.textContent = level.icon; emoji.setAttribute('aria-hidden','true');
      const number = document.createElement('span'); number.className = 'level-number'; number.textContent = `MUNDO ${String(level.id).padStart(2,'0')}`;
      art.append(emoji, number);
      const body = document.createElement('div'); body.className = 'level-card-body';
      const title = document.createElement('h3'); title.textContent = level.name;
      const desc = document.createElement('p'); desc.textContent = level.subtitle;
      const meta = document.createElement('div'); meta.className = 'level-card-meta';
      const topics = document.createElement('span'); topics.textContent = level.topics;
      const status = document.createElement('span'); status.className = 'level-status';
      status.textContent = completed ? `${'★'.repeat(stats.stars[level.id] || 1)}${'☆'.repeat(3-(stats.stars[level.id] || 1))}` : (allowed ? '▶ JOGAR' : '🔒');
      meta.append(topics, status); body.append(title, desc, meta); card.append(art, body);
      if(!allowed){
        const overlay = document.createElement('span'); overlay.className = 'locked-overlay';
        const lock = document.createElement('span'); lock.textContent = '🔒';
        const label = document.createElement('span'); label.textContent = 'Conclua o mundo anterior';
        overlay.append(lock, label); card.append(overlay);
      }
      if(allowed) card.addEventListener('click', () => startLevel(level.id - 1));
      grid.append(card);
    }
  }

  function shuffled(items){
    const copy = items.slice();
    for(let i=copy.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
    return copy;
  }

  function startLevel(index){
    game.levelIndex = Math.max(0, Math.min(levels.length-1, index));
    const level = currentLevel();
    game.distance = 0; game.phaseScore = 0; game.phaseCrystals = 0; game.correctAnswers = 0;
    game.objects = []; game.obstacleTimer = 0.9; game.crystalTimer = 0.55; game.lastObstacleLane = 1;
    game.challengeSpawnIndex = 0; game.questionNo = 0; game.questionQueue = shuffled(questionBank[level.id] || []);
    game.currentQuestion = null; game.questionAnswered = false; game.dragPlaced = [];
    if(game.memoryTimer!==null){window.clearTimeout(game.memoryTimer);game.memoryTimer=null;}
    game.runTime = 0; game.noticeTimer = 0; game.lastSaveTime = 0; player.reset(); hideAllModals();
    $('hud-phase').textContent = `MUNDO ${String(level.id).padStart(2,'0')}`;
    $('hud-world-name').textContent = level.name;
    $('hud-crystals').textContent = '0'; $('hud-score').textContent = '0';
    $('progress-fill').style.width = '0%'; $('progress-label').textContent = '0%';
    $('objective-text').textContent = `Pegue as relíquias douradas para liberar desafios sobre ${level.topics.toLowerCase()}.`;
    $('stage-notice').classList.remove('show');
    game.mode = 'running'; showScreen('game-screen'); updateTopStats();
    if(settings.music) startMusic();
    announce(`Começou ${level.name}. Use as setas para mudar de faixa e espaço para pular.`);
    renderFrame();
  }

  function laneX(lane, depth){
    const spread = 27 + Math.max(0,Math.min(1,depth)) * 126;
    return 500 + (lane - 1) * spread;
  }
  function projectY(depth){ return 145 + Math.pow(Math.max(0,Math.min(1,depth)), 1.55) * 354; }

  function drawBackground(level, dt){
    const gradient = ctx.createLinearGradient(0,0,0,560);
    gradient.addColorStop(0,level.skyTop); gradient.addColorStop(1,level.skyBottom);
    ctx.fillStyle=gradient; ctx.fillRect(0,0,1000,560);
    // Luz ambiente
    const light = ctx.createRadialGradient(770,90,10,770,90,300);
    light.addColorStop(0,'rgba(255,240,194,.28)'); light.addColorStop(1,'rgba(255,240,194,0)');
    ctx.fillStyle=light; ctx.fillRect(430,0,570,390);
    // Estrelas/pontinhos fixos e reprodutíveis
    for(let i=0;i<34;i++){
      const x=(i*173+39)%1000, y=(i*67+23)%230, r=(i%3===0?2.1:1.2);
      ctx.globalAlpha=0.25+((i%5)/7); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    if(level.scenery==='space' || level.scenery==='portal'){
      ctx.save(); ctx.globalAlpha=.4; ctx.fillStyle='#f4eaff';
      for(let i=0;i<7;i++){ const x=(i*151+88)%1000, y=50+(i*53)%190; ctx.beginPath(); ctx.arc(x,y,5+(i%3)*3,0,Math.PI*2); ctx.fill(); }
      ctx.restore();
      if(level.scenery==='space'){
        ctx.fillStyle='#947de0';ctx.beginPath();ctx.arc(815,111,47,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#c5b6ff';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(815,111,68,19,-.3,0,Math.PI*2);ctx.stroke();
      }
    } else {
      ctx.fillStyle='rgba(255,235,170,.72)'; ctx.beginPath(); ctx.arc(820,95,35,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,235,170,.18)'; ctx.beginPath(); ctx.arc(820,95,58,0,Math.PI*2); ctx.fill();
    }
    // Linhas de horizonte
    ctx.fillStyle=level.far;
    ctx.beginPath(); ctx.moveTo(0,260);
    for(let x=0;x<=1000;x+=80) ctx.lineTo(x,225+Math.sin(x*.015+(level.id*.7))*24);
    ctx.lineTo(1000,320);ctx.lineTo(0,320);ctx.closePath();ctx.fill();
    ctx.fillStyle=level.near;
    ctx.beginPath(); ctx.moveTo(0,330);
    for(let x=0;x<=1000;x+=65) ctx.lineTo(x,293+Math.sin(x*.021+level.id)*27);
    ctx.lineTo(1000,405);ctx.lineTo(0,405);ctx.closePath();ctx.fill();
    drawScenery(level);
    // Chão antes da estrada
    ctx.fillStyle=level.near; ctx.fillRect(0,400,1000,160);
    // Estrada em perspectiva
    ctx.fillStyle=level.road;
    ctx.beginPath();ctx.moveTo(438,142);ctx.lineTo(562,142);ctx.lineTo(820,560);ctx.lineTo(180,560);ctx.closePath();ctx.fill();
    // Laterais iluminadas
    ctx.strokeStyle=level.lane;ctx.globalAlpha=.55;ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(438,142);ctx.lineTo(180,560);ctx.stroke();
    ctx.beginPath();ctx.moveTo(562,142);ctx.lineTo(820,560);ctx.stroke();ctx.globalAlpha=1;
    // Divisórias das três faixas
    ctx.strokeStyle=level.lane;ctx.globalAlpha=.43;ctx.lineWidth=3;ctx.setLineDash([22,20]);
    ctx.lineDashOffset=-(game.distance%95)*.7;
    ctx.beginPath();ctx.moveTo(479,145);ctx.lineTo(393,560);ctx.stroke();
    ctx.beginPath();ctx.moveTo(521,145);ctx.lineTo(607,560);ctx.stroke();
    ctx.setLineDash([]);ctx.globalAlpha=1;
    // Pequenos brilhos na pista
    for(let i=0;i<8;i++){
      const p=((i/8)+(game.distance%420)/420)%1;
      const y=projectY(p); const x=500+Math.sin(i*5)*p*155;
      ctx.globalAlpha=.08+p*.15;ctx.fillStyle=level.accent;ctx.beginPath();ctx.arc(x,y,1+p*2,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  function drawScenery(level){
    const scenery=level.scenery;
    if(scenery==='forest'){
      for(let i=0;i<7;i++){
        const y=190+i*45, size=.32+i*.17, xL=85-i*9, xR=915+i*9;
        drawTree(xL,y,size,level.id+i); drawTree(xR,y,size,level.id+i+3);
      }
      ctx.globalAlpha=.45;ctx.fillStyle='#e0ffd7';
      for(let i=0;i<18;i++){const x=(i*59+12)%1000,y=250+(i*41)%220;ctx.beginPath();ctx.arc(x,y,2+(i%2),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    } else if(scenery==='city'){
      for(let side=0;side<2;side++) for(let i=0;i<6;i++){
        const x=side===0?i*42+8:755+i*42, y=184+(i%3)*20, w=35+(i%2)*12, h=90+(i%4)*22;
        ctx.fillStyle=['#65759e','#495c8c','#7b719d'][i%3];ctx.fillRect(x,y,w,h);
        ctx.fillStyle='#ffe6a4';for(let yy=y+12;yy<y+h-8;yy+=19)for(let xx=x+8;xx<x+w-5;xx+=14){ctx.globalAlpha=.7;ctx.fillRect(xx,yy,5,7);}ctx.globalAlpha=1;
      }
      ctx.fillStyle='#c5a7c5';ctx.fillRect(0,310,1000,12);
    } else if(scenery==='beach'){
      ctx.fillStyle='#6cd1d2';ctx.fillRect(0,250,1000,125);
      ctx.globalAlpha=.35;ctx.strokeStyle='#e7ffff';ctx.lineWidth=3;
      for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(0,265+i*22);ctx.bezierCurveTo(220,245+i*22,350,290+i*22,540,265+i*22);ctx.bezierCurveTo(750,245+i*22,850,285+i*22,1000,260+i*22);ctx.stroke();}ctx.globalAlpha=1;
      for(let i=0;i<4;i++){drawPalm(42+i*55,275+(i%2)*22,.55+i*.14);drawPalm(958-i*48,278+(i%2)*25,.57+i*.13);}
      ctx.fillStyle='#f7d49b';ctx.fillRect(0,375,1000,185);
    } else if(scenery==='mountain'){
      for(let i=0;i<5;i++){
        const x=i*240-45,h=115+(i%3)*35;
        ctx.fillStyle=i%2?'#7994b4':'#91a9c3';ctx.beginPath();ctx.moveTo(x,305);ctx.lineTo(x+95,305-h);ctx.lineTo(x+190,305);ctx.closePath();ctx.fill();
        ctx.fillStyle='#edf5ff';ctx.beginPath();ctx.moveTo(x+70,305-h+35);ctx.lineTo(x+95,305-h);ctx.lineTo(x+123,305-h+39);ctx.lineTo(x+105,305-h+31);ctx.lineTo(x+95,305-h+41);ctx.closePath();ctx.fill();
      }
      for(let i=0;i<9;i++){drawTree(i*117+20,345+(i%3)*18,.35+(i%4)*.1,i);}
    } else if(scenery==='space'){
      for(let i=0;i<4;i++){
        const x=55+i*290,y=265+(i%2)*47,r=12+(i%3)*6;
        ctx.fillStyle=['#8e81dc','#b17ad7','#5caec3'][i%3];ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=.25;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-r*.35,y-r*.3,r*.36,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      }
    } else {
      // Arcos distantes em volta do portal final
      for(let i=0;i<5;i++){
        ctx.strokeStyle=['#7ce8e0','#bd9bff','#ffcf70'][i%3];ctx.globalAlpha=.25;ctx.lineWidth=10-i;
        ctx.beginPath();ctx.ellipse(500,235,105+i*40,45+i*19,-.12,0,Math.PI*2);ctx.stroke();
      }ctx.globalAlpha=1;
    }
  }

  function drawTree(x,y,scale,seed){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='#5b4b64';ctx.fillRect(-6,0,12,48);
    const colors=['#3b8b7f','#438e80','#5aa08a','#33796f'];
    ctx.fillStyle=colors[Math.abs(seed)%colors.length];
    ctx.beginPath();ctx.arc(0,-8,31,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(-17,5,22,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(18,3,23,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#b1f0c4';ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(-8,-17,8,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.restore();
  }
  function drawPalm(x,y,scale){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.strokeStyle='#8d7650';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,35);ctx.quadraticCurveTo(8,0,0,-26);ctx.stroke();
    ctx.strokeStyle='#4c9b79';ctx.lineWidth=8;for(let i=0;i<5;i++){const a=(-2.8+i*1.35);ctx.beginPath();ctx.moveTo(0,-24);ctx.quadraticCurveTo(Math.cos(a)*23,-45,Math.cos(a)*48,-25+Math.sin(a)*18);ctx.stroke();}ctx.restore();
  }

  function drawObjects(){
    for(const object of game.objects){
      const depth = object.p;
      if(depth < 0 || depth > 1.04) continue;
      const x=laneX(object.lane,depth), y=projectY(depth), scale=.3+depth*.95;
      if(object.kind==='crystal'){
        ctx.save();ctx.translate(x,y-20*scale);ctx.rotate(Math.sin(game.runTime*2+object.seed)*.17);
        ctx.globalAlpha=.14+depth*.24;ctx.fillStyle='#7af0ff';ctx.beginPath();ctx.arc(0,0,26*scale,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        ctx.shadowColor='#69f3ff';ctx.shadowBlur=13*depth;
        ctx.fillStyle='#72f5ee';ctx.strokeStyle='#edffff';ctx.lineWidth=2*scale;
        ctx.beginPath();ctx.moveTo(0,-22*scale);ctx.lineTo(16*scale,-5*scale);ctx.lineTo(0,20*scale);ctx.lineTo(-16*scale,-5*scale);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#ffffff99';ctx.beginPath();ctx.moveTo(0,-22*scale);ctx.lineTo(0,6*scale);ctx.lineTo(-16*scale,-5*scale);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.restore();
      } else if(object.kind==='challenge'){
        const boxSize=18+25*depth;
        ctx.save();ctx.translate(x,y-18*scale);
        ctx.shadowColor='#ffca56';ctx.shadowBlur=25*depth+5;
        ctx.fillStyle='#ffcf70';ctx.strokeStyle='#fff4be';ctx.lineWidth=Math.max(1,2.5*depth);
        window.GameDrawUtils.roundedRect(ctx,-boxSize/2,-boxSize/2,boxSize,boxSize,Math.max(4,5*scale));ctx.fill();ctx.stroke();ctx.shadowBlur=0;
        ctx.strokeStyle='#9a5628';ctx.lineWidth=Math.max(1,2*depth);ctx.beginPath();ctx.moveTo(-boxSize*.45,0);ctx.lineTo(boxSize*.45,0);ctx.stroke();
        ctx.fillStyle='#805028';ctx.font=`bold ${Math.max(12,18+12*depth)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',0,1);
        if(depth>.47){ctx.fillStyle='#fff8d6';ctx.strokeStyle='#744d20';ctx.lineWidth=3;ctx.font=`900 ${Math.max(10,12+7*depth)}px system-ui`;ctx.strokeText('PEGUE!',0,boxSize*.95+14);ctx.fillText('PEGUE!',0,boxSize*.95+14);}
        ctx.restore();
      } else {
        const fontSize=20+34*depth;
        ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.globalAlpha=.2;ctx.fillStyle='#081026';ctx.beginPath();ctx.ellipse(x,y+12*scale,17*scale,5*scale,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        ctx.font=`${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;ctx.fillText(object.emoji,x,y-fontSize*.15);
        ctx.restore();
      }
    }
    // Beacon de desafio, sempre em uma área segura no instante da pergunta.
    if(game.mode==='question'){
      const pulse=game.reducedMotion?1:(1+Math.sin(game.runTime*3)*.06);
      ctx.save();ctx.translate(500,385);ctx.scale(pulse,pulse);
      ctx.globalAlpha=.3;ctx.fillStyle='#f7cf7b';ctx.beginPath();ctx.ellipse(0,35,66,18,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.shadowColor='#ffcf70';ctx.shadowBlur=28;ctx.fillStyle='#ffe4a1';ctx.strokeStyle='#fff8d9';ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
      ctx.fillStyle='#5c4b8b';ctx.font='bold 37px "Space Grotesk", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',0,1);ctx.restore();
    }
  }

  function renderFrame(){
    const level=currentLevel();
    drawBackground(level,0);
    drawObjects();
    player.draw(ctx,laneX,482);
    // Vidas do personagem
    ctx.save();ctx.font='19px sans-serif';ctx.textAlign='right';ctx.textBaseline='top';
    ctx.fillStyle='#111a34bb';window.GameDrawUtils.roundedRect(ctx,848,16,136,39,12);ctx.fill();
    for(let i=0;i<3;i++){
      ctx.globalAlpha=i<player.lives?1:.25;ctx.fillStyle=i<player.lives?'#ff8d9a':'#e2e7ff';ctx.font='21px sans-serif';ctx.fillText('♥',967-i*28,23);
    }ctx.restore();
    // Pequena marca de fase
    ctx.save();ctx.fillStyle='#111a34bb';window.GameDrawUtils.roundedRect(ctx,16,508,200,33,10);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px "DM Sans", sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`${Math.floor(Math.min(1,game.distance/currentLevel().goal)*100)}% DA TRILHA`,28,525);ctx.restore();
  }

  function spawnObject(kind){
    let lane=Math.floor(Math.random()*3);
    if(kind==='obstacle' && lane===game.lastObstacleLane && Math.random()<.8){
      const options=[0,1,2].filter(n=>n!==game.lastObstacleLane);lane=options[Math.floor(Math.random()*options.length)];
    }
    if(kind==='obstacle') game.lastObstacleLane=lane;
    const level=currentLevel();
    if(kind==='challenge'){
      const busyLanes = new Set(game.objects.filter(object=>object.p<.24).map(object=>object.lane));
      const freeLanes = [0,1,2].filter(candidate=>!busyLanes.has(candidate));
      if(freeLanes.length) lane=freeLanes[Math.floor(Math.random()*freeLanes.length)];
    }
    const emoji=kind==='obstacle'?level.obstacle[Math.floor(Math.random()*level.obstacle.length)]:(kind==='challenge'?'🎁':'✨');
    game.objects.push({kind,lane,p:0,emoji,seed:Math.random()*10});
  }

  function updateGame(dt){
    if(game.mode!=='running') return;
    const level=currentLevel();
    game.runTime += dt;
    game.distance += dt * 148 * level.speed;
    player.update(dt);
    game.obstacleTimer -= dt; game.crystalTimer -= dt;
    if(game.obstacleTimer<=0){ spawnObject('obstacle'); game.obstacleTimer=1.03/level.speed + Math.random()*.33; }
    if(game.crystalTimer<=0){ spawnObject('crystal'); game.crystalTimer=.62+Math.random()*.48; }
    const progress=Math.min(1,game.distance/level.goal);
    // Relíquias são colocadas na pista em pontos definidos, mas só liberam perguntas se Kiko realmente as coletar.
    if(game.challengeSpawnIndex<challengeSpawnPoints.length && progress>=challengeSpawnPoints[game.challengeSpawnIndex]){
      spawnObject('challenge');game.challengeSpawnIndex++;
      showNotice('Relíquia dourada à frente! Pegue para liberar um desafio.');
    }
    $('progress-fill').style.width=`${progress*100}%`;$('progress-label').textContent=`${Math.floor(progress*100)}%`;
    for(let i=game.objects.length-1;i>=0;i--){
      const object=game.objects[i]; object.p += dt * .58 * level.speed;
      if(object.p>=.9){
        if(object.lane===Math.round(player.visualLane)){
          if(object.kind==='crystal'){
            game.phaseCrystals++; game.phaseScore+=25; stats.crystals++; stats.score+=25;
            $('hud-crystals').textContent=game.phaseCrystals; $('hud-score').textContent=game.phaseScore;
            updateTopStats(); soundEffect(920,.09); showNotice('+1 cristal  ·  +25 pontos');
          } else if(object.kind==='challenge'){
            game.objects.splice(i,1);
            game.phaseScore+=50;stats.score+=50;$('hud-score').textContent=game.phaseScore;saveStats();
            soundEffect(1060,.18);showNotice('RELÍQUIA COLETADA! DESAFIO LIBERADO!');
            game.mode='pickup';game.pickupTimer=.26;
            return;
          } else if(object.kind==='obstacle' && !player.isJumping()){
            player.lives--;player.hit();soundEffect(160,.2);showNotice('Ops! Desvie ou pule os obstáculos.');
            if(player.lives<=0){ game.objects.splice(i,1); enterGameOver(); return; }
          }
        }
        game.objects.splice(i,1);
      }
    }
    if(game.noticeTimer>0){game.noticeTimer-=dt;if(game.noticeTimer<=0)$('stage-notice').classList.remove('show');}
    if(game.distance>=level.goal){ completeLevel(); return; }
    if(game.runTime-game.lastSaveTime>8){game.lastSaveTime=game.runTime;saveStats();}
  }

  function openQuestion(){
    const q=game.questionQueue[game.questionNo % game.questionQueue.length];
    if(!q){game.mode='running';return;}
    game.questionNo++; game.currentQuestion=q;game.questionAnswered=false;game.questionCorrect=false;
    // Remove objetos quase no personagem para que a retomada seja segura.
    game.objects=game.objects.filter(object=>object.p<.72);
    game.mode='question';
    $('stage-notice').classList.remove('show');game.noticeTimer=0;
    $('question-world').textContent=currentLevel().name.toUpperCase();
    $('question-count').textContent=`RELÍQUIA COLETADA • DESAFIO ${game.questionNo}`;
    $('question-title').textContent=q.title;
    $('question-prompt').textContent=q.prompt;
    const visual=$('question-visual');
    if(q.visual){visual.hidden=false;visual.textContent=q.visual;}else{visual.hidden=true;visual.textContent='';}
    if(game.memoryTimer!==null){window.clearTimeout(game.memoryTimer);game.memoryTimer=null;}
    if(q.type==='memory' && q.visual){
      $('question-prompt').textContent='Memorize os símbolos! Eles vão desaparecer em instantes.';
      game.memoryTimer=window.setTimeout(()=>{
        if(game.currentQuestion===q && !game.questionAnswered){
          visual.hidden=true;$('question-prompt').textContent='Qual símbolo apareceu na sequência?';
          game.memoryTimer=null;
        }
      },2400);
    }
    $('question-options').innerHTML='';$('drag-area').innerHTML='';$('drag-area').hidden=true;$('question-options').hidden=false;
    $('answer-feedback').textContent='';$('answer-feedback').classList.remove('error');$('continue-button').hidden=true;
    if(q.type==='drag') renderDragQuestion(q); else renderAnswerOptions(q);
    showModal('question-modal');
    if(settings.narration) speak(`${q.title}. ${q.prompt}`);
    soundEffect(630,.08);announce(`Desafio educativo: ${q.title}. ${q.prompt}`);
    renderFrame();
  }

  function renderAnswerOptions(q){
    const container=$('question-options');container.className='answer-grid';
    q.options.forEach((option,index)=>{
      const item=typeof option==='string'?{text:option,icon:''}:option;
      const button=document.createElement('button');button.type='button';button.className='answer-option';button.dataset.index=String(index);
      const letter=document.createElement('span');letter.className='option-letter';letter.textContent=String.fromCharCode(65+index);
      const symbol=document.createElement('span');symbol.className='option-symbol';symbol.textContent=item.icon||'✦';symbol.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.className='option-text';text.textContent=item.text;
      button.append(letter,symbol,text);button.addEventListener('click',()=>submitAnswer(index));container.append(button);
    });
  }

  function renderDragQuestion(q){
    $('question-options').hidden=true;$('drag-area').hidden=false;
    game.dragPlaced=Array(q.correctOrder.length).fill(null);game.selectedDragSlot=0;
    rebuildDragArea(q);
  }
  function rebuildDragArea(q){
    const area=$('drag-area');area.className='drag-area';area.innerHTML='';
    const help=document.createElement('p');help.className='drag-help';help.textContent='Arraste cada item para a posição correta. No teclado ou toque, escolha um espaço e depois um item.';area.append(help);
    const slots=document.createElement('div');slots.className='drag-slots';
    game.dragPlaced.forEach((value,index)=>{
      const slot=document.createElement('button');slot.type='button';slot.className='drag-slot'+(value!==null?' filled':'')+(game.selectedDragSlot===index?' selected':'');slot.dataset.slot=String(index);
      slot.textContent=value===null?`Posição ${index+1}`:value;slot.setAttribute('aria-label',`Posição ${index+1}: ${value===null?'vazia':value}`);
      slot.addEventListener('click',()=>{game.selectedDragSlot=index;rebuildDragArea(q);});
      slot.addEventListener('dragover',event=>event.preventDefault());
      slot.addEventListener('drop',event=>{event.preventDefault();const value=event.dataTransfer.getData('text/plain');if(value)placeDragItem(q,value,index);});
      slots.append(slot);
    });area.append(slots);
    const items=document.createElement('div');items.className='drag-items';
    q.dragItems.filter(item=>!game.dragPlaced.includes(item)).forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='drag-item';button.textContent=item;button.draggable=true;button.dataset.dragValue=item;
      button.addEventListener('click',()=>{
        let target=game.selectedDragSlot;
        if(game.dragPlaced[target]!==null){const next=game.dragPlaced.findIndex(v=>v===null);if(next>=0)target=next;}
        placeDragItem(q,item,target);
      });
      button.addEventListener('dragstart',event=>event.dataTransfer.setData('text/plain',item));
      items.append(button);
    });area.append(items);
    const check=document.createElement('button');check.type='button';check.className='primary-button full-button';check.id='drag-check';check.textContent='Conferir ordem ✓';check.addEventListener('click',()=>checkDragAnswer(q));area.append(check);
  }
  function placeDragItem(q,item,slotIndex){
    const oldIndex=game.dragPlaced.indexOf(item);
    const replaced=game.dragPlaced[slotIndex];
    game.dragPlaced[slotIndex]=item;
    if(oldIndex>=0 && oldIndex!==slotIndex) game.dragPlaced[oldIndex]=replaced===item?null:replaced;
    game.selectedDragSlot=Math.min(game.dragPlaced.length-1,slotIndex+1);
    rebuildDragArea(q);soundEffect(450,.045);
  }
  function checkDragAnswer(q){
    if(game.dragPlaced.some(value=>value===null)){
      $('answer-feedback').textContent='Preencha todos os espaços antes de conferir.';$('answer-feedback').classList.add('error');return;
    }
    const isCorrect=q.correctOrder.every((value,index)=>game.dragPlaced[index]===value);
    $('drag-check').disabled=true;
    $('drag-area').querySelectorAll('.drag-item,.drag-slot').forEach(el=>el.disabled=true);
    submitAnswer(isCorrect?0:-1,{forcedCorrect:isCorrect,explanation:q.explanation});
  }

  function submitAnswer(index,options={}){
    if(game.questionAnswered) return;
    const q=game.currentQuestion;if(!q)return;
    const correct=typeof options.forcedCorrect==='boolean'?options.forcedCorrect:index===q.answer;
    game.questionAnswered=true;game.questionCorrect=correct;
    const feedback=$('answer-feedback');feedback.classList.toggle('error',!correct);
    if(correct){
      game.correctAnswers++;game.phaseScore+=100;stats.score+=100;
      feedback.textContent=`Muito bem! +100 pontos. ${options.explanation||q.explanation||''}`;
      soundEffect(820,.12);announce(`Resposta correta. ${options.explanation||q.explanation||''}`);
    }else{
      feedback.textContent=`Boa tentativa! ${options.explanation||q.explanation||'Vamos aprender e continuar.'}`;
      soundEffect(230,.12);announce(`Resposta não correta. ${options.explanation||q.explanation||''}`);
    }
    const buttons=$('question-options').querySelectorAll('.answer-option');
    buttons.forEach((button,buttonIndex)=>{
      button.disabled=true;
      if(buttonIndex===q.answer && q.type!=='drag')button.classList.add('correct');
      if(buttonIndex===index && !correct)button.classList.add('wrong');
    });
    $('hud-score').textContent=game.phaseScore;
    if(settings.narration) speak(feedback.textContent);
    $('continue-button').hidden=false;saveStats();
  }

  function continueQuestion(){
    hideModal('question-modal');
    if(game.memoryTimer!==null){window.clearTimeout(game.memoryTimer);game.memoryTimer=null;}
    if(game.mode==='question') game.mode='running';
    game.currentQuestion=null;
    announce('A corrida continua!');
    $('objective-text').textContent=game.challengeSpawnIndex>=challengeSpawnPoints.length?'Todas as relíquias já apareceram! Continue até o portal.':'Procure a relíquia dourada para liberar o próximo desafio.';
    renderFrame();
  }

  function pauseGame(){
    if(game.mode!=='running')return;
    game.mode='paused';showModal('pause-modal');announce('Corrida pausada.');
  }
  function resumeGame(){
    hideModal('pause-modal');if(game.mode==='paused')game.mode='running';announce('Corrida retomada.');
  }
  function enterGameOver(){
    game.mode='gameover';showModal('gameover-modal');soundEffect(130,.28);announce('Fim da tentativa. Você pode tentar novamente.');
  }

  function completeLevel(){
    if(game.mode!=='running')return;
    game.mode='reward';
    const level=currentLevel();
    if(!stats.completed.includes(level.id))stats.completed.push(level.id);
    stats.completed.sort((a,b)=>a-b);
    const stars=game.correctAnswers>=3?3:(game.correctAnswers>=1?2:1);
    stats.stars[level.id]=Math.max(stats.stars[level.id]||0,stars);
    stats.score+=150;game.phaseScore+=150;saveStats();updateTopStats();
    $('reward-illustration').textContent=level.id===6?'🌈':level.icon;
    $('reward-title').textContent=level.id===6?'Cristal final encontrado!':'Mundo concluído!';
    $('reward-message').textContent=`Você atravessou ${level.name} e desbloqueou: ${level.reward}.`;
    $('reward-points').textContent=`+150 pontos · ${'★'.repeat(stars)}${'☆'.repeat(3-stars)} · ${game.phaseCrystals} cristais nesta fase`;
    $('hud-score').textContent=game.phaseScore;
    $('progress-fill').style.width='100%';$('progress-label').textContent='100%';
    $('objective-text').textContent='Fase concluída! Recompensa conquistada.';
    showModal('reward-modal');soundEffect(1040,.22);announce(`Parabéns! Você concluiu ${level.name}.`);
    renderFrame();
  }

  function finishAdventure(){
    hideAllModals();game.mode='complete';showScreen('completion-screen');
    $('final-score').textContent=stats.score;$('final-crystals').textContent=stats.crystals;
    $('final-levels').textContent=`${stats.completed.length}/6`;
    $('completion-message').textContent='Você reuniu os Cristais do Conhecimento e restaurou o Portal dos Mundos. Continue curioso e nunca pare de aprender!';
    if(settings.narration)speak('Parabéns! Você completou a aventura!');soundEffect(1120,.3);saveStats();
  }

  // Sons simples gerados no navegador; nenhum arquivo de áudio externo é necessário.
  function getAudio(){
    if(game.audio)return game.audio;
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return null;
    try{
      const audioCtx=new AudioContextClass();const master=audioCtx.createGain();master.gain.value=settings.volume;master.connect(audioCtx.destination);
      game.audio={ctx:audioCtx,master};return game.audio;
    }catch{return null;}
  }
  function playTone(frequency,duration=0.1,wave='sine',volume=.16){
    const audio=getAudio();if(!audio)return;
    if(audio.ctx.state==='suspended')audio.ctx.resume().catch(()=>{});
    const oscillator=audio.ctx.createOscillator(),gain=audio.ctx.createGain();
    oscillator.type=wave;oscillator.frequency.setValueAtTime(frequency,audio.ctx.currentTime);
    gain.gain.setValueAtTime(0.0001,audio.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*settings.volume),audio.ctx.currentTime+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,audio.ctx.currentTime+duration);
    oscillator.connect(gain);gain.connect(audio.master);oscillator.start();oscillator.stop(audio.ctx.currentTime+duration+.03);
  }
  function soundEffect(frequency=660,duration=.08){if(settings.effects)playTone(frequency,duration,'sine',.23);}
  function startMusic(){
    if(!settings.music||game.musicTimer!==null)return;
    const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];
    game.musicTimer=window.setInterval(()=>{
      if(!settings.music||game.mode==='home'||game.mode==='levels'||game.mode==='complete')return;
      playTone(notes[game.musicNote%notes.length],.42,'sine',.055);game.musicNote++;
    },650);
  }
  function stopMusicIfNeeded(){
    if(game.musicTimer!==null && !settings.music){window.clearInterval(game.musicTimer);game.musicTimer=null;}
  }
  function syncAudioSettings(){
    const audio=getAudio();if(audio)audio.master.gain.value=settings.volume;
    if(settings.music)startMusic();else if(game.musicTimer!==null){window.clearInterval(game.musicTimer);game.musicTimer=null;}
  }
  function speak(text){
    if(!settings.narration||!('speechSynthesis' in window))return;
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='pt-BR';utterance.rate=.93;
    try{window.speechSynthesis.speak(utterance);}catch{/* Recurso opcional do navegador. */}
  }

  function handleAction(action){
    if(action==='pause'){
      if(game.mode==='running')pauseGame();
      else if(game.mode==='paused')resumeGame();
      return;
    }
    if(game.mode!=='running')return;
    if(action==='left')player.move(-1);else if(action==='right')player.move(1);else if(action==='jump')player.jump();
    soundEffect(action==='jump'?520:390,.04);
  }
  function openSettings(){
    if(game.mode==='running'){game.modeBeforeSettings='running';game.mode='settings';}
    else if(game.mode==='paused'){game.modeBeforeSettings='paused';}
    else if(game.mode==='question'){game.modeBeforeSettings='question';game.mode='settings';}
    else game.modeBeforeSettings=game.mode;
    $('music-toggle').checked=settings.music;$('effects-toggle').checked=settings.effects;$('narration-toggle').checked=settings.narration;
    $('volume-control').value=Math.round(settings.volume*100);$('volume-value').textContent=`${Math.round(settings.volume*100)}%`;
    showModal('settings-modal');
  }
  function closeSettings(){
    hideModal('settings-modal');
    if(game.mode==='settings')game.mode=game.modeBeforeSettings||'home';
    game.modeBeforeSettings=null;
  }
  function setSetting(name,value){settings[name]=value;saveSettings();syncAudioSettings();}

  // Eventos de tela inicial e seleção de mundos
  $('play-button').addEventListener('click',()=>{
    const next=levels.find(level=>!stats.completed.includes(level.id));
    startLevel((next?next.id:1)-1);
  });
  $('levels-button').addEventListener('click',goLevels);
  $('levels-back').addEventListener('click',goHome);
  $('settings-open').addEventListener('click',openSettings);
  $('fullscreen-button').addEventListener('click',async()=>{
    try{
      if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch{showNotice('A tela cheia não está disponível neste navegador.');}
  });
  document.addEventListener('fullscreenchange',()=>{
    const active=Boolean(document.fullscreenElement);
    $('fullscreen-button').textContent=active?'⤢':'⛶';
    $('fullscreen-button').setAttribute('aria-label',active?'Sair da tela cheia':'Ativar tela cheia');
  });
  $('sound-quick').addEventListener('click',()=>{
    const newValue=!(settings.music||settings.effects);settings.music=newValue;settings.effects=newValue;
    saveSettings();syncAudioSettings();$('sound-quick').textContent=newValue?'🔊':'🔇';
    $('sound-quick').setAttribute('aria-label',newValue?'Desativar sons':'Ativar sons');
  });
  $('exit-run').addEventListener('click',goLevels);
  $('pause-button').addEventListener('click',pauseGame);
  $('resume-button').addEventListener('click',resumeGame);
  $('pause-restart').addEventListener('click',()=>startLevel(game.levelIndex));
  $('pause-exit').addEventListener('click',goLevels);
  $('question-close').addEventListener('click',continueQuestion);
  $('continue-button').addEventListener('click',continueQuestion);
  $('reward-continue').addEventListener('click',()=>{
    hideModal('reward-modal');
    if(game.levelIndex===levels.length-1){finishAdventure();return;}
    startLevel(game.levelIndex+1);
  });
  $('reward-levels').addEventListener('click',goLevels);
  $('gameover-retry').addEventListener('click',()=>startLevel(game.levelIndex));
  $('gameover-levels').addEventListener('click',goLevels);
  $('play-again').addEventListener('click',()=>startLevel(0));
  $('completion-levels').addEventListener('click',goLevels);
  $('settings-close').addEventListener('click',closeSettings);
  $('settings-done').addEventListener('click',closeSettings);
  $('music-toggle').addEventListener('change',event=>setSetting('music',event.target.checked));
  $('effects-toggle').addEventListener('change',event=>setSetting('effects',event.target.checked));
  $('narration-toggle').addEventListener('change',event=>setSetting('narration',event.target.checked));
  $('volume-control').addEventListener('input',event=>{settings.volume=Number(event.target.value)/100;$('volume-value').textContent=`${event.target.value}%`;saveSettings();const audio=getAudio();if(audio)audio.master.gain.value=settings.volume;});

  document.querySelectorAll('[data-action]').forEach(button=>{
    const action=button.dataset.action;
    button.addEventListener('click',()=>handleAction(action));
    button.addEventListener('touchstart',()=>{}, {passive:true});
  });

  window.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    if(['arrowleft','arrowright','arrowup',' ','a','d','w','z','x','c','v','p','escape','enter'].includes(key))event.preventDefault();
    if(game.mode==='question'){
      if(key==='escape'){continueQuestion();return;}
      if(game.currentQuestion?.type==='drag'){
        if(/^[1-4]$/.test(key)){
          const slot=$('drag-area').querySelectorAll('.drag-slot')[Number(key)-1];if(slot)slot.click();
        } else if(['z','x','c','v'].includes(key)&&!game.questionAnswered){
          const wanted=game.currentQuestion.dragItems['zxcv'.indexOf(key)];const item=Array.from($('drag-area').querySelectorAll('.drag-item')).find(element=>element.dataset.dragValue===wanted);if(item)item.click();
        } else if(key==='enter'){
          if(game.questionAnswered)continueQuestion();else $('drag-check')?.click();
        }
        return;
      }
      const answerKeys={'z':0,'x':1,'c':2,'v':3};
      if(!game.questionAnswered&&(/^[1-4]$/.test(key)||Object.hasOwn(answerKeys,key))){
        const index=/^[1-4]$/.test(key)?Number(key)-1:answerKeys[key];
        const button=$('question-options').querySelector(`[data-index="${index}"]`);if(button)button.click();
      } else if(key==='enter'&&game.questionAnswered)continueQuestion();
      return;
    }
    if(game.mode==='home'&&(key==='enter'||key===' '||key==='z')){$('play-button').click();return;}
    if(game.mode==='levels'&&key==='enter'){$('level-grid').querySelector('.level-card:not(:disabled)')?.click();return;}
    if(game.mode==='running'){
      if(key==='arrowleft'||key==='a')handleAction('left');
      else if(key==='arrowright'||key==='d')handleAction('right');
      else if(key==='arrowup'||key==='w'||key===' '||key==='z')handleAction('jump');
      else if(key==='p'||key==='escape'||key==='x')pauseGame();
    } else if(game.mode==='paused'&&(key==='p'||key==='escape'||key==='enter'||key==='x'))resumeGame();
  });

  // Loop de atualização/desenho
  function frame(timestamp){
    if(!game.lastFrameTime)game.lastFrameTime=timestamp;
    const dt=Math.min(.045,Math.max(0,(timestamp-game.lastFrameTime)/1000));game.lastFrameTime=timestamp;
    if(game.mode==='running')updateGame(dt);
    else if(game.mode==='pickup') {
      game.pickupTimer-=dt;
      if(game.pickupTimer<=0){openQuestion();}
    }
    else if(game.mode==='question'){
      // Um leve brilho da cena continua animado sem mover o personagem nem os obstáculos.
      if(!game.reducedMotion)game.runTime+=dt*.25;
    }
    if(!['home','levels','complete'].includes(game.mode))renderFrame();
    requestAnimationFrame(frame);
  }

  // Estado inicial
  updateTopStats();
  $('sound-quick').textContent=(settings.music||settings.effects)?'🔊':'🔇';
  $('music-toggle').checked=settings.music;$('effects-toggle').checked=settings.effects;$('narration-toggle').checked=settings.narration;
  $('volume-control').value=Math.round(settings.volume*100);$('volume-value').textContent=`${Math.round(settings.volume*100)}%`;
  renderFrame();requestAnimationFrame(frame);
})();

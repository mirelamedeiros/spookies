# SPOOKIES: Mundo dos Monstrinhos 👾

Um jogo Endless Runner educacional focado para máquinas de fliperama, desenvolvido para um trabalho escolar do SENAI. O jogo ensina de forma lúdica interrompendo suavemente a corrida para apresentar desafios interativos.

## 🛠️ Tecnologias
- HTML5 (Canvas)
- CSS3
- JavaScript (ES6+ / Sem dependências externas)
- Web Audio API para síntese sonora (Funciona totalmente offline).

## 🚀 Como abrir e jogar
1. Faça o download da pasta ou clone o repositório.
2. Abra a pasta `SPOOKIES` no **Visual Studio Code (VS Code)**.
3. Não é necessário compilar. Basta abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox).
   *Dica: Você pode usar a extensão "Live Server" do VS Code para uma melhor experiência.*

## 🎮 Controles
O sistema de inputs em `js/controls.js` suporta os controles listados:

- **Joystick / Setas do Teclado**:
  - `Esquerda / Direita`: Muda o monstrinho de faixa e seleciona opções nas perguntas.
  - `Cima`: Pular obstáculos.
  - `Baixo`: Abaixar (Preparo para esquivas adicionais).
- **Botões**:
  - `Botão 1 (Espaço/Enter)`: Confirma a resposta ou interage no menu.
  - `Botão 2 (ESC)`: Pausa o jogo.

## ⚙️ Customização e Manutenção

- **Como alterar/adicionar perguntas:**
  Abra o arquivo `js/questions.js`. O array `questionsBank` é separado por fase (1 a 6). Adicione objetos no formato `{ q: "Sua Pergunta?", options: ["A", "B", "C"], answer: Índice_Correto(0, 1, 2) }`. Aceita Emojis!

- **Como alterar os mundos, velocidades e cenários:**
  Vá em `js/levels.js`. Cada objeto representa um mundo. Altere as cores (`bgColor`, `groundColor`), a velocidade base (`speed`) e a gama de emojis utilizados para os obstáculos (`obstacles`) ou coletáveis (`collectibles`).

- **Como conectar controles físicos (Fliperama):**
  Como placas de fliperama (como a Zero Delay) costumam mapear os inputs diretamente para teclas de um teclado, tudo funcionará nativamente. Se a sua placa utilizar códigos diferentes, basta modificar os cases dentro da função `handleKey` no arquivo `js/controls.js`.
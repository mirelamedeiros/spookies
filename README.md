# Mundos em Corrida

Jogo educativo de corrida infinita feito com HTML, CSS e JavaScript puro. Não usa bibliotecas externas, sprites baixados nem arquivos de áudio externos.

## Como executar

1. Extraia a pasta `mundos-em-corrida`.
2. Abra a pasta no Visual Studio Code.
3. Abra `index.html` no navegador. Para desenvolvimento, também pode usar a extensão Live Server no VS Code.
4. Clique em **Jogar agora**.

O jogo também pode ser executado sem conexão com a internet: as ilustrações e os efeitos sonoros são desenhados ou gerados pelo próprio navegador.

## Controles

- **← / A:** mover uma faixa para a esquerda.
- **→ / D:** mover uma faixa para a direita.
- **Espaço / ↑ / W:** pular.
- **P / Esc:** pausar; durante um desafio, Esc volta para a corrida.
- **1–4:** selecionar rapidamente uma resposta enquanto um desafio de múltipla escolha está aberto.
- Mouse, clique e controles na tela também funcionam.

## Estrutura

- `index.html`: telas, botões, modais e interface acessível.
- `css/style.css`: identidade visual, layout responsivo e animações.
- `js/game.js`: estado do jogo, controles, colisões, pontuação, telas e áudio gerado.
- `js/player.js`: personagem e desenho do Kiko.
- `js/questions.js`: banco de perguntas por mundo.
- `js/levels.js`: cenários, cores, velocidade, obstáculos e progressão.
- `assets/images/`: reservado para imagens personalizadas futuras; a versão inicial desenha os gráficos no Canvas/CSS.
- `assets/sounds/`: reservado para áudios futuros; a versão inicial cria efeitos sonoros com Web Audio API.

## Personalização

- Para editar perguntas: `js/questions.js`.
- Para editar os mundos e a velocidade: `js/levels.js`.
- Para alterar a aparência: `css/style.css` e as funções de desenho em `js/game.js`.

A conclusão dos mundos, as moedas e a pontuação são salvas localmente no navegador. Use os controles de configuração para ativar/desativar música, efeitos e narração.

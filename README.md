# Mundos em Corrida

Jogo educativo de corrida infinita feito com HTML, CSS e JavaScript puro. Não usa bibliotecas externas, sprites baixados nem arquivos de áudio externos.

## Como executar

1. Extraia a pasta `mundos-em-corrida`.
2. Abra a pasta no Visual Studio Code.
3. Abra `index.html` no navegador. Para desenvolvimento, também pode usar a extensão Live Server no VS Code.
4. Clique em **START • JOGAR** (ou pressione Enter) para começar.
5. Para uma experiência mais parecida com o fliperama, use o botão **⛶ Tela cheia** no canto superior direito.

O jogo também pode ser executado sem conexão com a internet: as ilustrações e os efeitos sonoros são desenhados ou gerados pelo próprio navegador.

## Controles de fliperama

- **Joystick / ← → / A e D:** mudar de faixa.
- **Botão A / Z / Espaço:** pular obstáculos.
- **Botão B / X / P / Esc:** pausar ou retomar.
- **1–4 ou Z / X / C / V:** selecionar uma resposta no desafio.
- **Enter:** iniciar, conferir uma sequência ou continuar após responder.
- **Mouse e botões visuais:** também funcionam para testar no computador.

## Como aparecem os desafios

As perguntas não surgem automaticamente. Três relíquias douradas são colocadas na pista durante cada mundo. O jogador precisa se posicionar na faixa correta e coletar uma relíquia para desbloquear uma pergunta. Se passar por ela sem coletá-la, o jogo continua a corrida normalmente.

## Modo gabinete

A interface foi adaptada para um monitor horizontal de fliperama, com moldura de gabinete, tela de jogo ampla, painel inferior ilustrando joystick e botões A/B e opção de tela cheia. Em um fliperama com encoder USB, configure as direções e botões para enviar as teclas indicadas acima. O jogo também continua testável em um navegador comum.

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

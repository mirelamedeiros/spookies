/* Banco de perguntas. Tipos visuais diferentes usam o mesmo sistema de resposta acessível. */
window.GAME_QUESTIONS = {
  1: [
    { type:'image', title:'Olhos atentos!', prompt:'Qual destes objetos tem formato de círculo?', visual:'Escolha pela forma', options:[{text:'Bola',icon:'⚽'},{text:'Livro',icon:'📕'},{text:'Caixa',icon:'📦'},{text:'Régua',icon:'📏'}], answer:0, explanation:'A bola é redonda, como um círculo.' },
    { type:'count', title:'Conte com Kiko', prompt:'Quantas maçãs aparecem no bosque?', visual:'🍎　🍎　🍎', options:[{text:'2',icon:'2️⃣'},{text:'3',icon:'3️⃣'},{text:'4',icon:'4️⃣'}], answer:1, explanation:'Muito bem! São três maçãs.' },
    { type:'choice', title:'Qual é a cor?', prompt:'Qual destas coisas costuma ser amarela?', options:[{text:'Sol',icon:'☀️'},{text:'Folha',icon:'🍃'},{text:'Uva',icon:'🍇'},{text:'Nuvem',icon:'☁️'}], answer:0, explanation:'O sol costuma ser representado com a cor amarela.' },
    { type:'truefalse', title:'Verdadeiro ou falso?', prompt:'Uma borboleta é um inseto.', options:[{text:'Verdadeiro',icon:'✅'},{text:'Falso',icon:'❌'}], answer:0, explanation:'Isso mesmo! Borboletas são insetos.' },
    { type:'drag', title:'Complete o caminho', prompt:'Organize os números do menor para o maior.', dragItems:['3','1','2'], correctOrder:['1','2','3'], explanation:'A sequência crescente é 1, 2, 3.' }
  ],
  2: [
    { type:'sequence', title:'A sequência sumiu!', prompt:'Qual número vem a seguir?', visual:'2　4　6　?', options:[{text:'7',icon:'7️⃣'},{text:'8',icon:'8️⃣'},{text:'9',icon:'9️⃣'},{text:'10',icon:'🔟'}], answer:1, explanation:'A sequência aumenta de 2 em 2: 2, 4, 6, 8.' },
    { type:'association', title:'Cada coisa no seu lugar', prompt:'Qual objeto usamos para escrever no caderno?', options:[{text:'Lápis',icon:'✏️'},{text:'Colher',icon:'🥄'},{text:'Chinelo',icon:'🩴'},{text:'Pente',icon:'🪮'}], answer:0, explanation:'Usamos o lápis para escrever ou desenhar.' },
    { type:'math', title:'Conta rápida!', prompt:'A oficina da cidade tem 2 rodas e ganhou mais 3. Quantas rodas são?', visual:'2 + 3 = ?', options:[{text:'4 rodas',icon:'4️⃣'},{text:'5 rodas',icon:'5️⃣'},{text:'6 rodas',icon:'6️⃣'}], answer:1, explanation:'2 + 3 = 5. Boa conta!' },
    { type:'truefalse', title:'Sinal de trânsito', prompt:'A luz vermelha do semáforo indica que devemos parar.', options:[{text:'Verdadeiro',icon:'✅'},{text:'Falso',icon:'❌'}], answer:0, explanation:'A luz vermelha indica parada.' },
    { type:'drag', title:'Monte a sequência', prompt:'Coloque as letras em ordem alfabética.', dragItems:['C','A','B'], correctOrder:['A','B','C'], explanation:'A ordem alfabética é A, B, C.' }
  ],
  3: [
    { type:'count', title:'Tesouro na areia', prompt:'Quantas conchas você encontrou?', visual:'🐚　🐚　🐚　🐚', options:[{text:'3',icon:'3️⃣'},{text:'4',icon:'4️⃣'},{text:'5',icon:'5️⃣'}], answer:1, explanation:'Há quatro conchas na areia.' },
    { type:'choice', title:'Quem vive no mar?', prompt:'Qual animal é conhecido por viver no oceano?', options:[{text:'Golfinho',icon:'🐬'},{text:'Leão',icon:'🦁'},{text:'Galinha',icon:'🐔'},{text:'Camelo',icon:'🐫'}], answer:0, explanation:'Golfinhos vivem no ambiente aquático.' },
    { type:'math', title:'Compare as quantidades', prompt:'Kiko tem 5 estrelas e entrega 2. Com quantas estrelas fica?', visual:'5 − 2 = ?', options:[{text:'2 estrelas',icon:'2️⃣'},{text:'3 estrelas',icon:'3️⃣'},{text:'4 estrelas',icon:'4️⃣'}], answer:1, explanation:'5 − 2 = 3 estrelas.' },
    { type:'association', title:'Agrupe os iguais', prompt:'Qual item combina com a categoria “frutas”?', options:[{text:'Banana',icon:'🍌'},{text:'Martelo',icon:'🔨'},{text:'Bola',icon:'🏀'},{text:'Meia',icon:'🧦'}], answer:0, explanation:'Banana é uma fruta.' },
    { type:'drag', title:'Organize os tamanhos', prompt:'Coloque do menor para o maior.', dragItems:['🐘','🐭','🐶'], correctOrder:['🐭','🐶','🐘'], explanation:'O rato é menor que o cachorro, que é menor que o elefante.' }
  ],
  4: [
    { type:'logic', title:'Pense no padrão', prompt:'A trilha alterna árvore, pedra, árvore, pedra… O que vem agora?', visual:'🌲　🪨　🌲　🪨　?', options:[{text:'Árvore',icon:'🌲'},{text:'Pedra',icon:'🪨'},{text:'Flor',icon:'🌼'}], answer:0, explanation:'O padrão alterna árvore e pedra, então vem uma árvore.' },
    { type:'choice', title:'Como podemos ajudar?', prompt:'Uma pessoa deixou cair seus livros. O que é uma atitude gentil?', options:[{text:'Ajudar a recolher',icon:'🤝'},{text:'Ignorar sempre',icon:'🚶'},{text:'Espalhar os livros',icon:'📚'}], answer:0, explanation:'Ajudar com respeito é uma atitude gentil.' },
    { type:'truefalse', title:'Pequeno cientista', prompt:'Observar com atenção ajuda a resolver problemas.', options:[{text:'Verdadeiro',icon:'✅'},{text:'Falso',icon:'❌'}], answer:0, explanation:'Observar detalhes pode ajudar a encontrar soluções.' },
    { type:'sequence', title:'Subindo a montanha', prompt:'Qual número completa o padrão?', visual:'5　10　15　?', options:[{text:'16',icon:'🔹'},{text:'20',icon:'🔷'},{text:'25',icon:'💠'}], answer:1, explanation:'A sequência aumenta de 5 em 5.' },
    { type:'drag', title:'Passos para resolver', prompt:'Organize uma sequência simples para preparar um lanche.', dragItems:['Comer','Lavar as mãos','Preparar o lanche'], correctOrder:['Lavar as mãos','Preparar o lanche','Comer'], explanation:'Primeiro lave as mãos, depois prepare o lanche e então coma.' }
  ],
  5: [
    { type:'math', title:'Conta espacial', prompt:'A nave tinha 7 cristais e usou 3 para ligar o motor. Quantos restaram?', visual:'7 − 3 = ?', options:[{text:'3',icon:'3️⃣'},{text:'4',icon:'4️⃣'},{text:'5',icon:'5️⃣'},{text:'10',icon:'🔟'}], answer:1, explanation:'7 − 3 = 4 cristais.' },
    { type:'memory', title:'Memória de astronauta', prompt:'Observe os símbolos e escolha qual apareceu na sequência.', visual:'🌙　⭐　🪐　🚀', memoryTarget:'🪐', options:[{text:'Lua',icon:'🌙'},{text:'Estrela',icon:'⭐'},{text:'Planeta',icon:'🪐'},{text:'Foguete',icon:'🚀'}], answer:2, explanation:'Boa memória! O planeta apareceu na sequência.' },
    { type:'sequence', title:'Código das estrelas', prompt:'Qual número vem depois?', visual:'3　6　9　?', options:[{text:'10',icon:'🔟'},{text:'11',icon:'1️⃣'},{text:'12',icon:'1️⃣2️⃣'}], answer:2, explanation:'A sequência aumenta de 3 em 3: 3, 6, 9, 12.' },
    { type:'image', title:'Identifique o planeta', prompt:'Qual imagem representa o planeta Terra?', options:[{text:'Terra',icon:'🌍'},{text:'Estrela',icon:'⭐'},{text:'Cometa',icon:'☄️'},{text:'Lua',icon:'🌙'}], answer:0, explanation:'A Terra é o planeta onde vivemos.' },
    { type:'drag', title:'Ordene os números', prompt:'Coloque do menor para o maior.', dragItems:['12','4','8'], correctOrder:['4','8','12'], explanation:'Em ordem crescente: 4, 8 e 12.' }
  ],
  6: [
    { type:'logic', title:'O último padrão', prompt:'Qual símbolo completa a sequência?', visual:'🔺　🔵　🔺　🔵　?', options:[{text:'Triângulo',icon:'🔺'},{text:'Círculo',icon:'🔵'},{text:'Quadrado',icon:'🟩'}], answer:0, explanation:'Os símbolos alternam triângulo e círculo.' },
    { type:'math', title:'Desafio final de matemática', prompt:'Kiko coletou 6 cristais e encontrou mais 5. Quantos cristais tem agora?', visual:'6 + 5 = ?', options:[{text:'10',icon:'🔟'},{text:'11',icon:'1️⃣1️⃣'},{text:'12',icon:'1️⃣2️⃣'}], answer:1, explanation:'6 + 5 = 11 cristais!' },
    { type:'truefalse', title:'Conhecimento em ação', prompt:'Ler as instruções antes de começar pode ajudar a realizar uma tarefa.', options:[{text:'Verdadeiro',icon:'✅'},{text:'Falso',icon:'❌'}], answer:0, explanation:'As instruções ajudam a entender o que fazer.' },
    { type:'association', title:'Conecte as ideias', prompt:'Qual ferramenta é mais adequada para medir o comprimento de um lápis?', options:[{text:'Régua',icon:'📏'},{text:'Termômetro',icon:'🌡️'},{text:'Bússola',icon:'🧭'},{text:'Relógio',icon:'⏰'}], answer:0, explanation:'A régua é usada para medir comprimentos.' },
    { type:'drag', title:'Rumo ao portal!', prompt:'Organize as etapas da aventura.', dragItems:['Restaurar o portal','Coletar cristais','Resolver desafios'], correctOrder:['Coletar cristais','Resolver desafios','Restaurar o portal'], explanation:'Kiko coleta cristais, resolve desafios e restaura o portal!' }
  ]
};

const questionsBank = {
    1: [ // Floresta dos Doces - Cores e Formas
        { q: "Qual objeto é VERMELHO?", options: ["🍎", "🔵", "🍌"], answer: 0 },
        { q: "Qual objeto é um CÍRCULO?", options: ["⬛", "🔵", "🔺"], answer: 1 },
        { q: "Onde está o Doce?", options: ["🪨", "🌳", "🍬"], answer: 2 }
    ],
    2: [ // Cidade - Números e Associação
        { q: "Conte: 🚗🚗🚗. Quantos carros?", options: ["2", "3", "4"], answer: 1 },
        { q: "Qual combina com a 🌧️ (Chuva)?", options: ["⛱️ (Guarda-sol)", "🕶️ (Óculos)", "☂️ (Guarda-chuva)"], answer: 2 },
        { q: "Qual vem depois: 🔴 🔵 🔴 🔵 ?", options: ["🔴", "🔵", "🟡"], answer: 0 }
    ],
    3: [ // Praia - Comparação e Tamanhos
        { q: "Qual é o MAIOR animal?", options: ["🐜", "🐕", "🐘"], answer: 2 },
        { q: "Onde vive o 🐟 (Peixe)?", options: ["🌳", "🌊", "🏠"], answer: 1 },
        { q: "Qual está CHEIO?", options: ["🥛", "🥃 (Vazio)", "🍽️"], answer: 0 }
    ],
    4: [ // Montanha - Emoções e Lógica
        { q: "Qual carinha está FELIZ?", options: ["😢", "😡", "😊"], answer: 2 },
        { q: "O que usamos para CORTAR?", options: ["✂️", "🥄", "✏️"], answer: 0 },
        { q: "O que ilumina o dia?", options: ["🌙", "☀️", "☁️"], answer: 1 }
    ],
    5: [ // Espaço - Lógica e Sequência
        { q: "Encontre o intruso (diferente):", options: ["🍎", "🍌", "🚗"], answer: 2 },
        { q: "O que voa?", options: ["🛸", "🚗", "⛴️"], answer: 0 },
        { q: "Qual objeto é Frio?", options: ["🔥", "🧊", "☀️"], answer: 1 }
    ],
    6: [ // Estrela Final - Mistura
        { q: "Quantas patas tem um 🐕?", options: ["2", "4", "6"], answer: 1 },
        { q: "A cor do Céu em um dia ensolarado:", options: ["🟢", "🔵", "🔴"], answer: 1 },
        { q: "Qual animal faz 'Miau'?", options: ["🐶", "🐱", "🐭"], answer: 1 }
    ]
};

// Adicionar flag de uso
for(let world in questionsBank) {
    questionsBank[world].forEach(q => q.used = false);
}

function getRandomQuestion(worldId) {
    let pool = questionsBank[worldId];
    let available = pool.filter(q => !q.used);
    
    // Se usou todas, reseta
    if (available.length === 0) {
        pool.forEach(q => q.used = false);
        available = pool;
    }
    
    let q = available[Math.floor(Math.random() * available.length)];
    q.used = true;
    return q;
}
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('game-grid');
    const movesDisplay = document.getElementById('moves');
    const scoreDisplay = document.getElementById('score');
    const restartButton = document.getElementById('restart-button');
    const levelButtons = document.querySelectorAll('.level-button');
    const modal = document.getElementById('win-modal');
    const winMessage = document.getElementById('win-message');
    const playAgainButton = document.getElementById('play-again-button');

    // Card pool: Ensure you have enough unique emojis for the 'hard' level (32 pairs = 64 cards)
    const allEmojis = [
        '🍎', '🍊', '🍇', '🍉', '🍓', '🥝', '🍍', '🍌',
        '⭐', '🚀', '💡', '⏰', '🚲', '🚕', '🚁', '🛸',
        '☀️', '🌧️', '⚡', '❄️', '🔥', '🌊', '🌎', '🌙',
        '🍕', '🍔', '🍟', '🍩', '🍦', '☕', '🥛', '🍪',
        '🦄', '🦁', '🐸', '🐼', '🦊', '🐻', '🐥', '🐙'
    ];

    // Difficulty Settings: [Grid Size, Number of unique cards, Card CSS Size (in px)]
    const difficulties = {
        easy: { size: 4, unique: 8, cardPx: 80 },    // 4x4 grid = 16 cards (8 pairs)
        challenging: { size: 6, unique: 18, cardPx: 65 }, // 6x6 grid = 36 cards (18 pairs)
        hard: { size: 8, unique: 32, cardPx: 50 }    // 8x8 grid = 64 cards (32 pairs)
    };

    let currentLevel = 'easy'; 
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let score = 0;
    let matchedPairs = 0;
    let totalPairs = 0;

    // --- Helper Functions ---

    function shuffle(array) {
        // Standard Fisher-Yates (Knuth) Shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createCard(content) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.dataset.content = content;
        cardDiv.addEventListener('click', flipCard);

        cardDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${content}</div>
                <div class="card-back">?</div>
            </div>
        `;
        return cardDiv;
    }

    // --- Main Game Logic ---

    function startGame(level) {
        const settings = difficulties[level];
        const uniqueCount = settings.unique;
        totalPairs = uniqueCount;

        // 1. Prepare Card Array: Ensure there are enough emojis for the selected level
        if (uniqueCount > allEmojis.length) {
            console.error(`Not enough unique emojis for the ${level} level!`);
            return;
        }
        
        let gameCards = allEmojis.slice(0, uniqueCount);
        gameCards = [...gameCards, ...gameCards]; 
        const shuffledCards = shuffle(gameCards);

        // 2. Reset state
        grid.innerHTML = '';
        firstCard = secondCard = null;
        lockBoard = false;
        moves = 0;
        score = 0;
        matchedPairs = 0;

        // 3. Update UI and Grid Size
        movesDisplay.textContent = `Moves: ${moves}`;
        scoreDisplay.textContent = `Score: ${score}`;
        
        // Set CSS variables for dynamic grid layout
        grid.style.gridTemplateColumns = `repeat(${settings.size}, 1fr)`;
        grid.style.setProperty('--card-size', `${settings.cardPx}px`);

        // 4. Generate and place cards
        shuffledCards.forEach(content => {
            const cardElement = createCard(content);
            grid.appendChild(cardElement);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return; 
        if (this.classList.contains('match')) return;

        this.classList.add('flip');

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        movesDisplay.textContent = `Moves: ${moves}`;
        
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.content === secondCard.dataset.content;

        if (isMatch) {
            handleMatch();
        } else {
            handleMismatch();
        }
    }

    function handleMatch() {
        firstCard.classList.add('match');
        secondCard.classList.add('match');
        
        // Remove listeners to disable further clicking
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        score += 10; // Award 10 points for a correct match
        scoreDisplay.textContent = `Score: ${score}`;

        resetBoard();
        
        matchedPairs++;
        if (matchedPairs === totalPairs) {
            showWinModal();
        }
    }

    function handleMismatch() {
        lockBoard = true; // Lock the board during animation
        score = Math.max(0, score - 2); // Penalty for an incorrect move
        scoreDisplay.textContent = `Score: ${score}`;

        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1200); 
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }
    
    // --- UI/Event Handlers ---

    function handleLevelChange(event) {
        const newLevel = event.target.dataset.level;
        if (newLevel && newLevel !== currentLevel) {
            // Update active button visual
            levelButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            currentLevel = newLevel;
            startGame(currentLevel);
        }
    }

    function showWinModal() {
        // Display the correct level name
        const levelName = currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1);
        winMessage.innerHTML = `You solved the **${levelName}** level in **${moves} moves** and achieved a score of **${score}**!`;
        modal.classList.add('visible');
    }

    // --- Initialization ---

    // Add event listeners for controls
    restartButton.addEventListener('click', () => startGame(currentLevel));
    playAgainButton.addEventListener('click', () => {
        modal.classList.remove('visible');
        startGame(currentLevel);
    });
    levelButtons.forEach(button => {
        button.addEventListener('click', handleLevelChange);
    });

    // Start the game on the default (easy) level
    startGame(currentLevel);
});
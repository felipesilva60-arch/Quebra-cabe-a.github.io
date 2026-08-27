const puzzle = document.getElementById("puzzle");
const upload = document.getElementById("upload");
const difficulty = document.getElementById("difficulty");
const preview = document.getElementById("preview");
const timerElement = document.getElementById("timer");
const movesElement = document.getElementById("moves");
const recordElement = document.getElementById("recordPuzzle");

let pieces = [];
let selected = null;
let imageURL = "";

let size = 3;

let moves = 0;
let timer = 0;
let interval = null;

let gameStarted = false;
let gameFinished = false;


// ==========================================
// RECORDE
// ==========================================

let record = localStorage.getItem("recordPuzzle");

if (record === null) {
    record = Infinity;
} else {
    record = Number(record);
}

updateRecord();

function updateRecord() {

    if (!recordElement) return;

    if (record === Infinity) {
        recordElement.textContent = "--";
    } else {
        recordElement.textContent = record + "s";
    }
}


// ==========================================
// ESCOLHER FOTO
// ==========================================

upload.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        imageURL = e.target.result;

        preview.src = imageURL;
        preview.style.display = "block";

        createPuzzle();
    };

    reader.readAsDataURL(file);
});


// ==========================================
// ALTERAR DIFICULDADE
// ==========================================

difficulty.addEventListener("change", function () {

    size = parseInt(difficulty.value);

    if (imageURL) {
        createPuzzle();
    }
});


// ==========================================
// CRONÔMETRO
// ==========================================

function startTimer() {

    clearInterval(interval);

    timer = 0;

    timerElement.textContent = "0";

    interval = setInterval(function () {

        if (!gameFinished) {

            timer++;

            timerElement.textContent = timer;
        }

    }, 1000);
}


// ==========================================
// CRIAR PUZZLE
// ==========================================

function createPuzzle() {

    clearInterval(interval);

    moves = 0;

    movesElement.textContent = "0";

    selected = null;

    gameFinished = false;

    gameStarted = true;

    pieces = [];

    puzzle.innerHTML = "";

    const boardSize =
        Math.min(600, window.innerWidth - 80);

    puzzle.style.width =
        boardSize + "px";

    puzzle.style.height =
        boardSize + "px";

    puzzle.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;

    const pieceSize =
        boardSize / size;


    // ======================================
    // CRIAR AS PEÇAS
    // ======================================

    for (
        let i = 0;
        i < size * size;
        i++
    ) {

        const piece =
            document.createElement("div");

        piece.classList.add("piece");

        piece.style.width =
            pieceSize + "px";

        piece.style.height =
            pieceSize + "px";

        piece.style.backgroundImage =
            `url("${imageURL}")`;

        piece.style.backgroundSize =
            `${boardSize}px ${boardSize}px`;


        const x =
            -(i % size) * pieceSize;

        const y =
            -Math.floor(i / size) * pieceSize;


        const position =
            `${x}px ${y}px`;


        piece.style.backgroundPosition =
            position;

        piece.dataset.correct =
            position;


        piece.addEventListener(
            "click",
            function () {
                selectPiece(piece);
            }
        );


        pieces.push(piece);
    }


    // Coloca as peças no tabuleiro
    pieces.forEach(function (piece) {

        puzzle.appendChild(piece);

    });


    // Embaralha
    shufflePieces(false);

    startTimer();
}


// ==========================================
// EMBARALHAR
// ==========================================

function shufflePieces(resetGame = true) {

    // Não faz nada se ainda não houver foto
    if (!imageURL || pieces.length === 0) {

        if (resetGame) {
            alert("📷 Escolha uma foto primeiro!");
        }

        return;
    }


    clearInterval(interval);

    selected = null;

    pieces.forEach(function (piece) {

        piece.classList.remove("selected");

    });


    const positions =
        pieces.map(function (piece) {

            return piece.style.backgroundPosition;

        });


    // Fisher-Yates
    for (
        let i = positions.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));


        [
            positions[i],
            positions[j]
        ] = [
            positions[j],
            positions[i]
        ];
    }


    // Evita começar já resolvido
    let alreadySolved = positions.every(
        function (position, index) {

            return position ===
                pieces[index].dataset.correct;

        }
    );


    if (alreadySolved && positions.length > 1) {

        [
            positions[0],
            positions[1]
        ] = [
            positions[1],
            positions[0]
        ];
    }


    pieces.forEach(function (piece, index) {

        piece.style.backgroundPosition =
            positions[index];

    });


    if (resetGame) {

        moves = 0;

        movesElement.textContent = "0";

        gameFinished = false;

        startTimer();
    }
}


// ==========================================
// SELECIONAR PEÇA
// ==========================================

function selectPiece(piece) {

    if (gameFinished) return;


    // Primeira peça
    if (!selected) {

        selected = piece;

        piece.classList.add("selected");

        return;
    }


    // Clicou na mesma peça
    if (selected === piece) {

        piece.classList.remove("selected");

        selected = null;

        return;
    }


    // Trocar peças
    swap(selected, piece);


    selected.classList.remove("selected");

    selected = null;


    moves++;

    movesElement.textContent =
        moves;


    checkWin();
}


// ==========================================
// TROCAR PEÇAS
// ==========================================

function swap(a, b) {

    const temp =
        a.style.backgroundPosition;


    a.style.backgroundPosition =
        b.style.backgroundPosition;


    b.style.backgroundPosition =
        temp;
}


// ==========================================
// VERIFICAR VITÓRIA
// ==========================================

function checkWin() {

    const won =
        pieces.every(function (piece) {

            return piece.style.backgroundPosition ===
                piece.dataset.correct;

        });


    if (won) {

        gameFinished = true;

        clearInterval(interval);

        setTimeout(function () {

            showVictory();

        }, 400);
    }
}


// ==========================================
// RESOLVER
// ==========================================

function solvePuzzle() {

    // Impede resolver sem foto
    if (!imageURL || pieces.length === 0) {

        alert("📷 Escolha uma foto primeiro!");

        return;
    }


    if (gameFinished) return;


    clearInterval(interval);

    selected = null;


    pieces.forEach(function (piece) {

        piece.classList.remove("selected");

        piece.style.backgroundPosition =
            piece.dataset.correct;

    });


    gameFinished = true;


    setTimeout(function () {

        showVictory();

    }, 500);
}


// ==========================================
// TELA DE VITÓRIA
// ==========================================

function showVictory() {

    // Evita criar duas telas
    if (document.querySelector(".win-screen")) {
        return;
    }


    let mensagem = "";


    // Novo recorde
    if (timer < record) {

        record = timer;


        localStorage.setItem(
            "recordPuzzle",
            record
        );


        updateRecord();


        mensagem = `
            <h2 style="color:#22c55e;">
                🏆 NOVO RECORDE!
            </h2>
        `;
    }


    const screen =
        document.createElement("div");


    screen.classList.add("win-screen");


    screen.innerHTML = `
        <div class="win-box">

            <h1>🏆 PARABÉNS!</h1>

            ${mensagem}

            <p>
                ⏱ Tempo:
                <b>${timer}s</b>
            </p>

            <p>
                🏆 Recorde:
                <b>
                    ${
                        record === Infinity
                            ? "--"
                            : record + "s"
                    }
                </b>
            </p>

            <p>
                🎯 Movimentos:
                <b>${moves}</b>
            </p>

            <button onclick="location.reload()">
                🔄 Jogar Novamente
            </button>

        </div>
    `;


    document.body.appendChild(screen);
}


// ==========================================
// DEIXAR FUNÇÕES DISPONÍVEIS PARA O HTML
// ==========================================

window.shufflePieces = shufflePieces;
window.solvePuzzle = solvePuzzle;

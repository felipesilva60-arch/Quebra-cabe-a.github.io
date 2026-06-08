const puzzle = document.getElementById('puzzle');
const upload = document.getElementById('upload');
const difficulty = document.getElementById('difficulty');
const preview = document.getElementById('preview');
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');


let pieces = [];
let selected = null;
let imageURL = '';
let size = 3;
let moves = 0;
let timer = 0;
let interval;


upload.addEventListener('change', e => {


  const file = e.target.files[0];


  if(!file) return;


  const reader = new FileReader();


  reader.onload = event => {


    imageURL = event.target.result;


    preview.src = imageURL;


    createPuzzle();
  }


  reader.readAsDataURL(file);
});


difficulty.addEventListener('change', () => {


  size = parseInt(difficulty.value);


  if(imageURL){
    createPuzzle();
  }
});


function startTimer(){


  clearInterval(interval);


  timer = 0;


  interval = setInterval(() => {


    timer++;


    timerElement.textContent = timer;


  },1000);
}


function createPuzzle(){


  startTimer();


  moves = 0;


  movesElement.textContent = moves;


  pieces = [];


  puzzle.innerHTML = '';


  const boardSize = window.innerWidth < 700 ? 320 : 600;


  puzzle.style.width = boardSize + 'px';
  puzzle.style.height = boardSize + 'px';


  puzzle.style.gridTemplateColumns = `repeat(${size},1fr)`;


  const pieceSize = boardSize / size;


  for(let i=0;i<size*size;i++){


    const piece = document.createElement('div');


    piece.classList.add('piece');


    piece.style.width = pieceSize + 'px';
    piece.style.height = pieceSize + 'px';


    piece.style.backgroundImage = `url(${imageURL})`;


    piece.style.backgroundSize = `${boardSize}px ${boardSize}px`;


    const x = -(i % size) * pieceSize;
    const y = -Math.floor(i / size) * pieceSize;


    piece.style.backgroundPosition = `${x}px ${y}px`;


    piece.dataset.correct = `${x}px ${y}px`;


    piece.addEventListener('click', () => selectPiece(piece));


    pieces.push(piece);
  }


  shufflePieces();
}


function shufflePieces(){


  const positions = [];


  pieces.forEach(piece => {
    positions.push(piece.style.backgroundPosition);
  });


  do{


    positions.sort(() => Math.random() - 0.5);


  }while(
    positions.every((pos,index) => {
      return pos === pieces[index].dataset.correct;
    })
  );


  pieces.forEach((piece,index) => {


    piece.style.backgroundPosition = positions[index];


  });


  puzzle.innerHTML = '';


  pieces.forEach(piece => {


    puzzle.appendChild(piece);


  });
}


function selectPiece(piece){


  if(!selected){


    selected = piece;


    piece.classList.add('selected');


    return;
  }


  swap(selected,piece);


  selected.classList.remove('selected');


  selected = null;


  moves++;


  movesElement.textContent = moves;


  checkWin();
}


function swap(p1,p2){


  const temp = p1.style.backgroundPosition;


  p1.style.backgroundPosition = p2.style.backgroundPosition;


  p2.style.backgroundPosition = temp;
}


function solvePuzzle(){


  let index = 0;


  const autoSolve = setInterval(() => {


    if(index >= pieces.length){


      clearInterval(autoSolve);


      setTimeout(() => {


        showVictory();


      },2000);


      return;
    }


    pieces[index].style.backgroundPosition =
      pieces[index].dataset.correct;


    index++;


  },150);
}


function checkWin(){


  const won = pieces.every(piece => {


    return piece.style.backgroundPosition === piece.dataset.correct;


  });


  if(won){


    clearInterval(interval);


    setTimeout(() => {


      showVictory();


    },1000);
  }
}
function showVictory(){


  const screen = document.createElement('div');


  screen.classList.add('win-screen');


  screen.innerHTML = `
 
    <div class="win-box">


      <h1>🏆 PARABÉNS!</h1>


      <p>⏱ Tempo: ${timer}s</p>


      <p>🎯 Movimentos: ${moves}</p>


      <button onclick="location.reload()">
        Jogar Novamente
      </button>


    </div>
 
  `;


  document.body.appendChild(screen);
}

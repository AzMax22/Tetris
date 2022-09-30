import {Board} from "./board.js";
import {Piece} from "./piece.js"
import {KEY, START_LEVEL_SPEED} from "./constants.js";

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const canvasNext = document.getElementById('next_fig');
const ctx_next = canvasNext.getContext('2d');

const time = { start: 0, elapsed: 0, level: START_LEVEL_SPEED };

let accountValues = {
    score: 0,
    level: 0
}


let game = false;


// Проксирование доступа к свойствам accountValues
let account = new Proxy(accountValues, {
    set: (target, key, value) => {
        target[key] = value;
        updateAccount(key, value);
        return true;
    }

});

let board = new Board(ctx,ctx_next ,account, time);


function resetGame() {
    account.score = 0;
    account.level = 1;
    board.reset();
}

function play() {
    game = true
    resetGame();

    animate();
}

window.play = play;


function gameOver(requestId, ctx) {
    cancelAnimationFrame(requestId);

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.75;
    ctx.fillRect(0, 3, 12, 3);


    ctx.globalAlpha = 1;
    ctx.font = '2px monospace';
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER!', 0.8, 5);
}


function animate(now = 0) {
    // обновить истекшее время
    time.elapsed = now - time.start;

    // если время отображения текущего фрейма прошло
    if (time.elapsed > time.level) {

        console.log(time.level);

        // начать отсчет сначала
        time.start = now;

        // "опустить" активную фигурку
        if (!board.drop_piece()) {
            gameOver(requestAnimationFrame(animate), board.ctx);
            addScore(localStorage.getItem('username'), document.getElementById('score').textContent);
            game = false
            return;
        }
    }

    // отрисовать игровое поле
    board.redraw();

    requestAnimationFrame(animate);
}


//соответствие между кнопкой и действием
const moves = {
    [KEY.UP]: (p) => board.rotate(p),
    [KEY.LEFT]:  p => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]:    p => ({ ...p, y: p.y + 1 })
};


document.addEventListener('keydown', event => {
    if (moves[event.keyCode]) {
        // отмена действий по умолчанию
        event.preventDefault();

        if (game=== false) return;

        // получение новых координат фигурки
        let p = moves[event.keyCode](board.piece);

        // проверка нового положения
        if (board.valid(p)) {
            // реальное перемещение фигурки, если новое положение допустимо
            board.piece.move(p);
            board.redraw();
        }
    }
});


function updateAccount(key, value) {
    let element = document.getElementById(key);
    if (element) {
        element.textContent = value;
    }
}


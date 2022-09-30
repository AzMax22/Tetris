import {N_COLS, N_ROWS, SIZE_BLOCK, COLORS, POINTS, next_level_border_score, SPEED_INCREASE, } from "./constants.js"
import {Piece} from "./piece.js";

export class Board {
    constructor(ctx, ctx_next ,account, time) {
        this.ctx = ctx;
        this.ctx_next = ctx_next;
        this.account = account;
        this.time = time;
        this.piece = null; //активная фигурка
        this.init();
        this.border_level = next_level_border_score(1);
    }

    init() {
        // Устанавливаем размеры холста
        this.ctx.canvas.width = N_COLS * SIZE_BLOCK;
        this.ctx.canvas.height = N_ROWS * SIZE_BLOCK;

        this.ctx_next.canvas.width = 6 * SIZE_BLOCK;
        this.ctx_next.canvas.height = 4 * SIZE_BLOCK;

        // Устанавливаем масштаб
        this.ctx.scale(SIZE_BLOCK, SIZE_BLOCK);
        this.ctx_next.scale(SIZE_BLOCK, SIZE_BLOCK);

        // толщина контура
        this.ctx.lineWidth = 0.07;
        this.ctx_next.lineWidth = 0.07;

    }

    redraw(){
        // стирание старого отображения фигуры на холсте
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.piece.draw();
        this.drawBoard();
    }

    drawBoard() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value-1];
                    this.ctx.fillRect(x, y, 1, 1);
                    this.ctx.strokeRect( x,y, 1, 1);
                }
            });
        });
    }



    // Сбрасывает игровое поле перед началом новой игры
    reset() {
        this.grid = this.getEmptyBoard();
        this.piece = new Piece(this.ctx);
        this.piece.draw();
        this.getNewPiece();
    }

    getNewPiece() {
        this.next = new Piece(this.ctx_next);
        this.next.setPositionNext();

        this.ctx_next.clearRect(
            0,
            0,
            this.ctx_next.canvas.width,
            this.ctx_next.canvas.height
        );
        this.next.draw();
    }

    // Создает матрицу нужного размера, заполненную нулями
    getEmptyBoard() {
        return Array.from(
            {length: N_ROWS}, () => Array(N_COLS).fill(0)
        );
    }

    X_in_board(x) {
        return x >= 0 && x < N_COLS;
    }

    Y_in_board(y) {
        return y <= N_ROWS;
    }

    // не занята ли клетка поля другими фигурками
    notOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] === 0;
    }

    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;
                return value === 0 ||
                    (this.X_in_board(x) && this.Y_in_board(y) && this.notOccupied(x, y));
            });
        });
    }

    rotate(p){
        // Клонирование матрицы
        let new_p = JSON.parse(JSON.stringify(p));

        // Транспонирование матрицы тетрамино
        for (let y = 0; y < new_p.shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [new_p.shape[x][y], new_p.shape[y][x]] =
                    [new_p.shape[y][x], new_p.shape[x][y]];
            }
        }

        // Изменение порядка колонок
        new_p.shape.forEach(row => row.reverse());

        return new_p;
    }

    freeze() {
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
                }
            });
        });
    }

    clearLines() {
        let lines = 0;

        this.grid.forEach((row, y) => {
            // Если все клетки в ряду заполнены
            if (row.every(value => value > 0)) {
                lines++;

                // Удалить этот ряд
                this.grid.splice(y, 1);

                // Добавить наверх поля новый пустой ряд клеток
                this.grid.unshift(Array(N_COLS).fill(0));
            }
        });

        if (lines > 0) {
            // Добавить очки за собранные линии
            this.account.score += this.getLineClearPoints(lines, this.account.level);
        }

        if (this.account.score >= this.border_level){
            this.account.level ++;
            this.border_level = next_level_border_score(this.account.level);

            this.time.level = this.time.level * SPEED_INCREASE;
        }

    }

    getLineClearPoints(lines, level) {
        let points = lines === 1 ? POINTS.SINGLE :
                     lines === 2 ? POINTS.DOUBLE :
                     lines === 3 ? POINTS.TRIPLE :
                     lines === 4 ? POINTS.TETRIS :
                     0;
        return points * level;
    }


    drop_piece() {
        let p = this.piece
        let new_p = {...p, y: p.y + 1};

        if (this.valid(new_p)) {
            this.piece.move(new_p);
        } else {
            if (this.piece.y === 0) {
                // Game over
                return false;
            }

            this.freeze();
            this.clearLines();


            this.piece = this.next;
            this.piece.ctx = this.ctx;
            this.piece.setStartPosition();
            this.getNewPiece();
        }

        return true;
    }
}
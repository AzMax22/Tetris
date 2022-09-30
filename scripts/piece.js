import {COLORS, SHAPES} from "./constants.js";

export class Piece {
    constructor(ctx) {
        this.ctx = ctx;
        this.spawn();
        this.setStartPosition()
    }

    spawn() {
        this.typeId = this.randomize_Tetromino_Type(COLORS.length - 1);
        this.shape = SHAPES[this.typeId];
        this.color = COLORS[this.typeId];
    }


    // расположить фигурку в центре поля
    setStartPosition() {
        this.x = this.typeId === 3 ? 5 : 4;
        this.y = -1
    }

    setPositionNext(){
        switch (true) {
            case this.typeId === 0:
                this.x = 1;
                this.y = 1.5;
                break;

            case this.typeId === 3:
                this.x = 2;
                this.y = 1;
                break;

            default:
                this.x = 1.5;
                this.y = 1;
        }
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                // this.x, this.y - левый верхний угол фигурки на игровом поле
                // x, y - координаты ячейки относительно матрицы фигурки (3х3)
                // this.x + x - координаты ячейки на игровом поле
                if (value > 0) {
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
                    this.ctx.strokeRect(this.x + x, this.y + y, 1, 1);
                }
            });
        });
    }

    move(p) {
        this.x = p.x;
        this.y = p.y;

        this.shape = p.shape;
    }

    randomize_Tetromino_Type(range) {
        return Math.floor(Math.random() * range);
    }
}



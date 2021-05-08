import {colors, game} from './main'

export class Tile {
    x: number;
    y: number;
    lastDrawX: number;
    lastDrawY: number;
    colors: number[];
    dragged: boolean;
    constructor(x: number, y: number, colors: number[]) {
        this.x = x;
        this.y = y;
        this.colors = colors;
        this.dragged = false;
    }

    draw(ctx: CanvasRenderingContext2D, mouse: number[]) {
        const width = game.width;
        const height = game.height;
        const hw = width/2;
        const hh = height/2;
        let x = this.x * width;
        let y = this.y * height;
        if (this.dragged && mouse != undefined && mouse != null) {
            x = mouse[0];
            y = mouse[1];
        }
        for (const key in this.colors) {
            if (Object.prototype.hasOwnProperty.call(this.colors, key)) {
                const color = this.colors[key];
                ctx.fillStyle = colors[color][0]
                ctx.strokeStyle = colors[color][1]

                ctx.beginPath();
                ctx.moveTo(x + hw, y + hh)

                if (key == "0") {
                    ctx.lineTo(x, y + height)
                    ctx.lineTo(x, y)
                } else if (key == "1") {
                    ctx.lineTo(x, y + height)
                    ctx.lineTo(x + width, y + height)
                } else if (key == "2") {
                    ctx.lineTo(x + width, y + height)
                    ctx.lineTo(x + width, y)
                } else if (key == "3") {
                    ctx.lineTo(x + width, y)
                    ctx.lineTo(x, y)
                }

                ctx.lineTo(x + hw, y + hh)
                ctx.fill();
                ctx.stroke();
            }
        }
        this.lastDrawX = x;
        this.lastDrawY = y;
    }
}
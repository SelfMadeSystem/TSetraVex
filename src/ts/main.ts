import { Tile } from './tile'
import { Game } from './game'
import { Grid } from './grid'
import { f2i } from './utils'

const canvas: HTMLCanvasElement = document.getElementById("main-canvas") as HTMLCanvasElement

const ctx = canvas.getContext("2d");

// ID   Fill       Stroke
export const colors = {
    0: ["#000000", "#FFFFFFFF"],
    1: ["#AA0000", "#000000FF"],
    2: ["#00AA00", "#000000FF"],
    3: ["#0000FF", "#000000FF"],
    4: ["#00AAAA", "#000000FF"],
    5: ["#AA00AA", "#000000FF"],
    6: ["#AAAA00", "#000000FF"],
    7: ["#CCCCCC", "#000000FF"],
}

export const grid = new Grid();
export const game = new Game();

var mouse: number[] = undefined;
var mouseOffset: number[] = undefined;

// grid.grid = [
//     [new Tile(0, 0, [3, 0, 2, 1]),
//     new Tile(1, 0, [3, 1, 0, 2])],
//     [new Tile(0, 1, [1, 2, 3, 0]),
//     new Tile(1, 1, [1, 0, 3, 2])]]
// grid.resetAll();
// grid.sizeX = 2;
// grid.sizeY = 2;
grid.generateGrid(3, 3, 8)

function draw() {
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    grid.draw(ctx, mouse)
}

function mouseDown(event: MouseEvent) {
    if (event.buttons & 1) {
        const x = f2i(event.offsetX / game.width), y = f2i(event.offsetY / game.height);
        const tile = grid.getTile(x, y);
        if (tile != undefined) tile.dragged = true;
        grid.selected = tile;
        mouseOffset = [event.offsetX % game.width, event.offsetY % game.height];
        mouse = [event.offsetX - mouseOffset[0], event.offsetY - mouseOffset[1]];
    }
}

function mouseMove(event: MouseEvent) {
    if (mouse != undefined) {
        if ((event.buttons & 1) == 0) {
            mouse = undefined;
            grid.selected = undefined;
            grid.resetAll();
            return;
        }
        mouse = [event.offsetX - mouseOffset[0], event.offsetY - mouseOffset[1]];
    }
}

function mouseUp(event: MouseEvent) {
    mouse = undefined;
    grid.setSelected();
    grid.selected = undefined;
    grid.resetAll();
}

canvas.addEventListener("mousedown", mouseDown)
canvas.addEventListener("mousemove", mouseMove)
canvas.addEventListener("mouseup", mouseUp)

$("#up").on("click", e => {
    grid.moveMainGrid(0, 1)
})
$("#down").on("click", e => {
    grid.moveMainGrid(0, -1)
})
$("#left").on("click", e => {
    grid.moveMainGrid(1, 0)
})
$("#right").on("click", e => {
    grid.moveMainGrid(-1, 0)
})
$('#new-game').on("click", e => {
    let w = $('#width').val() as number;
    let h = $('#height').val() as number;
    grid.generateGrid(w, h, 8)
    ctx.canvas.width = f2i(w * 3) * game.width
    ctx.canvas.height = f2i(h * 1.75) * game.height
})
$("#solve-game").on("click", e => {
    grid.solve();
})
$("#rescramble").on("click", e => {
    grid.rescramble();
})

setInterval(draw, 50)

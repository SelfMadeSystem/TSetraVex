import { Tile } from './tile'
import { f2i } from './utils'
import { game } from './main'

export class Grid {
    grid: Tile[][];
    selected: Tile;
    sizeX: number;
    sizeY: number;
    startColors: number[][];
    constructor() {
        this.grid = []
    }

    getTile(x: number, y: number): Tile {
        let gg = this.grid[x]
        if (gg == undefined || gg == null) return undefined;
        return gg[y]
    }

    isValid(x: number, y: number, tile: Tile): Boolean { // Todo: Improve because you can swap and have bad no no
        if (this.getTile(x, y) == tile) return true;

        if (x >= this.sizeX || y >= this.sizeY) return true;
        for (let i = 0; i <= 3; i++) {
            switch (i) {
                case 0: {
                    if (x + 1 >= this.sizeX) continue;
                    const t = this.getTile(x + 1, y);
                    if (t != undefined && t != tile && t.colors[0] != tile.colors[2]) {
                        return false
                    }
                }
                    break;
                case 1: {
                    if (y + 1 >= this.sizeY) continue;
                    const t = this.getTile(x, y + 1);
                    if (t != undefined && t != tile && t.colors[3] != tile.colors[1]) {
                        return false
                    }
                }
                    break;
                case 2: {
                    const t = this.getTile(x - 1, y);
                    if (t != undefined && t != tile && t.colors[2] != tile.colors[0]) {
                        return false
                    }
                }
                    break;
                case 3: {
                    const t = this.getTile(x, y - 1);
                    if (t != undefined && t != tile && t.colors[1] != tile.colors[3]) {
                        return false
                    }
                }
                    break;
            }
        }

        return true;
    }

    resetAll() {
        for (let x = 0; x < this.grid.length; x++) {
            const column = this.grid[x];
            if (column != undefined && column != null) {
                for (let y = 0; y < column.length; y++) {
                    const tile = column[y];
                    if (tile != undefined && tile != null) {
                        tile.x = x;
                        tile.y = y;
                        tile.dragged = false;
                    }
                }
            }
        }
    }

    setSelected() {
        if (this.selected != undefined && this.selected != null) {
            let x = f2i(this.selected.lastDrawX / game.width + 0.5)
            let y = f2i(this.selected.lastDrawY / game.height + 0.5)
            const prevX = this.selected.x;
            const prevY = this.selected.y;
            if (this.isValid(x, y, this.selected)) {
                let tile = this.getTile(x, y);
                this.setTile(x, y, this.selected);
                this.setTile(prevX, prevY, tile);
                this.selected.x = x;
                this.selected.y = y;
            }
        }
    }

    setTile(x: number, y: number, tile: Tile) {
        let column = this.grid[x];
        if (column == undefined) column = this.grid[x] = [];
        column[y] = tile;
    }

    generateGrid(width: number, height: number, colors: number) {
        this.grid = [];
        this.sizeX = width;
        this.sizeY = height;
        this.startColors = newColorGrid(width, height, colors);
        this.rescramble();
    }

    moveMainGrid(x: number, y: number) {
        if (x < 0) {
            for (let i = -x; i > 0; i--) this.grid.unshift([]);
        } else if (x > 0) {
            if (this.grid[0] == undefined || !this.grid[0].some(t => t != undefined))
                for (let i = x; i > 0; i--) this.grid.shift();
        }
        if (y > 0) {
            let can = true;
            for (let i = 0; i < this.sizeX; i++) {
                let got = this.getTile(i, 0)
                if (got != undefined) { can = false; break; }
            }
            if (can) {
                for (let i = 0; i < this.sizeX; i++) {
                    let row = this.grid[i];
                    if (row != undefined) {
                        for (let j = 1; j <= this.sizeY; j++) {
                            row[j - 1] = row[j];
                        }
                    }
                }
            }
        } else if (y < 0) {
            let can = true;
            for (let i = 0; i < this.sizeX; i++) {
                let got = this.getTile(i, this.sizeY - 1)
                if (got != undefined) { can = false; break; }
            }
            if (can) {
                for (let i = 0; i < this.sizeX; i++) {
                    let row = this.grid[i];
                    if (row != undefined) {
                        for (let j = this.sizeY; j >= 0; j--) {
                            row[j] = row[j - 1];
                        }
                    }
                }
            }
        }
        this.resetAll();
    }

    solve() {
        this.grid = tileGridFromColorGrid(this.sizeX, this.sizeY, this.startColors);
    }

    rescramble() {
        this.solve();
        
        scramble(this.grid)
        for (let i = this.sizeX; i > 0; i--) this.grid.unshift([])
        this.resetAll();
    }

    draw(ctx: CanvasRenderingContext2D, mouse: number[]) {
        this.grid.forEach(c => c.forEach(tile => {
            if (tile != undefined && tile != null && tile != this.selected) {
                tile.draw(ctx, mouse);
            }
        }))
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeRect(0, 0, this.sizeX * game.width, this.sizeY * game.height);
        if (this.selected != undefined && this.selected != null) this.selected.draw(ctx, mouse);
    }
}

function newColorGrid(width: number, height: number, maxColor: number): number[][] {
    let result = [];
    for (let i = 0; i < height * 2 + 1; i++) {
        result[i] = [];
        for (let x = 0; x < width + (i % 2); x++) {
            result[i][x] = f2i(Math.random() * maxColor)
        }
    }
    return result;
}

function tileGridFromColorGrid(width: number, height: number, cg: number[][]): Tile[][] {
    let result = new Array(width);
    for (let x = 0; x < width; x++) {
        const clm = result[x] = new Array(height);
        for (let y = 0; y < height; y++) {
            clm[y] = new Tile(x, y, [cg[y * 2 + 1][x], cg[y * 2 + 2][x], cg[y * 2 + 1][x + 1], cg[y * 2][x]]);
        }
    }
    return result;
}

function scramble(a: Array<any>[]) {
    for (let i = a.length - 1; i >= 0; i--) {
        for (let j = a[i].length - 1; j >= 0; j--) {
            let m = f2i(Math.random() * (i + 1));
            let n = f2i(Math.random() * (j + 1));

            let temp = a[i][j];
            a[i][j] = a[m][n];
            a[m][n] = temp;
        }
    }
}

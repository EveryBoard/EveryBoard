import {Coord} from './Coord';
import { Player } from './Player';

export abstract class GamePartSlice {

    public toString(): String {
        return "(t:"+this.turn+") = " + JSON.stringify(this.board);
    }
    public readonly board: ReadonlyArray<ReadonlyArray<number>>;

    public readonly turn: number;

    // contructor ;

    constructor(board: number[][], turn: number) {
        if (board == null) throw new Error("board cannot be null");
        if (turn == null) throw new Error("turn cannot be null");
        this.board = board;
        this.turn = turn;
    }
    // Statics:

    public static setAllValueTo(board: number[][], value: number) {
        let y = board.length - 1;
        while (y >= 0) {
            let x = board[y].length - 1;
            while (x >= 0) {
                board[y][x] = value;
                x--;
            }
            y--;
        }
    }
    public static createBiArray(width: number, height: number, initValue: number): number[][] {
        const retour: Array<Array<number>> = new Array<Array<number>>();
        let y = height - 1;
        while (y >= 0) {
            retour[y] = new Array<number>();
            let x = width - 1;
            while (x >= 0) {
                retour[y][x] = initValue;
                x--;
            }
            y--;
        }
        return retour;
    }
    public static copyBiArray(biArray: ReadonlyArray<ReadonlyArray<number>>): number[][] {
        const retour: Array<Array<number>> = new Array<Array<number>>();
        let y = 0;
        while (y < biArray.length) {
            retour[y] = GamePartSlice.copyArray(biArray[y]);
            y++;
        }
        return retour;
    }
    public static copyArray(array: ReadonlyArray<number>): number[] {
        const retour: Array<number> = new Array<number>();
        let x = 0;
        while (x < array.length) {
            retour[x] = array[x];
            x++;
        }
        return retour;
    }
    public static copyCoordArray(array: Coord[]): Coord[] {
        const retour: Array<Coord> = new Array<Coord>();
        let x = 0;
        while (x < array.length) {
            retour[x] = array[x];
            x++;
        }
        return retour;
    }
    // Getters

    public getBoardByXY(x: number, y: number): number {
        return this.board[y][x];
    }
    public getBoardAt(c: Coord): number {
        return this.board[c.y][c.x];
    }
    // Methods:

    public getCopiedBoard(): number[][] {
        return GamePartSlice.copyBiArray(this.board);
    }
    public getCurrentPlayer(): Player {
        return this.turn % 2 === 0 ? Player.ZERO : Player.ONE;
    }
    public getCurrentEnnemy(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
}
import {Coord} from './coord/Coord';
import {Player} from './Player';
import {ArrayUtils} from '../collectionlib/arrayutils/ArrayUtils';

export abstract class GamePartSlice {
    public readonly board: ReadonlyArray<ReadonlyArray<number>>;

    public readonly turn: number;

    // contructor ;

    constructor(board: number[][], turn: number) {
        if (board == null) throw new Error('board cannot be null');
        if (turn == null) throw new Error('turn cannot be null');
        this.board = board;
        this.turn = turn;
    }
    // Statics:

    public static copyCoordArray(array: Coord[]): Coord[] { //  TODO: Check that one immutability  && REMOVE FOR copyImmutableArray
        const retour: Array<Coord> = [];
        let x = 0;
        while (x < array.length) {
            retour[x] = array[x];
            x++;
        }
        return retour;
    }
    // Getters

    public getBoardByXY(x: number, y: number): number {
        if (y >= 0 && y < this.board.length && x >= 0 && x < this.board[y].length) {
            return this.board[y][x];
        } else {
            throw new Error('invalid board access');
        }
    }
    public getBoardAt(c: Coord): number {
        return this.getBoardByXY(c.x, c.y);
    }
    // Methods:

    public getCopiedBoard(): number[][] {
        return ArrayUtils.copyBiArray(this.board);
    }
    public getCurrentPlayer(): Player {
        return this.turn % 2 === 0 ? Player.ZERO : Player.ONE;
    }
    public getCurrentEnnemy(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
    public toString(): String {
        return '(t:'+this.turn+') = ' + JSON.stringify(this.board);
    }
}

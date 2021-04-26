import { Coord } from 'src/app/jscaip/coord/Coord';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/player/Player';

export class LinesOfActionState extends GamePartSlice {
    public static SIZE: number = 8; // board size
    public static getInitialState(): LinesOfActionState {
        const _: number = Player.NONE.value;
        const X: number = Player.ZERO.value;
        const O: number = Player.ONE.value;
        const board: number[][] = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        return new LinesOfActionState(board, 0);
    }
    public static isOnBoard(c: Coord): boolean {
        return c.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE);
    }
    public getAt(c: Coord): number {
        if (LinesOfActionState.isOnBoard(c) === false) {
            throw new Error('Accessing coordinate outside of the board');
        }
        return this.board[c.y][c.x];
    }
}

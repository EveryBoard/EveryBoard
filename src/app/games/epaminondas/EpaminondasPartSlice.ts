import { NumberTable } from 'src/app/utils/ArrayUtils';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';

export class EpaminondasPartSlice extends GamePartSlice {

    public static getInitialSlice(): EpaminondasPartSlice {
        const _: number = Player.NONE.value;
        const X: number = Player.ONE.value;
        const O: number = Player.ZERO.value;
        const board: NumberTable = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        return new EpaminondasPartSlice(board, 0);
    }
    public count(piece: Player, row: number): number {
        let result: number = 0;
        for (let x: number = 0; x < 14; x++) {
            if (this.board[row][x] === piece.value) {
                result++;
            }
        }
        return result;
    }
    public doesOwnPiece(player: Player): boolean {
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                if (this.board[y][x] === player.value) {
                    return true;
                }
            }
        }
        return false;
    }
}

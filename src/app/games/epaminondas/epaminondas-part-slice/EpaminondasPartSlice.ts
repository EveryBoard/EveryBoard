import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/player/Player';

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
    public count(piece: Player, row: number) {
        let result = 0;
        for (let x = 0; x < 14; x++) {
            if (this.getBoardByXY(x, row) === piece.value) {
                result++;
            }
        }
        return result;
    }
    public countPiecesOnBoard(): number {
        let total = 0;
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 14; x++) {
                const p: number = this.getBoardByXY(x, y);
                if (p === Player.ZERO.value) total--;
                else if (p === Player.ONE.value) total++;
            }
        }
        return total;
    }
}

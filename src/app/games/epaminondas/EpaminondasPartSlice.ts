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
        // const board: NumberTable = [
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, X],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
        //     [O, _, O, _, O, _, O, _, O, _, O, _, O, _],
        //     [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
        // ];
        return new EpaminondasPartSlice(board, 0);
    }
    public count(piece: Player, row: number): number {
        let result: number = 0;
        for (let x: number = 0; x < 14; x++) {
            if (this.getBoardByXY(x, row) === piece.value) {
                result++;
            }
        }
        return result;
    }
}

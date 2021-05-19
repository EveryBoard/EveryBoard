import { NumberTable } from 'src/app/utils/ArrayUtils';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';

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
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        //     [_, _, _, _, _, _, _, _, _, _, _, O, O, O],
        //     [_, _, _, _, _, _, _, _, _, _, _, O, O, O],
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
    public getPieceCountPlusRowDomination(): number {
        const SCORE_BY_PIECE: number = 14*13*11;
        const SCORE_BY_ROW_DOMINATION: number = 2;
        const SCORE_BY_PRESENCE: number = 1;
        const SCORE_BY_ALIGNEMENT: number = 1;
        let total: number = 0;
        for (let y: number = 0; y < 12; y++) {
            let row: number = 0;
            const wasPresent: number[] = [0, 0];
            for (let x: number = 0; x < 14; x++) {
                const coord: Coord = new Coord(x, y);
                const player: Player = Player.of(this.getBoardAt(coord));
                if (player !== Player.NONE) {
                    const mod: number = player.getScoreModifier();
                    total += SCORE_BY_PIECE * mod;
                    wasPresent[player.value] = mod;
                    row += mod;
                    for (const dir of [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT]) {
                        let neighboor: Coord = coord.getNext(dir, 1);
                        while (neighboor.isInRange(14, 12) &&
                               this.getBoardAt(neighboor) === player.value)
                        {
                            total += mod * SCORE_BY_ALIGNEMENT;
                            neighboor = neighboor.getNext(dir, 1);
                        }
                    }
                }
            }
            if (row !== 0) {
                total += (Math.abs(row) / row) * SCORE_BY_ROW_DOMINATION;
            }
            total += wasPresent.reduce((sum: number, newElement: number) => sum + newElement) * SCORE_BY_PRESENCE;
        }
        return total;
    }
}

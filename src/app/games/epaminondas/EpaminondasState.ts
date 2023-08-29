import { Table } from 'src/app/utils/ArrayUtils';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';

export class EpaminondasState extends GameStateWithTable<PlayerOrNone> {

    public static readonly WIDTH: number = 14;

    public static readonly HEIGHT: number = 12;

    public static getInitialState(): EpaminondasState {
        const _: PlayerOrNone = PlayerOrNone.NONE;
        const O: PlayerOrNone = PlayerOrNone.ZERO;
        const X: PlayerOrNone = PlayerOrNone.ONE;
        const board: Table<PlayerOrNone> = [
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
        return new EpaminondasState(board, 0);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(EpaminondasState.WIDTH, EpaminondasState.HEIGHT);
    }
    public count(piece: Player, row: number): number {
        let result: number = 0;
        for (let x: number = 0; x < 14; x++) {
            if (this.board[row][x] === piece) {
                result++;
            }
        }
        return result;
    }
    public doesOwnPiece(player: Player): boolean {
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content === player) {
                return true;
            }
        }
        return false;
    }
}

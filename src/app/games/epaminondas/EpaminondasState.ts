import { Table } from 'src/app/utils/ArrayUtils';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';

export class EpaminondasState extends GameStateWithTable<Player> {

    public static getInitialState(): EpaminondasState {
        const _: Player = Player.NONE;
        const X: Player = Player.ONE;
        const O: Player = Player.ZERO;
        const board: Table<Player> = [
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
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                if (this.board[y][x] === player) {
                    return true;
                }
            }
        }
        return false;
    }
}

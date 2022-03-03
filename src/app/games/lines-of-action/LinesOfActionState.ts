import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';

export class LinesOfActionState extends GameStateWithTable<PlayerOrNone> {

    public static SIZE: number = 8; // board size

    public static getInitialState(): LinesOfActionState {
        const _: PlayerOrNone = Player.NONE;
        const X: Player = Player.ZERO;
        const O: Player = Player.ONE;
        const board: PlayerOrNone[][] = [
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
}

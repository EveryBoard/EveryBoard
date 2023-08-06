import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';

export class LinesOfActionState extends GameStateWithTable<PlayerOrNone> {

    public static SIZE: number = 8; // board size

    public static getInitialState(): LinesOfActionState {
        const _: PlayerOrNone = PlayerOrNone.NONE;
        const O: PlayerOrNone = PlayerOrNone.ZERO;
        const X: PlayerOrNone = PlayerOrNone.ONE;
        const board: PlayerOrNone[][] = [
            [_, O, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        return new LinesOfActionState(board, 0);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE);
    }
}

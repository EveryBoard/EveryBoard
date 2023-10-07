import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';

export class DiaballikPiece {

    public static readonly NONE: DiaballikPiece = new DiaballikPiece(PlayerOrNone.NONE, false);
    public static readonly ZERO: DiaballikPiece = new DiaballikPiece(Player.ZERO, false);
    public static readonly ZERO_WITH_BALL: DiaballikPiece = new DiaballikPiece(Player.ZERO, true);
    public static readonly ONE: DiaballikPiece = new DiaballikPiece(Player.ONE, false);
    public static readonly ONE_WITH_BALL: DiaballikPiece = new DiaballikPiece(Player.ONE, true);

    private constructor(public readonly owner: PlayerOrNone,
                        public readonly holdsBall: boolean) {
    }
}

export class DiaballikState extends GameStateWithTable<DiaballikPiece> {

    private static readonly SIZE: number = 7;

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(DiaballikState.SIZE, DiaballikState.SIZE);
    }

    public static getInitialState(): DiaballikState {
        const O: DiaballikPiece = DiaballikPiece.ZERO;
        const Ȯ: DiaballikPiece = DiaballikPiece.ZERO_WITH_BALL;
        const X: DiaballikPiece = DiaballikPiece.ONE;
        const Ẋ: DiaballikPiece = DiaballikPiece.ONE_WITH_BALL;
        const _: DiaballikPiece = DiaballikPiece.NONE;
        const board: Table<DiaballikPiece> = [
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, O, Ȯ, O, O, O],
        ];
        return new DiaballikState(board, 0);
    }
}

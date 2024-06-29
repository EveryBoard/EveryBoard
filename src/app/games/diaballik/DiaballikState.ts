import { GameStateWithTable } from 'src/app/jscaip/state/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ComparableObject, Utils } from '@everyboard/lib';
import { TableUtils } from 'src/app/jscaip/TableUtils';

export class DiaballikPiece implements ComparableObject {

    public static readonly NONE: DiaballikPiece = new DiaballikPiece(PlayerOrNone.NONE, false);
    public static readonly ZERO: DiaballikPiece = new DiaballikPiece(Player.ZERO, false);
    public static readonly ZERO_WITH_BALL: DiaballikPiece = new DiaballikPiece(Player.ZERO, true);
    public static readonly ONE: DiaballikPiece = new DiaballikPiece(Player.ONE, false);
    public static readonly ONE_WITH_BALL: DiaballikPiece = new DiaballikPiece(Player.ONE, true);

    private constructor(public readonly owner: PlayerOrNone,
                        public readonly holdsBall: boolean)
    {
    }

    public equals(other: DiaballikPiece): boolean {
        return this === other;
    }
    public toString(): string {
        switch (this) {
            case DiaballikPiece.NONE: return '__';
            case DiaballikPiece.ZERO: return 'O_';
            case DiaballikPiece.ZERO_WITH_BALL: return 'Oo';
            case DiaballikPiece.ONE: return 'X_';
            default:
                Utils.expectToBe(this, DiaballikPiece.ONE_WITH_BALL);
                return 'Xx';
        }
    }
}

export class DiaballikState extends GameStateWithTable<DiaballikPiece> {

    public equals(other: DiaballikState): boolean {
        return TableUtils.equals(this.board, other.board);
    }
}

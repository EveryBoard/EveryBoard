import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ComparableObject } from 'src/app/utils/Comparable';

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

    public equals(other: this): boolean {
        return this === other;
    }
}

export class DiaballikState extends GameStateWithTable<DiaballikPiece> {

    private static readonly SIZE: number = 7;

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(DiaballikState.SIZE, DiaballikState.SIZE);
    }

    public equals(other: this): boolean {
        for (const coordAndContent of this.getCoordsAndContents()) {
            const otherPiece: DiaballikPiece = other.getPieceAt(coordAndContent.coord);
            if (otherPiece.equals(coordAndContent.content) === false) {
                return false;
            }
        }
        return true;
    }
}

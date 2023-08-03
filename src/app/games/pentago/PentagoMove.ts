import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { PentagoState } from './PentagoState';

type PentagoMoveFields = [Coord, MGPOptional<number>, boolean];

export class PentagoMove extends MoveCoord {

    public static encoder: Encoder<PentagoMove> = Encoder.tuple(
        [Coord.encoder, MGPOptional.getEncoder(Encoder.identity<number>()), Encoder.identity<boolean>()],
        (move: PentagoMove): PentagoMoveFields => [move.coord, move.blockTurned, move.turnedClockwise],
        (fields: PentagoMoveFields): PentagoMove => PentagoMove.of(fields[0], fields[1], fields[2]),
    );
    public static of(coord: Coord, blockTurned: MGPOptional<number>, turnedClockwise: boolean): PentagoMove {
        return new PentagoMove(coord.x, coord.y, blockTurned, turnedClockwise);
    }
    public static withRotation(x: number,
                               y: number,
                               blockTurned: number,
                               turnedClockwise: boolean)
    : PentagoMove
    {
        Utils.assert(0 <= blockTurned && blockTurned <= 3, 'This block does not exist: ' + blockTurned);
        return new PentagoMove(x, y, MGPOptional.of(blockTurned), turnedClockwise);
    }
    public static rotationless(x: number, y: number): PentagoMove {
        return new PentagoMove(x, y, MGPOptional.empty());
    }
    private constructor(x: number,
                        y: number,
                        public readonly blockTurned: MGPOptional<number>,
                        public readonly turnedClockwise: boolean = false)
    {
        super(x, y);
        Utils.assert(PentagoState.isOnBoard(this.coord),
                     'The board is a ' + PentagoState.SIZE + ' space wide square, invalid coord: ' + this.coord.toString());
    }
    public override toString(): string {
        if (this.blockTurned.isPresent()) {
            return 'PentagoMove(' + this.coord.toString() + ', ' + this.blockTurned.get() + ', ' +
                   (this.turnedClockwise ? 'CLOCKWISE' : 'ANTI-CLOCKWISE') + ')';
        } else {
            return 'PentagoMove' + this.coord.toString();
        }
    }
    public override equals(other: PentagoMove): boolean {
        if (this.coord.equals(other.coord) === false) return false;
        if (this.blockTurned.equals(other.blockTurned) === false) return false;
        return this.turnedClockwise === other.turnedClockwise;
    }
}

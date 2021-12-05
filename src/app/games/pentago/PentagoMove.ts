import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { JSONObject, JSONValueWithoutArray } from 'src/app/utils/utils';

export class PentagoMove extends MoveCoord {

    public static encoder: MoveEncoder<PentagoMove> = new class extends MoveEncoder<PentagoMove> {
        public encodeMove(move: PentagoMove): JSONValueWithoutArray {
            const encoded: JSONValueWithoutArray = {
                coord: Coord.encoder.encode(move.coord),
            };
            if (move.blockTurned.isPresent()) {
                encoded['blockTurned'] = move.blockTurned.get();
                encoded['turnedClockwise'] = move.turnedClockwise;
            }

            return encoded;
        }
        public decodeMove(encoded: JSONValueWithoutArray): PentagoMove {
            const casted: JSONObject = encoded as JSONObject;

            const coord: Coord = Coord.encoder.decode(casted['coord']);
            const nullableBlockTurned: MGPOptional<number> = MGPOptional.ofNullable(casted['blockTurned'] as number | null);
            if (nullableBlockTurned.isPresent()) {
                const turnedClockwise: boolean = casted['turnedClockwise'] as boolean;
                return PentagoMove.withRotation(coord.x,
                                                coord.y,
                                                nullableBlockTurned.get(),
                                                turnedClockwise);
            } else {
                return PentagoMove.rotationless(coord.x, coord.y);
            }
        }
    }

    public static withRotation(x: number,
                               y: number,
                               blockTurned: number,
                               turnedClockwise: boolean)
    : PentagoMove
    {
        if (blockTurned < 0 || 3 < blockTurned) {
            throw new Error('This block do not exist: ' + blockTurned);
        }
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
        if (this.coord.isNotInRange(6, 6)) {
            throw new Error('The board is a 6 cas wide square, invalid coord: ' + this.coord.toString());
        }
    }
    public toString(): string {
        if (this.blockTurned.isPresent()) {
            return 'PentagoMove(' + this.coord.toString() + ', ' + this.blockTurned.get() + ', ' +
                   (this.turnedClockwise ? 'CLOCKWISE' : 'ANTI-CLOCKWISE') + ')';
        } else {
            return 'PentagoMove' + this.coord.toString();
        }
    }
    public equals(o: PentagoMove): boolean {
        if (this.coord.equals(o.coord) === false) {
            return false;
        }
        if (this.blockTurned.equals(o.blockTurned) === false) {
            return false;
        }
        return this.turnedClockwise === o.turnedClockwise;
    }
}

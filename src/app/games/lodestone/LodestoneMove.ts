import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { assert } from 'src/app/utils/assert';
import { JSONObject, JSONValueWithoutArray } from 'src/app/utils/utils';
import { LodestoneOrientation, LodestoneDirection } from './LodestonePiece';

export type LodestoneCaptures = {
    top: number,
    bottom: number,
    left: number,
    right: number,
}

export class LodestoneMove extends MoveCoord {

    public static encoder: MoveEncoder<LodestoneMove> = new class extends MoveEncoder<LodestoneMove> {
        public encodeMove(move: LodestoneMove): JSONValueWithoutArray {
            return {
                coord: Coord.encoder.encode(move.coord),
                direction: move.direction,
                diagonal: move.diagonal,
                captures: move.captures,
            };
        }
        public decodeMove(encoded: JSONValueWithoutArray): LodestoneMove {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.coord != null, 'Invalid encoded LodestoneMove');
            assert(casted.direction != null, 'Invalid encoded LodestoneMove');
            assert(casted.diagonal != null, 'Invalid encoded LodestoneMove');
            assert(casted.captures != null, 'Invalid encoded LodestoneMove');
            return new LodestoneMove(Coord.encoder.decode(casted.coord),
                                     casted.direction as LodestoneDirection,
                                     casted.diagonal as LodestoneOrientation,
                                     casted.captures as LodestoneCaptures);
        }
    };
    public constructor(coord: Coord,
                       public readonly direction: LodestoneDirection,
                       public readonly diagonal: LodestoneOrientation,
                       public readonly captures: LodestoneCaptures = { top: 0, bottom: 0, left: 0, right: 0 }) {
        super(coord.x, coord.y);
    }
    public toString(): string {
        return `LodestoneMove(${this.coord.toString()}, ${this.direction}, ${this.diagonal}, { top: ${this.captures.top}, bottom: ${this.captures.bottom}, left: ${this.captures.left}, right: ${this.captures.right} })`;
    }
    public equals(other: LodestoneMove): boolean {
        if (this === other) return true;
        if (this.coord.equals(other.coord) === false) return false;
        if (this.diagonal !== other.diagonal) return false;
        if (this.direction !== other.direction) return false;
        if (this.captures.top !== other.captures.top) return false;
        if (this.captures.bottom !== other.captures.bottom) return false;
        if (this.captures.left !== other.captures.left) return false;
        if (this.captures.right !== other.captures.right) return false;
        return true;
    }
}

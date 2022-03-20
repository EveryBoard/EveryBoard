import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { assert } from 'src/app/utils/assert';
import { JSONObject, JSONValueWithoutArray } from 'src/app/utils/utils';
import { LodestoneDirection } from './LodestonePiece';

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
                                     casted.diagonal as boolean,
                                     casted.captures as LodestoneCaptures);
        }
    };
    public constructor(coord: Coord,
                       public readonly direction: LodestoneDirection,
                       public readonly diagonal: boolean,
                       public readonly captures: LodestoneCaptures = { top: 0, bottom: 0, left: 0, right: 0 }) {
        super(coord.x, coord.y);
    }
    public toString(): string {
        return `LodestoneMove(${this.coord.toString()}, ${this.direction})`;
    }
    public equals(other: LodestoneMove): boolean {
        if (this === other) return true;
        if (this.coord.equals(other.coord) === false) return false;
        if (this.direction !== other.direction) return false;
        return true;
    }
}

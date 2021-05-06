import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from 'src/app/jscaip/encoder';
import { Move } from 'src/app/jscaip/Move';
import { JSONObject, JSONValue } from 'src/app/utils/utils/utils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

export class SixMove extends Move {

    public static encoder: Encoder<SixMove> = new class extends Encoder<SixMove> {
        public encode(move: SixMove): JSONValue {
            return {
                start: move.start.isPresent() ? Coord.encoder.encode(move.start.get()) : null,
                landing: Coord.encoder.encode(move.landing),
                keep: move.keep.isPresent() ? Coord.encoder.encode(move.keep.get()) : null,
            };
        }
        public decode(encoded: JSONValue): SixMove {
            const casted: JSONObject = encoded as JSONObject;
            if (typeof encoded !== 'object') {
                throw new Error('Invalid encodedMove of type ' + typeof encoded + '!');
            }
            const decodedLanding: Coord = Coord.encoder.decode(casted.landing);
            if (casted.start == null) {
                return SixMove.fromDrop(decodedLanding);
            }
            const decodedStart: Coord = Coord.encoder.decode(casted.start);
            if (casted.keep == null) {
                return SixMove.fromDeplacement(decodedStart, decodedLanding);
            } else {
                const decodedKeep: Coord = Coord.encoder.decode(casted.keep);
                return SixMove.fromCut(decodedStart, decodedLanding, decodedKeep);
            }
        }
    }
    public static fromDrop(landing: Coord): SixMove {
        return new SixMove(MGPOptional.empty(), landing, MGPOptional.empty());
    }
    public static fromDeplacement(start: Coord, landing: Coord): SixMove {
        return new SixMove(MGPOptional.of(start), landing, MGPOptional.empty());
    }
    public static fromCut(start: Coord, landing: Coord, keep: Coord): SixMove {
        return new SixMove(MGPOptional.of(start), landing, MGPOptional.of(keep));
    }
    private constructor(public readonly start: MGPOptional<Coord>,
                        public readonly landing: Coord,
                        public readonly keep: MGPOptional<Coord>)
    {
        super();
        if (landing.equals(start.getOrNull())) {
            throw new Error('Deplacement cannot be static!');
        }
        if (start.isPresent() && start.get().equals(keep.getOrNull())) {
            throw new Error('Cannot keep starting coord, since it will always be empty after move!');
        }
    }
    public isDrop(): boolean {
        return this.start.isAbsent();
    }
    public isCut(): boolean {
        return this.keep.isPresent();
    }
    public toString(): string {
        if (this.isDrop()) {
            return 'SixMove(' + this.landing.toString() + ')';
        } else if (this.isCut()) {
            return 'SixMove(' + this.start.get().toString() + ' > ' +
                                this.landing + ', keep: ' +
                                this.keep.get().toString() + ')';
        } else {
            return 'SixMove(' + this.start.get().toString() + ' > ' +
                                this.landing + ')';
        }
    }
    public equals(o: SixMove): boolean {
        if (o == null) {
            return false;
        }
        if (this.landing.equals(o.landing) === false) {
            return false;
        }
        if (this.start.equals(o.start) === false) {
            return false;
        }
        return this.keep.equals(o.keep);
    }
    public encode(): JSONValue {
        return SixMove.encoder.encode(this);
    }
    public decode(encodedMove: JSONValue): SixMove {
        return SixMove.encoder.decode(encodedMove);
    }
}

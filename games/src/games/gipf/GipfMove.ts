import { ArrayUtils, Encoder, MGPOptional, Set } from '@everyboard/lib';

import { Coord } from '../../jscaip/Coord';
import { GipfCapture } from '../../jscaip/GipfProjectHelper';
import { HexaDirection } from '../../jscaip/HexaDirection';
import { Move } from '../../jscaip/Move';

type GipfPlacementFields = [Coord, MGPOptional<HexaDirection>];

export class GipfPlacement {

    public static encoder: Encoder<GipfPlacement> = Encoder.tuple(
        [Coord.encoder, MGPOptional.getEncoder(HexaDirection.encoder)],
        (placement: GipfPlacement): GipfPlacementFields => [placement.coord, placement.direction],
        (fields: GipfPlacementFields): GipfPlacement => new GipfPlacement(fields[0], fields[1]),
    );
    public constructor(public readonly coord: Coord,
                       public readonly direction: MGPOptional<HexaDirection>) {
    }
    public toString(): string {
        if (this.direction.isPresent()) {
            return this.coord.toString() + '@' + this.direction.get().toString();
        } else {
            return this.coord.toString();
        }
    }
    public equals(other: GipfPlacement): boolean {
        if (this.coord.equals(other.coord) === false) {
            return false;
        }
        return this.direction.equals(other.direction);
    }
}

type GipfMoveFields = [GipfPlacement, Array<GipfCapture>, Array<GipfCapture>];

export class GipfMove extends Move {

    public static encoder: Encoder<GipfMove> = Encoder.tuple(
        [GipfPlacement.encoder, GipfCapture.listEncoder, GipfCapture.listEncoder],
        (move: GipfMove) => [move.placement, move.initialCaptures, move.finalCaptures],
        (fields: GipfMoveFields) => new GipfMove(fields[0], fields[1], fields[2]),
    );
    public constructor(public readonly placement: GipfPlacement,
                       public readonly initialCaptures: Set<GipfCapture>,
                       public readonly finalCaptures: Set<GipfCapture>) {
        super();
    }
    public toString(): string {
        return 'GipfMove([' +
            this.capturesToString(this.initialCaptures) + '], ' +
            this.placement.toString() + ', [' +
            this.capturesToString(this.finalCaptures) + '])';
    }
    private capturesToString(captures: Set<GipfCapture>): string {
        let str: string = '';
        for (const capture of captures) {
            if (str !== '') {
                str += ',';
            }
            str += '[' + capture.toString() + ']';
        }
        return str;
    }
    public equals(other: GipfMove): boolean {
        if (this === other) return true;
        if (this.placement.equals(other.placement) === false) return false;
        if (this.initialCaptures.equals(other.initialCaptures) === false) return false;
        if (this.finalCaptures.equals(other.finalCaptures) === false) return false;
        return true;
    }
}

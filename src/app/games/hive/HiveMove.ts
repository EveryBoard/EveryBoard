import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Encoder, MoveEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { HivePiece } from './HivePiece';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';

export class HiveMoveDrop extends MoveCoord {

    public static encoder: Encoder<HiveMoveDrop> = MoveEncoder.tuple(
        [HivePiece.encoder, Coord.encoder],
        (move: HiveMoveDrop): [HivePiece, Coord] => [move.piece, move.coord],
        (fields: [HivePiece, Coord]): HiveMoveDrop => new HiveMoveDrop(fields[0], fields[1].x, fields[1].y),
    );
    public static from(piece: HivePiece, coord: Coord): HiveMoveDrop {
        return new HiveMoveDrop(piece, coord.x, coord.y);
    }
    private constructor(public readonly piece: HivePiece, x: number, y: number) {
        super(x, y);
    }
    public override toString(): string {
        return `HiveDrop(${this.piece.toString()}, ${this.coord.toString()})`;
    }
    public override equals(other: HiveMove): boolean {
        if (other instanceof HiveMoveDrop) {
            return this.piece.equals(other.piece) && this.coord.equals(other.coord);
        }
        return false;
    }
}

export class HiveMoveCoordToCoord extends MoveCoordToCoord {

    public static encoder: Encoder<HiveMoveCoordToCoord> = MoveWithTwoCoords.getEncoder(HiveMoveCoordToCoord.from);

    public static from(start: Coord, end: Coord): MGPFallible<HiveMoveCoordToCoord> {
        if (start.equals(end)) {
            return MGPFallible.failure(RulesFailure.MOVE_CANNOT_BE_STATIC());
        }
        return MGPFallible.success(new HiveMoveCoordToCoord(start, end));
    }
    protected constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public toString(): string {
        return `HiveMoveCoordToCoord(${this.getStart().toString()} -> ${this.getEnd().toString()})`;
    }
    public override equals(other: HiveMove): boolean {
        if (other instanceof HiveMoveSpider) {
            // Spider moves are coord to coord but the intermediate coords matter, so we can't compare them here
            return false;
        }
        if (other instanceof HiveMoveCoordToCoord) {
            return this.getStart().equals(other.getStart()) && this.getEnd().equals(other.getEnd());
        }
        return false;
    }
}

export class HiveMoveSpider extends HiveMoveCoordToCoord {

    public static override encoder: Encoder<HiveMoveSpider> = MoveEncoder.tuple(
        [Coord.encoder, Coord.encoder, Coord.encoder, Coord.encoder],
        (move: HiveMoveSpider): [Coord, Coord, Coord, Coord] => move.coords,
        (fields: [Coord, Coord, Coord, Coord]): HiveMoveSpider => new HiveMoveSpider(fields),
    );
    public static fromCoords(coords: [Coord, Coord, Coord, Coord]): HiveMoveSpider {
        return new HiveMoveSpider(coords);
    }
    private constructor(public readonly coords: [Coord, Coord, Coord, Coord]) {
        super(coords[0], coords[3]);
    }
    public override toString(): string {
        const coords: string = this.coords.map((coord: Coord) => coord.toString()).join(', ');
        return `HiveMoveSpider(${coords})`;
    }
    public override equals(other: HiveMove): boolean {
        if (other instanceof HiveMoveSpider) {
            return this.getStart().equals(other.getStart()) && this.getEnd().equals(other.getEnd());
        }
        return false;
    }
}

export class HiveMovePass extends Move {

    public toString(): string {
        return 'HiveMovePass';
    }
    public override equals(other: this): boolean {
        return other instanceof HiveMovePass;
    }
}

export type HiveMove = HiveMoveDrop | HiveMoveCoordToCoord | HiveMoveSpider | HiveMovePass;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace HiveMove {

    export const PASS: HiveMove = new HiveMovePass();

    export function drop(piece: HivePiece, coord: Coord): HiveMove {
        return HiveMoveDrop.from(piece, coord);
    }
    export function move(start: Coord, end: Coord): MGPFallible<HiveMove> {
        return HiveMoveCoordToCoord.from(start, end);
    }
    export function spiderMove(coords: [Coord, Coord, Coord, Coord]): HiveMove {
        return HiveMoveSpider.fromCoords(coords);
    }
    export const encoder: MoveEncoder<HiveMove> = new class extends MoveEncoder<HiveMove> {
        public encodeMove(value: HiveMove): JSONValueWithoutArray {
            if (value instanceof HiveMoveDrop) {
                return {
                    moveType: 'Drop',
                    encoded: HiveMoveDrop.encoder.encode(value),
                };
            } else if (value instanceof HiveMoveSpider) {
                return {
                    moveType: 'Spider',
                    encoded: HiveMoveSpider.encoder.encode(value),
                };
            } else if (value instanceof HiveMoveCoordToCoord) {
                return {
                    moveType: 'CoordToCoord',
                    encoded: HiveMoveCoordToCoord.encoder.encode(value),
                };
            } else {
                return {
                    moveType: 'Pass',
                };
            }
        }
        public decodeMove(encoded: JSONValueWithoutArray): HiveMove {
            // eslint-disable-next-line dot-notation
            const moveType: string = Utils.getNonNullable(encoded)['moveType'];
            // eslint-disable-next-line dot-notation
            const content: JSONValue = Utils.getNonNullable(encoded)['encoded'] as JSONValue;
            if (moveType === 'Drop') {
                return HiveMoveDrop.encoder.decode(content);
            } else if (moveType === 'Spider') {
                return HiveMoveSpider.encoder.decode(content);
            } else if (moveType === 'CoordToCoord') {
                return HiveMoveCoordToCoord.encoder.decode(content);
            } else {
                return HiveMove.PASS;
            }
        }
    };
}

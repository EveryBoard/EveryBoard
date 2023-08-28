import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { HivePiece } from './HivePiece';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';

export class HiveDropMove extends MoveCoord {

    public static encoder: Encoder<HiveDropMove> = Encoder.tuple(
        [HivePiece.encoder, Coord.encoder],
        (move: HiveDropMove): [HivePiece, Coord] => [move.piece, move.coord],
        (fields: [HivePiece, Coord]): HiveDropMove => new HiveDropMove(fields[0], fields[1].x, fields[1].y),
    );
    public static of(piece: HivePiece, coord: Coord): HiveDropMove {
        return new HiveDropMove(piece, coord.x, coord.y);
    }
    private constructor(public readonly piece: HivePiece, x: number, y: number) {
        super(x, y);
    }
    public override toString(): string {
        return `HiveDrop(${this.piece.toString()}, ${this.coord.toString()})`;
    }
    public override equals(other: HiveMove): boolean {
        if (other instanceof HiveDropMove) {
            return this.piece.equals(other.piece) && this.coord.equals(other.coord);
        }
        return false;
    }
}

export class HiveCoordToCoordMove extends MoveCoordToCoord {

    public static override encoder: Encoder<HiveCoordToCoordMove> =
        MoveWithTwoCoords.getFallibleEncoder(HiveCoordToCoordMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<HiveCoordToCoordMove> {
        if (start.equals(end)) {
            return MGPFallible.failure(RulesFailure.MOVE_CANNOT_BE_STATIC());
        }
        return MGPFallible.success(new HiveCoordToCoordMove(start, end));
    }
    protected constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public override toString(): string {
        return `HiveMoveCoordToCoord(${this.getStart().toString()} -> ${this.getEnd().toString()})`;
    }
    public override equals(other: HiveMove): boolean {
        if (other instanceof HiveSpiderMove) {
            // Spider moves are coord to coord but the intermediate coords matter, so we can't compare them here
            return false;
        }
        if (other instanceof HiveCoordToCoordMove) {
            return this.getStart().equals(other.getStart()) && this.getEnd().equals(other.getEnd());
        }
        return false;
    }
}

export class HiveSpiderMove extends HiveCoordToCoordMove {

    public static override encoder: Encoder<HiveSpiderMove> = Encoder.tuple(
        [Coord.encoder, Coord.encoder, Coord.encoder, Coord.encoder],
        (move: HiveSpiderMove): [Coord, Coord, Coord, Coord] => move.coords,
        (fields: [Coord, Coord, Coord, Coord]): HiveSpiderMove => new HiveSpiderMove(fields),
    );
    public static ofCoords(coords: [Coord, Coord, Coord, Coord]): HiveSpiderMove {
        return new HiveSpiderMove(coords);
    }
    private constructor(public readonly coords: [Coord, Coord, Coord, Coord]) {
        super(coords[0], coords[3]);
    }
    public override toString(): string {
        const coords: string = this.coords.map((coord: Coord) => coord.toString()).join(', ');
        return `HiveMoveSpider(${coords})`;
    }
    public override equals(other: HiveMove): boolean {
        if (other instanceof HiveSpiderMove) {
            return this.getStart().equals(other.getStart()) && this.getEnd().equals(other.getEnd());
        }
        return false;
    }
}

export class HivePassMove extends Move {

    public static encoder: Encoder<HivePassMove> = Encoder.constant('HiveMovePass', new HivePassMove());

    public toString(): string {
        return 'HiveMovePass';
    }
    public override equals(other: this): boolean {
        return other instanceof HivePassMove;
    }
}

export type HiveMove = HiveDropMove | HiveCoordToCoordMove | HiveSpiderMove | HivePassMove;

function isInstanceOfHiveDropMove(value: HiveMove): boolean {
    return value instanceof HiveDropMove;
}
function isInstanceOfHiveMoveSpider(value: HiveMove): boolean {
    return value instanceof HiveSpiderMove;
}
function isInstanceOfHiveMoveCoordToCoord(value: HiveMove): boolean {
    return value instanceof HiveCoordToCoordMove;
}
function isInstanceOfHiveMovePass(value: HiveMove): boolean {
    return value instanceof HivePassMove;
}
// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace HiveMove {

    export const PASS: HiveMove = new HivePassMove();

    export function drop(piece: HivePiece, coord: Coord): HiveMove {
        return HiveDropMove.of(piece, coord);
    }
    export function move(start: Coord, end: Coord): MGPFallible<HiveMove> {
        return HiveCoordToCoordMove.from(start, end);
    }
    export function spiderMove(coords: [Coord, Coord, Coord, Coord]): HiveMove {
        return HiveSpiderMove.ofCoords(coords);
    }
    export const encoder: Encoder<HiveMove> = Encoder.disjunction(
        [
            isInstanceOfHiveDropMove,
            isInstanceOfHiveMoveSpider,
            isInstanceOfHiveMoveCoordToCoord,
            isInstanceOfHiveMovePass,
        ],
        [HiveDropMove.encoder, HiveSpiderMove.encoder, HiveCoordToCoordMove.encoder, HivePassMove.encoder],
    );
}

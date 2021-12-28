import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Encoder, NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { JSONValue } from 'src/app/utils/utils';
import { ConspirateursFailure } from './ConspirateursFailure';
import { ConspirateursState } from './ConspirateursState';

export class ConspirateursMoveDrop extends MoveCoord {
    public static encoder: NumberEncoder<ConspirateursMoveDrop> =
        MoveCoord.getEncoder(ConspirateursState.WIDTH,
                             ConspirateursState.HEIGHT,
                             (coord: Coord) => ConspirateursMoveDrop.of(coord).get());

    public static of(coord: Coord): MGPFallible<ConspirateursMoveDrop> {
        if (coord.isInRange(ConspirateursState.WIDTH, ConspirateursState.HEIGHT) === false) {
            return MGPFallible.failure('Move out of board');
        }
        return MGPFallible.success(new ConspirateursMoveDrop(coord));
    }
    private constructor(coord: Coord) {
        super(coord.x, coord.y);
    }
    public toString(): string {
        return `ConspirateursMoveDrop(${this.coord.toString()})`;
    }
    public equals(other: ConspirateursMoveDrop): boolean {
        return this.coord.equals(other.coord);
    }
    public isDrop(): this is ConspirateursMoveDrop {
        return true;
    }
    public isSimple(): this is ConspirateursMoveSimple {
        return false;
    }
}

export class ConspirateursMoveSimple extends MoveCoordToCoord {
    public static encoder: NumberEncoder<ConspirateursMoveSimple> =
        MoveCoordToCoord.getEncoder(ConspirateursState.WIDTH,
                                    ConspirateursState.HEIGHT,
                                    (start: Coord, end: Coord) => ConspirateursMoveSimple.of(start, end).get());

    public static of(start: Coord, end: Coord): MGPFallible<ConspirateursMoveSimple> {
        if (start.isInRange(ConspirateursState.WIDTH, ConspirateursState.HEIGHT) === false) {
            return MGPFallible.failure('Move out of board');
        }
        if (end.isInRange(ConspirateursState.WIDTH, ConspirateursState.HEIGHT) === false) {
            return MGPFallible.failure('Move out of board');
        }
        if (start.getDistance(end) !== 1) {
            return MGPFallible.failure(ConspirateursFailure.SIMPLE_MOVE_SHOULD_BE_OF_ONE_STEP());
        }
        return MGPFallible.success(new ConspirateursMoveSimple(start, end));
    }

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public toString(): string {
        return `ConspirateursMoveSimple(${this.coord.toString()} -> ${this.end.toString()})`;
    }
    public equals(other: this): boolean {
        if (other === this) return true;
        if (other.coord.equals(this.coord) === false) return false;
        if (other.end.equals(this.end) === false) return false;
        return true;
    }
    public isDrop(): this is ConspirateursMoveDrop {
        return false;
    }
    public isSimple(): this is ConspirateursMoveSimple {
        return true;
    }
}
export class ConspirateursMoveJump extends Move {
    public static encoder: Encoder<ConspirateursMoveJump> = new class extends Encoder<ConspirateursMoveJump> {
        private coordEncoder: NumberEncoder<Coord> =
            Coord.numberEncoder(ConspirateursState.WIDTH, ConspirateursState.HEIGHT);
        public encode(move: ConspirateursMoveJump): JSONValue {
            return move.coords.map(this.coordEncoder.encodeNumber);
        }
        public decode(encoded: JSONValue): ConspirateursMoveJump {
            const casted: number[] = encoded as number[];
            const decoded: Coord[] = casted.map(this.coordEncoder.decodeNumber);
            return ConspirateursMoveJump.of(decoded).get();
        }
    }
    public static of(coords: readonly Coord[]): MGPFallible<ConspirateursMoveJump> {
        if (coords.length < 2) {
            return MGPFallible.failure('ConspirateursMoveJump requires at least one jump, so two coords');
        }
        for (let i: number = 1; i < coords.length; i++) {
            const jumpDistance: number = coords[i-1].getDistance(coords[i]);
            if (jumpDistance !== 2) {
                return MGPFallible.failure('ConspirateursMoveJump requires jumps to be of a distance of 2');
            }
            const jumpDirection: MGPFallible<Direction> = coords[i - 1].getDirectionToward(coords[i]);
            if (jumpDirection.isFailure()) {
                return MGPFallible.failure('ConspirateursJump: invalid jump direction');
            }
        }
        return MGPFallible.success(new ConspirateursMoveJump(coords));
    }
    private constructor(public coords: readonly Coord[]) {
        super();
    }
    public getStartingCoord(): Coord {
        return this.coords[0];
    }
    public getEndingCoord(): Coord {
        return this.coords[this.coords.length-1];
    }
    public getLandingCoords(): Coord[] {
        return this.coords.slice(1);
    }
    public getJumpedOverCoords(): Coord[] {
        const jumpedOver: Coord[] = [];
        for (let i: number = 1; i < this.coords.length; i++) {
            const jumpDirection: Direction = this.coords[i-1].getDirectionToward(this.coords[i]).get();
            jumpedOver.push(this.coords[i-1].getNext(jumpDirection, 1));
        }
        return jumpedOver;
    }
    public toString(): string {
        const jumps: string = this.coords
            .map((coord: Coord) => coord.toString())
            .reduce((coord1: string, coord2: string) => coord1 + ' -> ' + coord2);
        return `ConspirateurMoveJump(${jumps})`;
    }
    public equals(other: ConspirateursMoveJump): boolean {
        if (other === this) return true;
        if (other.coords.length !== this.coords.length) return false;
        for (let i: number = 0; i < this.coords.length; i++) {
            if (other.coords[i].equals(this.coords[i]) === false) return false;
        }
        return true;
    }
    public isDrop(): this is ConspirateursMoveDrop {
        return false;
    }
    public isSimple(): this is ConspirateursMoveSimple {
        return false;
    }
}

export type ConspirateursMove = ConspirateursMoveDrop | ConspirateursMoveSimple | ConspirateursMoveJump

export const ConspirateursMoveEncoder: Encoder<ConspirateursMove> =
    Encoder.disjunction3(ConspirateursMoveDrop.encoder,
                         ConspirateursMoveSimple.encoder,
                         ConspirateursMoveJump.encoder,
                         (value: ConspirateursMove): value is ConspirateursMoveDrop => value.isDrop(),
                         (value: ConspirateursMove): value is ConspirateursMoveSimple => value.isSimple());

import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MoveEncoder, NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoord, MoveCoordEncoder } from 'src/app/jscaip/MoveCoord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPSet } from 'src/app/utils/MGPSet';
import { assert, JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { ConspirateursFailure } from './ConspirateursFailure';
import { ConspirateursState } from './ConspirateursState';

export class ConspirateursMoveDrop extends MoveCoord {
    public static encoder: NumberEncoder<ConspirateursMoveDrop> =
        MoveCoordEncoder.getEncoder(ConspirateursState.WIDTH,
                                    ConspirateursState.HEIGHT,
                                    (coord: Coord) => ConspirateursMoveDrop.of(coord).get());

    public static of(coord: Coord): MGPFallible<ConspirateursMoveDrop> {
        if (coord.isInRange(ConspirateursState.WIDTH, ConspirateursState.HEIGHT)) {
            return MGPFallible.success(new ConspirateursMoveDrop(coord));
        } else {
            return MGPFallible.failure('Move out of board');
        }
    }
    private constructor(coord: Coord) {
        super(coord.x, coord.y);
    }
    public toString(): string {
        return `ConspirateursMoveDrop(${this.coord.toString()})`;
    }
    public equals(other: ConspirateursMove): boolean {
        if (other.isDrop()) {
            return this.coord.equals(other.coord);
        } else {
            return false;
        }
    }
    public isDrop(): this is ConspirateursMoveDrop {
        return true;
    }
    public isSimple(): this is ConspirateursMoveSimple {
        return false;
    }
    public isJump(): this is ConspirateursMoveJump {
        return false;
    }
}

export class ConspirateursMoveSimple extends MoveCoordToCoord {
    public static encoder: NumberEncoder<ConspirateursMoveSimple> =
        MoveCoordToCoord.getEncoder(ConspirateursState.WIDTH,
                                    ConspirateursState.HEIGHT,
                                    (start: Coord, end: Coord) => ConspirateursMoveSimple.of(start, end).get());

    public static of(start: Coord, end: Coord): MGPFallible<ConspirateursMoveSimple> {
        if (start.isInRange(ConspirateursState.WIDTH, ConspirateursState.HEIGHT) &&
            end.isInRange(ConspirateursState.WIDTH, ConspirateursState.HEIGHT)) {
            if (start.isAlignedWith(end) && start.getDistance(end) === 1) {
                return MGPFallible.success(new ConspirateursMoveSimple(start, end));
            } else {
                return MGPFallible.failure(ConspirateursFailure.SIMPLE_MOVE_SHOULD_BE_OF_ONE_STEP());
            }
        } else {
            return MGPFallible.failure('Move out of board');
        }
    }

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public toString(): string {
        return `ConspirateursMoveSimple(${this.coord.toString()} -> ${this.end.toString()})`;
    }
    public equals(other: ConspirateursMove): boolean {
        if (other.isSimple()) {
            if (other === this) return true;
            if (other.coord.equals(this.coord) === false) return false;
            if (other.end.equals(this.end) === false) return false;
            return true;
        } else {
            return false;
        }
    }
    public isDrop(): this is ConspirateursMoveDrop {
        return false;
    }
    public isSimple(): this is ConspirateursMoveSimple {
        return true;
    }
    public isJump(): this is ConspirateursMoveJump {
        return false;
    }
}
export class ConspirateursMoveJump extends Move {
    public static encoder: MoveEncoder<ConspirateursMoveJump> = new class extends MoveEncoder<ConspirateursMoveJump> {
        private readonly coordEncoder: NumberEncoder<Coord> =
            Coord.numberEncoder(ConspirateursState.WIDTH, ConspirateursState.HEIGHT);
        public encodeMove(move: ConspirateursMoveJump): JSONValueWithoutArray {
            return {
                coords: move.coords.map(this.coordEncoder.encodeNumber),
            };
        }
        public decodeMove(encoded: JSONValue): ConspirateursMoveJump {
            assert(Utils.getNonNullable(encoded)['coords'] != null, 'Encoded ConspirateursMoveJump should contain coords');
            const coords: number[] = Utils.getNonNullable(encoded)['coords'] as number[];
            const decoded: Coord[] = coords.map(this.coordEncoder.decodeNumber);
            return ConspirateursMoveJump.of(decoded).get();
        }
    }
    public static of(coords: readonly Coord[]): MGPFallible<ConspirateursMoveJump> {
        if (coords.length < 2) {
            return MGPFallible.failure('ConspirateursMoveJump requires at least one jump, so two coords');
        }
        for (const coord of coords) {
            if (coord.isInRange(ConspirateursState.WIDTH, ConspirateursState.HEIGHT) === false) {
                return MGPFallible.failure('Move out of board');
            }
        }
        for (let i: number = 1; i < coords.length; i++) {
            const jumpDirection: MGPFallible<Direction> = coords[i - 1].getDirectionToward(coords[i]);
            if (jumpDirection.isFailure()) {
                return MGPFallible.failure(ConspirateursFailure.INVALID_JUMP());
            }
            const jumpDistance: number = coords[i-1].getDistance(coords[i]);
            if (jumpDistance !== 2) {
                return MGPFallible.failure(ConspirateursFailure.INVALID_JUMP());
            }
        }
        const uniqueCoords: MGPSet<Coord> = new MGPSet(coords);
        if (uniqueCoords.size() === coords.length) {
            return MGPFallible.success(new ConspirateursMoveJump(coords));
        } else {
            return MGPFallible.failure(ConspirateursFailure.SAME_LOCATION_VISITED_IN_JUMP());
        }
    }
    private constructor(public coords: readonly Coord[]) {
        super();
    }
    public addJump(target: Coord): MGPFallible<ConspirateursMoveJump> {
        const coords: Coord[] = ArrayUtils.copyImmutableArray(this.coords);
        coords.push(target);
        return ConspirateursMoveJump.of(coords);
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
        return `ConspirateursMoveJump(${jumps})`;
    }
    public equals(other: ConspirateursMove): boolean {
        if (other.isSimple() || other.isDrop()) {
            return false;
        } else {
            if (other === this) return true;
            // Equality only needs to check the first and last coord
            if (this.getStartingCoord().equals(other.getStartingCoord()) === false) return false;
            if (this.getEndingCoord().equals(other.getEndingCoord()) === false) return false;
            return true;
        }
    }
    public isDrop(): this is ConspirateursMoveDrop {
        return false;
    }
    public isSimple(): this is ConspirateursMoveSimple {
        return false;
    }
    public isJump(): this is ConspirateursMoveJump {
        return true;
    }
}

export type ConspirateursMove = ConspirateursMoveDrop | ConspirateursMoveSimple | ConspirateursMoveJump

export const ConspirateursMoveEncoder: MoveEncoder<ConspirateursMove> =
    MoveEncoder.disjunction3(ConspirateursMoveDrop.encoder,
                             ConspirateursMoveSimple.encoder,
                             ConspirateursMoveJump.encoder,
                             (value: ConspirateursMove): value is ConspirateursMoveDrop => value.isDrop(),
                             (value: ConspirateursMove): value is ConspirateursMoveSimple => value.isSimple());

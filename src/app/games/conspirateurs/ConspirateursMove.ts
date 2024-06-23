import { Coord } from 'src/app/jscaip/Coord';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Encoder, ArrayUtils, MGPFallible } from '@everyboard/lib';
import { ConspirateursFailure } from './ConspirateursFailure';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { CoordSet } from 'src/app/jscaip/CoordSet';

export class ConspirateursMoveDrop extends MoveCoord {

    public static encoder: Encoder<ConspirateursMoveDrop> = MoveCoord.getEncoder(ConspirateursMoveDrop.of);

    public static of(coord: Coord): ConspirateursMoveDrop {
        return new ConspirateursMoveDrop(coord);
    }
    private constructor(coord: Coord) {
        super(coord.x, coord.y);
    }
    public toString(): string {
        return `ConspirateursMoveDrop(${this.coord.toString()})`;
    }
    public override equals(other: ConspirateursMove): boolean {
        if (ConspirateursMove.isDrop(other)) {
            return this.coord.equals(other.coord);
        } else {
            return false;
        }
    }
}

export class ConspirateursMoveSimple extends MoveCoordToCoord {

    public static encoder: Encoder<ConspirateursMoveSimple> =
        MoveWithTwoCoords.getFallibleEncoder(ConspirateursMoveSimple.from);

    public static from(start: Coord, end: Coord): MGPFallible<ConspirateursMoveSimple> {
        if (start.isAlignedWith(end) && start.getLinearDistanceToward(end) === 1) {
            return MGPFallible.success(new ConspirateursMoveSimple(start, end));
        } else {
            return MGPFallible.failure(ConspirateursFailure.SIMPLE_MOVE_SHOULD_BE_OF_ONE_STEP());
        }
    }

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public override toString(): string {
        return `ConspirateursMoveSimple(${this.getStart().toString()} -> ${this.getEnd().toString()})`;
    }
    public override equals(other: ConspirateursMove): boolean {
        if (ConspirateursMove.isSimple(other)) {
            return super.equals(other as this);
        } else {
            return false;
        }
    }
}

export class ConspirateursMoveJump extends Move {

    public static encoder: Encoder<ConspirateursMoveJump> = Encoder.tuple(
        [Encoder.list<Coord>(Coord.encoder)],
        (move: ConspirateursMoveJump): [Coord[]] => [ArrayUtils.copy(move.coords)],
        (fields: [Coord[]]): ConspirateursMoveJump => ConspirateursMoveJump.from(fields[0]).get(),
    );

    public static from(coords: readonly Coord[]): MGPFallible<ConspirateursMoveJump> {
        if (coords.length < 2) {
            return MGPFallible.failure('ConspirateursMoveJump requires at least one jump, so two coords');
        }
        for (let i: number = 1; i < coords.length; i++) {
            const jumpDirection: MGPFallible<Ordinal> = coords[i - 1].getDirectionToward(coords[i]);
            if (jumpDirection.isFailure()) {
                return MGPFallible.failure(ConspirateursFailure.INVALID_JUMP());
            }
            const jumpDistance: number = coords[i-1].getLinearDistanceToward(coords[i]);
            if (jumpDistance !== 2) {
                return MGPFallible.failure(ConspirateursFailure.INVALID_JUMP());
            }
        }
        const uniqueCoords: CoordSet = new CoordSet(coords);
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
        const coords: Coord[] = ArrayUtils.copy(this.coords);
        coords.push(target);
        return ConspirateursMoveJump.from(coords);
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
            const jumpDirection: Ordinal = this.coords[i-1].getDirectionToward(this.coords[i]).get();
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
        if (ConspirateursMove.isSimple(other) || ConspirateursMove.isDrop(other)) {
            return false;
        } else {
            if (other === this) return true;
            // Equality only needs to check the first and last coord
            if (this.getStartingCoord().equals(other.getStartingCoord()) === false) return false;
            if (this.getEndingCoord().equals(other.getEndingCoord()) === false) return false;
            return true;
        }
    }

}

export type ConspirateursMove = ConspirateursMoveDrop | ConspirateursMoveSimple | ConspirateursMoveJump;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace ConspirateursMove {

    export function isDrop(move: ConspirateursMove): move is ConspirateursMoveDrop {
        return move instanceof ConspirateursMoveDrop;
    }

    export function isSimple(move: ConspirateursMove): move is ConspirateursMoveSimple {
        return move instanceof ConspirateursMoveSimple;
    }

    export function isJump(move: ConspirateursMove): move is ConspirateursMoveJump {
        return move instanceof ConspirateursMoveJump;
    }

    export const encoder: Encoder<ConspirateursMove> =
        Encoder.disjunction(
            [ConspirateursMove.isDrop, ConspirateursMove.isSimple, ConspirateursMove.isJump],
            [ConspirateursMoveDrop.encoder, ConspirateursMoveSimple.encoder, ConspirateursMoveJump.encoder]);
}

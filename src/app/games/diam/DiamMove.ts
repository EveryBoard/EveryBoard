import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { DiamPiece } from './DiamPiece';

export class DiamMoveDrop extends Move {
    public static encoder: NumberEncoder<DiamMoveDrop> = NumberEncoder.tuple(
        [NumberEncoder.numberEncoder(7), DiamPiece.encoder],
        (drop: DiamMoveDrop): [number, DiamPiece] => [drop.target, drop.piece],
        (fields: [number, DiamPiece]): DiamMoveDrop => new DiamMoveDrop(fields[0], fields[1]),
    );
    constructor(public readonly target: number,
                public readonly piece: DiamPiece) {
        super();
        if (piece === DiamPiece.EMPTY) {
            throw new Error('Cannot drop an empty piece');
        }
    }
    public isDrop(): this is DiamMoveDrop {
        return true;
    }
    public getTarget(): number {
        return this.target;
    }
    public equals(other: DiamMoveDrop): boolean {
        if (this.target !== other.target) return false;
        if (this.piece !== other.piece) return false;
        return true;
    }
    public toString(): string {
        return `DiamMoveDrop(${this.target}, ${this.piece})`;
    }
}

type DiamShiftDirection = 'clockwise' | 'counterclockwise';

export class DiamMoveShift extends Move {
    public static encoder: NumberEncoder<DiamMoveShift> = NumberEncoder.tuple(
        [Coord.numberEncoder(8, 4), NumberEncoder.booleanEncoder],
        (shift: DiamMoveShift): [Coord, boolean] => [shift.start, shift.moveDirection === 'clockwise'],
        (fields: [Coord, boolean]): DiamMoveShift => new DiamMoveShift(fields[0], fields[1] ? 'clockwise' : 'counterclockwise'),
    );
    public static fromRepresentation(representationStart: Coord, moveDirection: DiamShiftDirection): DiamMoveShift {
        // In the representation, the y axis is reverted, so 3 - y gives the real y on board
        return new DiamMoveShift(new Coord(representationStart.x, 3 - representationStart.y), moveDirection);
    }
    public constructor(public readonly start: Coord,
                       public readonly moveDirection: DiamShiftDirection) {
        super();
    }
    public isDrop(): this is DiamMoveDrop {
        return false;
    }
    public getTarget(): number {
        if (this.moveDirection === 'clockwise') {
            return (this.start.x + 1) % 8;
        } else {
            return (this.start.x + 7) % 8;
        }
    }
    public equals(other: DiamMoveShift): boolean {
        if (this.start.equals(other.start) === false) return false;
        if (this.moveDirection !== other.moveDirection) return false;
        return true;
    }
    public toString(): string {
        return `DiamMoveShift(${this.start}, ${this.moveDirection})`;
    }
}

export type DiamMove = DiamMoveDrop | DiamMoveShift

export const DiamMoveEncoder: NumberEncoder<DiamMove> =
    NumberEncoder.disjunction(DiamMoveDrop.encoder,
                              DiamMoveShift.encoder,
                              (value: DiamMove): value is DiamMoveDrop => {
                                  return value.isDrop();
                              });

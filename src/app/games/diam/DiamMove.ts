import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { DiamPiece } from './DiamPiece';

export type DiamXValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DiamMove = DiamMoveDrop | DiamMoveShift

export class DiamMoveDrop extends Move {
    constructor(public readonly target: DiamXValue,
                public readonly piece: DiamPiece) {
        super();
        if (piece === DiamPiece.EMPTY) {
            throw new Error('Cannot drop an empty piece');
        }
    }
    public isDrop(): this is DiamMoveDrop {
        return true;
    }
    public isShift(): this is DiamMoveShift {
        return false;
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

export class DiamMoveShift extends Move {
    constructor(public readonly start: Coord,
                public readonly moveDirection: 'right' | 'left') {
        super();
    }
    public isDrop(): this is DiamMoveDrop {
        return false;
    }
    public isShift(): this is DiamMoveShift {
        return true;
    }
    public getTarget(): DiamXValue {
        if (this.moveDirection === 'right') {
            return (this.start.x + 1) % 8 as DiamXValue;
        } else {
            return (this.start.x + 7) % 8 as DiamXValue;
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

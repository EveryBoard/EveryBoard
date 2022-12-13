import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { HivePiece } from './HivePiece';

export class HiveMoveDrop extends MoveCoord {

    public constructor(public readonly piece: HivePiece, x: number, y: number) {
        super(x, y);
    }

    public toString(): string {
        return `HiveDrop(${this.coord.toString()})`;
    }

    public equals(other: HiveMove): boolean {
        if (other instanceof HiveMoveDrop) {
            return this.coord.equals(other.coord);
        }
        return false;
    }

}

export class HiveMoveCoordToCoord extends MoveCoordToCoord {

    public toString(): string {
        return `HiveMoveCoordToCoord(${this.coord.toString()} -> ${this.end.toString()})`;
    }

    public equals(other: HiveMove): boolean {
        if (other instanceof HiveMoveSpider) {
            // Spider moves are coord to coord but the intermediate coords matter, so we can't compare them here
            return false;
        }
        if (other instanceof HiveMoveCoordToCoord) {
            return this.coord.equals(other.coord) && this.end.equals(other.end);
        }
        return false;
    }
}

export class HiveMoveSpider extends HiveMoveCoordToCoord {

    public constructor(public readonly coords: [Coord, Coord, Coord, Coord]) {
        super(coords[0], coords[3]);
    }

    public toString(): string {
        return `HiveMoveSpider(${this.coords[0].toString()}, ${this.coords[3].toString()})`;
    }

    public equals(other: HiveMove): boolean {
        if (other instanceof HiveMoveSpider) {
            return this.coord.equals(other.coord) && this.end.equals(other.end);
        }
        return false;
    }
}

export class HiveMovePass extends Move {

    public toString(): string {
        return 'HiveMovePass';
    }

    public equals(other: this): boolean {
        return other instanceof HiveMovePass;
    }
}

export type HiveMove = HiveMoveDrop | HiveMoveCoordToCoord | HiveMoveSpider | HiveMovePass

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace HiveMove {

    export function drop(piece: HivePiece, x: number, y: number): HiveMove {
        return new HiveMoveDrop(piece, x, y);
    }

    export function move(start: Coord, end: Coord): HiveMove {
        return new HiveMoveCoordToCoord(start, end);
    }

    export function spiderMove(coords: [Coord, Coord, Coord, Coord]): HiveMove {
        return new HiveMoveSpider(coords);
    }
}

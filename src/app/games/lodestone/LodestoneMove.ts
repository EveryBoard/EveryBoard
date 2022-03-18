import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { LodestoneDirection } from './LodestonePiece';

export type LodestoneCaptures = {
    top: number,
    bottom: number,
    left: number,
    right: number,
}

export class LodestoneMove extends MoveCoord {
    public constructor(coord: Coord,
                       public readonly direction: LodestoneDirection,
                       public readonly diagonal: boolean,
                       public readonly captures: LodestoneCaptures = { top: 0, bottom: 0, left: 0, right: 0 }) {
        super(coord.x, coord.y);
    }
    public toString(): string {
        return `LodestoneMove(${this.coord.toString()}, ${this.direction})`;
    }
    public equals(other: LodestoneMove): boolean {
        if (this === other) return true;
        if (this.coord.equals(other.coord) === false) return false;
        if (this.direction !== other.direction) return false;
        return true;
    }
}

import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { Utils } from 'src/app/utils/utils';
import { PenteState } from './PenteState';

export class PenteMove extends MoveCoord {
    public static encoder: MoveEncoder<PenteMove> = MoveCoord.getEncoder(PenteMove.of);

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(PenteState.SIZE, PenteState.SIZE);
    }
    public static of(coord: Coord): PenteMove {
        Utils.assert(PenteMove.isOnBoard(coord), 'PenteMove: coord is out of the board');
        return new PenteMove(coord.x, coord.y);
    }
    private constructor(x: number, y: number) {
        super(x, y);
    }
    public toString(): string {
        return `PenteMove(${this.coord.x}, ${this.coord.y})`;
    }
}
import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { Utils } from 'src/app/utils/utils';
import { PenteState } from './PenteState';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class PenteMove extends MoveCoord {

    public static encoder: Encoder<PenteMove> = MoveCoord.getEncoder(PenteMove.from);

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(PenteState.SIZE, PenteState.SIZE);
    }
    public static from(coord: Coord): MGPFallible<PenteMove> {
        Utils.assert(PenteMove.isOnBoard(coord), 'PenteMove: coord is out of the board');
        return MGPFallible.success(new PenteMove(coord.x, coord.y));
    }
    private constructor(x: number, y: number) {
        super(x, y);
    }
    public toString(): string {
        return `PenteMove(${this.coord.x}, ${this.coord.y})`;
    }
}

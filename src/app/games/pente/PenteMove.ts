import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Encoder } from 'src/app/utils/Encoder';

export class PenteMove extends MoveCoord {

    public static encoder: Encoder<PenteMove> = MoveCoord.getEncoder(PenteMove.of);

    public static of(coord: Coord): PenteMove {
        return new PenteMove(coord.x, coord.y);
    }
    private constructor(x: number, y: number) {
        super(x, y);
    }
    public toString(): string {
        return `PenteMove(${this.coord.x}, ${this.coord.y})`;
    }
}

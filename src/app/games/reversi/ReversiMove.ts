import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { ReversiPartSlice } from './ReversiPartSlice';

export class ReversiMove extends MoveCoord {
    public static encoder: NumberEncoder<ReversiMove> = new class extends NumberEncoder<ReversiMove> {
        public maxValue(): number {
            return (ReversiPartSlice.BOARD_HEIGHT-1)*ReversiPartSlice.BOARD_WIDTH +
                (ReversiPartSlice.BOARD_WIDTH-1);
        }
        public encodeNumber(move: ReversiMove): number {
            return (move.coord.y*ReversiPartSlice.BOARD_WIDTH) + move.coord.x;
        }
        public decodeNumber(encodedMove: number): ReversiMove {
            const x: number = encodedMove % ReversiPartSlice.BOARD_WIDTH;
            const y: number = (encodedMove - x) / ReversiPartSlice.BOARD_WIDTH;
            return new ReversiMove(x, y);
        }
    }
    public static readonly PASS: ReversiMove = new ReversiMove(-1, -1);

    public static readonly PASS_NUMBER: number = ReversiMove.encoder.encodeNumber(ReversiMove.PASS);

    public equals(o: ReversiMove): boolean {
        if (o === this) return true;
        return o.coord.equals(this.coord);
    }
    public toString(): string {
        return 'ReversiMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}

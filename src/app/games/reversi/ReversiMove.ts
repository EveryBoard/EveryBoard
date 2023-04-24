import { NumberEncoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { ReversiState } from './ReversiState';

export class ReversiMove extends MoveCoord {
    public static encoder: NumberEncoder<ReversiMove> = new class extends NumberEncoder<ReversiMove> {
        public maxValue(): number {
            return (ReversiState.BOARD_HEIGHT-1)*ReversiState.BOARD_WIDTH +
                (ReversiState.BOARD_WIDTH-1);
        }
        public encodeNumber(move: ReversiMove): number {
            return (move.coord.y*ReversiState.BOARD_WIDTH) + move.coord.x;
        }
        public decodeNumber(encodedMove: number): ReversiMove {
            const x: number = encodedMove % ReversiState.BOARD_WIDTH;
            const y: number = (encodedMove - x) / ReversiState.BOARD_WIDTH;
            return new ReversiMove(x, y);
        }
    };
    public static readonly PASS: ReversiMove = new ReversiMove(-1, -1);

    public static readonly PASS_NUMBER: number = ReversiMove.encoder.encodeNumber(ReversiMove.PASS);

    public equals(other: ReversiMove): boolean {
        if (other === this) return true;
        return other.coord.equals(this.coord);
    }
    public toString(): string {
        return 'ReversiMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}

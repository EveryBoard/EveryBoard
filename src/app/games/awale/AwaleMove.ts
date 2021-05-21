import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';

export class AwaleMove extends MoveCoord {
    public static encoder: NumberEncoder<AwaleMove> = new class extends NumberEncoder<AwaleMove> {
        public maxValue(): number {
            return 1*6 + 5;
        }
        public encodeNumber(move: AwaleMove): number {
            return (move.coord.y * 6) + move.coord.x;
        }
        public decodeNumber(encoded: number): AwaleMove {
            const x: number = encoded % 6;
            const y: number = (encoded - x) / 6;
            return new AwaleMove(x, y);
        }
    }
    public equals(o: AwaleMove): boolean {
        if (o === this) return true;
        return o.coord.equals(this.coord);
    }
    public toString(): string {
        return 'AwaleMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}

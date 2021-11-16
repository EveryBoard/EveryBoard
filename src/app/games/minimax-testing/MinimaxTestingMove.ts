import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';

export class MinimaxTestingMove extends Move {
    static readonly RIGHT: MinimaxTestingMove = new MinimaxTestingMove(true);
    static readonly DOWN: MinimaxTestingMove = new MinimaxTestingMove(false);

    public static encoder: NumberEncoder<MinimaxTestingMove> = new class extends NumberEncoder<MinimaxTestingMove> {
        public maxValue(): number {
            return 1;
        }
        public decodeNumber(encodedMove: number): MinimaxTestingMove {
            return encodedMove === 0 ? MinimaxTestingMove.RIGHT : MinimaxTestingMove.DOWN;
        }
        public encodeNumber(move: MinimaxTestingMove): number {
            return move.right ? 0 : 1;
        }
    }

    public readonly right: boolean;

    private constructor(right: boolean) {
        super();
        this.right = right;
    }
    public equals(obj: MinimaxTestingMove): boolean {
        if (this === obj) {
            return true;
        }
        return this.right === obj.right;
    }
    public toString(): string {
        return this.right ? 'Move RIGHT' : 'Move DOWN';
    }
}

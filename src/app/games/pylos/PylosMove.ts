import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Move } from 'src/app/jscaip/Move';
import { PylosCoord } from './PylosCoord';
import { NumberEncoder } from 'src/app/jscaip/Encoder';

export class PylosMove extends Move {
    public static encoder: NumberEncoder<PylosMove> = new class extends NumberEncoder<PylosMove> {
        public maxValue(): number {
            const L: number = 63;
            const S: number = 64;
            const F: number = 64;
            const SC: number = 64;
            return 64*65*65*SC + 64*65*F + 64*S + L;
        }
        public encodeNumber(move: PylosMove): number {
            // Encoded as second Capture then first then startingCoord then landingCoord
            const L: number = PylosCoord.encode(move.landingCoord); // from 0 to 63

            const S: number = PylosCoord.encodeOptional(move.startingCoord);
            const F: number = PylosCoord.encodeOptional(move.firstCapture);
            const SC: number = PylosCoord.encodeOptional(move.secondCapture);

            return (64*65*65*SC) + (64*65*F) + (64*S) + L;
        }
        public decodeNumber(encodedMove: number): PylosMove {
            const L: PylosCoord = PylosCoord.decode(encodedMove % 64);
            encodedMove -= (encodedMove % 64); encodedMove /= 64;

            const S: MGPOptional<PylosCoord> = PylosCoord.decodeToOptional(encodedMove % 65);
            encodedMove -= (encodedMove % 65); encodedMove /= 65;

            const F: MGPOptional<PylosCoord> = PylosCoord.decodeToOptional(encodedMove % 65);
            encodedMove -= (encodedMove % 65); encodedMove /= 65;

            const SC: MGPOptional<PylosCoord> = PylosCoord.decodeToOptional(encodedMove);

            return new PylosMove(S, L, F, SC);
        }
    }
    public static fromClimb(startingCoord: PylosCoord, landingCoord: PylosCoord, captures: PylosCoord[]): PylosMove {
        const startingCoordOpt: MGPOptional<PylosCoord> = MGPOptional.of(startingCoord);
        const capturesOptionals: {
            firstCapture: MGPOptional<PylosCoord>,
            secondCapture: MGPOptional<PylosCoord>
        } = PylosMove.checkCaptures(captures);
        const newMove: PylosMove = new PylosMove(startingCoordOpt,
                                                 landingCoord,
                                                 capturesOptionals.firstCapture,
                                                 capturesOptionals.secondCapture);
        if (!landingCoord.isUpperThan(startingCoord)) {
            throw new Error('PylosMove: When piece move it must move upward.');
        }
        return newMove;
    }
    public static checkCaptures(captures: PylosCoord[])
    : { firstCapture: MGPOptional<PylosCoord>, secondCapture: MGPOptional<PylosCoord> }
    {
        let firstCapture: MGPOptional<PylosCoord> = MGPOptional.empty();
        let secondCapture: MGPOptional<PylosCoord> = MGPOptional.empty();
        if (captures.length > 0) {
            firstCapture = MGPOptional.of(captures[0]);
            if (captures.length > 1) {
                if (captures[1].equals(captures[0])) {
                    throw new Error('PylosMove: should not capture twice same piece.');
                }
                secondCapture = MGPOptional.of(captures[1]);
                if (captures[1].isUpperThan(captures[0])) {
                    firstCapture = MGPOptional.of(captures[1]);
                    secondCapture = MGPOptional.of(captures[0]);
                }
                if (captures.length > 2) {
                    throw new Error(`PylosMove: can't capture that much piece.`);
                }
            }
        }
        return { firstCapture, secondCapture };
    }
    public static fromDrop(landingCoord: PylosCoord, captures: PylosCoord[]): PylosMove {
        const startingCoord: MGPOptional<PylosCoord> = MGPOptional.empty();
        const capturesOptionals: {
            firstCapture: MGPOptional<PylosCoord>,
            secondCapture: MGPOptional<PylosCoord>
        } = PylosMove.checkCaptures(captures);
        return new PylosMove(startingCoord,
                             landingCoord,
                             capturesOptionals.firstCapture,
                             capturesOptionals.secondCapture);
    }
    public static changeCapture(move: PylosMove, captures: PylosCoord[]): PylosMove {
        const capturesOptionals: {
            firstCapture: MGPOptional<PylosCoord>,
            secondCapture: MGPOptional<PylosCoord>
        } = PylosMove.checkCaptures(captures);
        return new PylosMove(move.startingCoord,
                             move.landingCoord,
                             capturesOptionals.firstCapture,
                             capturesOptionals.secondCapture);
    }
    private constructor(public readonly startingCoord: MGPOptional<PylosCoord>,
                        public readonly landingCoord: PylosCoord,
                        public readonly firstCapture: MGPOptional<PylosCoord>,
                        public readonly secondCapture: MGPOptional<PylosCoord>)
    {
        super();
    }
    public isClimb(): boolean {
        return this.startingCoord.isPresent();
    }
    public toString(): string {
        const startingCoord: string = this.startingCoord.isAbsent() ? '-' : this.startingCoord.get().toShortString();
        const firstCapture: string = this.firstCapture.isAbsent() ? '-' : this.firstCapture.get().toShortString();
        const secondCapture: string = this.secondCapture.isAbsent() ? '-' : this.secondCapture.get().toShortString();
        return 'PylosMove(' +
               startingCoord + ', ' +
               this.landingCoord.toShortString() + ', ' +
               firstCapture + ', ' +
               secondCapture +
               ')';
    }
    public equals(o: PylosMove): boolean {
        if (o === this) return true;
        if (!this.startingCoord.equals(o.startingCoord)) return false;
        if (!this.landingCoord.equals(o.landingCoord)) return false;
        if (!this.firstCapture.equals(o.firstCapture)) return false;
        if (!this.secondCapture.equals(o.secondCapture)) return false;
        return true;
    }
}

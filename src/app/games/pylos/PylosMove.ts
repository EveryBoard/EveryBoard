import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Move } from 'src/app/jscaip/Move';
import { PylosCoord } from './PylosCoord';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { Localized } from 'src/app/utils/LocaleUtils';
import { PylosFailure } from './PylosFailure';
import { JSONObject, JSONValue, JSONValueWithoutArray } from 'src/app/utils/utils';

export class PylosMoveFailure {
    public static readonly MUST_CAPTURE_MAXIMUM_TWO_PIECES: Localized = () => $localize`You must capture one or two pieces, not more.`;
}

export class PylosMove extends Move {

    public static encoder: MoveEncoder<PylosMove> = new class extends MoveEncoder<PylosMove> {

        public encodeMove(move: PylosMove): JSONValueWithoutArray {
            return {
                firstCapture: PylosCoord.optionalEncoder.encode(move.firstCapture),
                landingCoord: PylosCoord.coordEncoder.encode(move.landingCoord),
                secondCapture: PylosCoord.optionalEncoder.encode(move.secondCapture),
                startingCoord: PylosCoord.optionalEncoder.encode(move.startingCoord),
            };
        }
        public decodeMove(encodedMove: JSONValue): PylosMove {
            const casted: JSONObject = encodedMove as JSONObject;
            // eslint-disable-next-line dot-notation
            const firstCapture: JSONValue = casted['firstCapture'];
            // eslint-disable-next-line dot-notation
            const landingCoord: JSONValue = casted['landingCoord'];
            // eslint-disable-next-line dot-notation
            const secondCapture: JSONValue = casted['secondCapture'];
            // eslint-disable-next-line dot-notation
            const startingCoord: JSONValue = casted['startingCoord'];
            return new PylosMove(PylosCoord.optionalEncoder.decode(startingCoord),
                                 PylosCoord.coordEncoder.decode(landingCoord),
                                 PylosCoord.optionalEncoder.decode(firstCapture),
                                 PylosCoord.optionalEncoder.decode(secondCapture));
        }
    };
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
        if (landingCoord.isHigherThan(startingCoord) === false) {
            throw new Error(PylosFailure.MUST_MOVE_UPWARD());
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
                if (captures[1].isHigherThan(captures[0])) {
                    firstCapture = MGPOptional.of(captures[1]);
                    secondCapture = MGPOptional.of(captures[0]);
                }
                if (captures.length > 2) {
                    throw new Error(PylosMoveFailure.MUST_CAPTURE_MAXIMUM_TWO_PIECES());
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
    public override toString(): string {
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
    public equals(other: PylosMove): boolean {
        if (other === this) return true;
        if (!this.startingCoord.equals(other.startingCoord)) return false;
        if (!this.landingCoord.equals(other.landingCoord)) return false;
        if (!this.firstCapture.equals(other.firstCapture)) return false;
        if (!this.secondCapture.equals(other.secondCapture)) return false;
        return true;
    }
}

import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";
import { Move } from "src/app/jscaip/Move";
import { PylosCoord } from "../pylos-coord/PylosCoord";

export class PylosMove extends Move {

    public static fromClimb(startingCoord: PylosCoord, landingCoord: PylosCoord, captures: PylosCoord[]): PylosMove {
        if (startingCoord == null) throw new Error("PylosMove: Starting Coord can't be null  if it's when created fromClimb.");
        const startingCoordOpt: MGPOptional<PylosCoord> = MGPOptional.of(startingCoord);
        const capturesOptionals = PylosMove.checkCaptures(captures);
        const newMove: PylosMove = new PylosMove(startingCoordOpt,
                                                 landingCoord,
                                                 capturesOptionals.firstCapture,
                                                 capturesOptionals.secondCapture);
        if (!landingCoord.isUpperThan(startingCoord)) {
            throw new Error("PylosMove: When piece move it must move upward.");
        }
        return newMove;
    }
    public static checkCaptures(captures: PylosCoord[]): { firstCapture: MGPOptional<PylosCoord>, secondCapture: MGPOptional<PylosCoord> }
    {
        let firstCapture: MGPOptional<PylosCoord> = MGPOptional.empty();
        let secondCapture: MGPOptional<PylosCoord> = MGPOptional.empty();
        if (captures.length > 0) {
            if (captures[0] == null) throw new Error("PylosMove: first capture cannot be null, use empty list instead.");
            firstCapture = MGPOptional.of(captures[0]);
            if (captures.length > 1) {
                if (captures[1] == null) throw new Error("PylosMove: second capture cannot be null, use 1 sized list instead.");
                if (captures[1].equals(captures[0])) throw new Error("PylosMove: should not capture twice same piece.");
                secondCapture = MGPOptional.of(captures[1]);
                if (captures.length > 2) throw new Error("PylosMove: can't capture that much piece.");
            }
        }
        return {firstCapture, secondCapture};
    }
    public static fromDrop(landingCoord: PylosCoord, captures: PylosCoord[]): PylosMove {
        const startingCoord: MGPOptional<PylosCoord> = MGPOptional.empty();
        const capturesOptionals = PylosMove.checkCaptures(captures);
        return new PylosMove(startingCoord,
                             landingCoord,
                             capturesOptionals.firstCapture,
                             capturesOptionals.secondCapture);
    }
    public static changeCapture(move: PylosMove, captures: PylosCoord[]): PylosMove {
        const capturesOptionals = PylosMove.checkCaptures(captures);
        return new PylosMove(move.startingCoord,
                             move.landingCoord,
                             capturesOptionals.firstCapture,
                             capturesOptionals.secondCapture);
    }
    public static encode(move: PylosMove): number {
        return move.encode();
    }
    public static decode(encodedMove: number): PylosMove {
        const L: PylosCoord = PylosCoord.decode(encodedMove % 64);
        encodedMove -= (encodedMove % 64); encodedMove /= 64;

        const S: MGPOptional<PylosCoord> = PylosCoord.decodeToOptional(encodedMove % 65);
        encodedMove -= (encodedMove % 65); encodedMove /= 65;

        const F: MGPOptional<PylosCoord> = PylosCoord.decodeToOptional(encodedMove % 65);
        encodedMove -= (encodedMove % 65); encodedMove /= 65;

        const SC: MGPOptional<PylosCoord> = PylosCoord.decodeToOptional(encodedMove);

        return new PylosMove(S, L, F, SC);
    }
    private constructor(
        public readonly startingCoord: MGPOptional<PylosCoord>,
        public readonly landingCoord: PylosCoord,
        public readonly firstCapture: MGPOptional<PylosCoord>,
        public readonly secondCapture: MGPOptional<PylosCoord>)
    {
        super();
        if (landingCoord == null) throw new Error("PylosMove: Landing Coord can't be null.");
    }
    public toString(): String {
        const startingCoord: string = this.startingCoord.isAbsent() ? "-" : this.startingCoord.get().toShortString();
        const firstCapture: string = this.firstCapture.isAbsent() ? "-" : this.firstCapture.get().toShortString();
        const secondCapture: string = this.secondCapture.isAbsent() ? "-" : this.secondCapture.get().toShortString();
        return "PylosMove(" +
                   startingCoord + ", " +
                   this.landingCoord.toShortString() + ", " +
                   firstCapture + ", " +
                   secondCapture +
               ")";
    }
    public equals(o: any): boolean {
        const coordComparator: (a: PylosCoord, b: PylosCoord) => boolean = (a: PylosCoord, b: PylosCoord) => a.equals(b);
        if (o === this) return true;
        if (!(o instanceof PylosMove)) return false;
        const other: PylosMove = <PylosMove> o;
        if (!other.startingCoord.equals(this.startingCoord, coordComparator)) return false;
        if (!other.firstCapture.equals(this.firstCapture, coordComparator)) return false;
        if (!other.secondCapture.equals(this.secondCapture, coordComparator)) return false;
        return this.landingCoord.equals(other.landingCoord);
    }
    public encode(): number {
        // Encoded as second Capture then first then startingCoord then landingCoord
        const L: number = PylosCoord.encode(this.landingCoord); // from 0 to 63

        let S: number = PylosCoord.encodeOptional(this.startingCoord);
        let F: number = PylosCoord.encodeOptional(this.firstCapture);
        let SC: number = PylosCoord.encodeOptional(this.secondCapture);

        return (64*65*65*SC) + (64*65*F) + (64*S) + L;
    }
    public decode(encodedMove: number): Move {
        return PylosMove.decode(encodedMove);
    }
}
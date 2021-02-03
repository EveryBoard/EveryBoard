import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Orthogonal } from 'src/app/jscaip/DIRECTION';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

export class SiamMove extends MoveCoord {
    public static encode(move: SiamMove): number {
        const y: number = move.coord.y + 1; // 0 to 6
        const x: number = move.coord.x + 1; // 0 to 6
        const moveDirection: number = move.moveDirection.isAbsent() ? 4 : move.moveDirection.get().toInt(); // 0 to 4
        const landingOrientation: number = move.landingOrientation.toInt();
        return (245 * landingOrientation) + (49 * moveDirection) + (7 * x) + y;
    }
    public static decode(encodedMove: number): SiamMove {
        const y: number = encodedMove%7;
        encodedMove -= y;
        encodedMove/= 7;
        const x: number = encodedMove%7;
        encodedMove -= x;
        encodedMove/= 7;
        const moveDirectionInt: number = encodedMove % 5;
        const moveDirection: MGPOptional<Orthogonal> = moveDirectionInt === 4 ?
            MGPOptional.empty() :
            MGPOptional.of(Orthogonal.fromInt(moveDirectionInt));
        encodedMove -= moveDirectionInt;
        encodedMove /= 5;
        const landingOrientation: Orthogonal = Orthogonal.fromInt(encodedMove);
        return new SiamMove(x - 1, y - 1, moveDirection, landingOrientation);
    }
    constructor(
        readonly x: number,
        readonly y: number,
        public readonly moveDirection: MGPOptional<Orthogonal>,
        public readonly landingOrientation: Orthogonal) {
        super(x, y);
        if (moveDirection == null) throw new Error('Move Direction must be set (even if optional).');
        if (landingOrientation == null) throw new Error('Landing orientation must be set.');
        this.checkValidity();
    }
    public checkValidity() {
        const startedInside: boolean = this.coord.isInRange(5, 5);
        if (this.isRotation()) {
            if (!startedInside) {
                throw new Error('Cannot rotate piece outside the board: ' + this.toString() + '.');
            }
        } else {
            const finishedOutside: boolean = this.coord.getNext(this.moveDirection.get()).isNotInRange(5, 5);
            if (finishedOutside) {
                if (!startedInside) {
                    throw new Error('SiamMove should end or start on the board: ' + this.toString() + '.');
                }
                if (this.moveDirection.get() !== this.landingOrientation) {
                    throw new Error('SiamMove should have moveDirection and landingOrientation matching when a piece goes out of the board: ' + this.toString() + '.');
                }
            }
        }
    }
    public isRotation(): boolean {
        return this.moveDirection.isAbsent();
    }
    public encode(): number {
        return SiamMove.encode(this);
    }
    public decode(encodedMove: number): SiamMove {
        return SiamMove.decode(encodedMove);
    }
    public equals(o: SiamMove): boolean {
        if (this === o) return true;
        if (!this.coord.equals(o.coord)) return false;
        if (this.moveDirection.equals(o.moveDirection, (a, b) => a === b) === false) return false;
        return this.landingOrientation === o.landingOrientation;
    }
    public toString(): string {
        const moveDirection: string = this.moveDirection.isAbsent() ? '-' : this.moveDirection.get().toString();
        return 'SiamMove(' + this.coord.x + ', ' +
                           this.coord.y + ', ' +
                           moveDirection + ', ' +
                           this.landingOrientation + ')';
    }
    public isInsertion(): boolean {
        return this.coord.x === -1 ||
               this.coord.x === +5 ||
               this.coord.y === -1 ||
               this.coord.y === +5;
    }
}

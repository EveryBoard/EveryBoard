import { Move } from 'src/app/jscaip/Move';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class PentagoMove extends MoveCoord {

    public static withRotation(x: number,
                               y: number,
                               blockTurned: number,
                               turnedClockwise: boolean)
    : PentagoMove
    {
        if (blockTurned < 0 || 3 < blockTurned) {
            throw new Error('This block do not exist: ' + blockTurned);
        }
        return new PentagoMove(x, y, MGPOptional.of(blockTurned), turnedClockwise);
    }
    public static rotationless(x: number, y: number): PentagoMove {
        return new PentagoMove(x, y, MGPOptional.empty(), null);
    }
    private constructor(x: number,
                        y: number,
                        public readonly blockTurned: MGPOptional<number>,
                        public readonly turnedClockwise: boolean)
    {
        super(x, y);
        if (this.coord.isNotInRange(6, 6)) {
            throw new Error('The board is a 6 cas wide square, invalid coord: ' + this.coord.toString());
        }
    }

    public toString(): string {
        if (this.blockTurned.isPresent()) {
            return 'PentagoMove(' + this.coord.toString() + ', ' + this.blockTurned.get() + ', ' +
                   (this.turnedClockwise ? 'CLOCKWISE' : 'ANTI-CLOCKWISE') + ')';
        } else {
            return 'PentagoMove' + this.coord.toString();
        }
    }
    public equals(o: PentagoMove): boolean {
        if (this.coord.equals(o.coord) === false) {
            return false;
        }
        if (this.blockTurned.equals(o.blockTurned) === false) {
            return false;
        }
        return this.turnedClockwise === o.turnedClockwise;
    }

}
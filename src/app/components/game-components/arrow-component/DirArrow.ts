import { Direction } from 'src/app/jscaip/Direction';
import { Arrow } from './Arrow';

export class DirArrow extends Arrow<Direction> {

    public override getAngle(dir: Direction): number {
        return Direction.getAngle(dir);
    }

}

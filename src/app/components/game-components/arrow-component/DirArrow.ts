import { Direction } from 'src/app/jscaip/Direction';
import { Arrow } from './Arrow';
import { GameComponentUtils } from '../GameComponentUtils';

export class DirArrow extends Arrow<Direction> {

    public override getAngle(dir: Direction): number {
        return GameComponentUtils.getAngle(dir);
    }

}

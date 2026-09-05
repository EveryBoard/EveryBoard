import { Coord } from '../Coord';
import { Vector } from '../Vector';

import { RectangularShape } from './RectangularShape';

export class ToroidalShape extends RectangularShape {

    public override getNextCoord(coord: Coord, direction: Vector): Coord {
        const naiveNext: Coord = coord.getNext(direction);
        return new Coord(
            ((naiveNext.x % this.width) + this.width) % this.width,
            ((naiveNext.y % this.height) + this.height) % this.height,
        );
    }

}

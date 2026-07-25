import { Coord } from '../Coord';
import { Topology } from '../topology/Topology';

import { Shape, TopologicShape } from './Shape';

export class HexagonalShape extends TopologicShape implements Shape {

    public constructor(
        public readonly side: number,
        topology: Topology,
    ) {
        super(topology);
    }

    public getCenters(): Coord[] { // TODO: unit test
        // X   s=1 c=(0, 0) m=0   min=0 max=0
        //
        // _XX
        // XXX
        // XX_ s=2 c=(1, 1) m=2   min=1 max=3
        //
        // __XXX
        // _XXXX
        // XXXXX
        // XXXX_
        // XXX__ s=3 c=(2, 2) m=4 min=2 max=6
        //
        // ___XXXX
        // __XXXXX
        // _XXXXXX
        // XXXXXXX
        // XXXXXX_
        // XXXXX__
        // XXXX___ s=4 c=(3, 3) m=6 min=3 max=9
        return [
            new Coord(this.side - 1, this.side - 1),
        ];
    }

    public getAllCoords(): Coord[] {
        const coords: Coord[] = [];
        const minyx: number = this.side - 1;
        const maxyx: number = 3 * minyx;
        const maxIndex: number = (this.side - 1) * 2;
        for (let x: number = 0; x <= maxIndex; x++) {
            for (let y: number = 0; y <= maxIndex; y++) {
                if (minyx <= x + y && x + y <= maxyx) {
                    coords.push(new Coord(x, y));
                }
            }
        }
        return coords;
    }

}

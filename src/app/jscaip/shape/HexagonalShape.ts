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

    public getCenters(): Coord[] {
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

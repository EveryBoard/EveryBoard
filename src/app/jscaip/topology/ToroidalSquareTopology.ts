// import { Coord } from '../Coord';
// import { SquareTopology } from './SquareTopology';
// import { Vector } from '../Vector';

// export class ToroidalSquareTopology extends SquareTopology { // TODO: move toricity as a Param of Rectangular Shape

//     public override getNextCoord(coord: Coord, direction: Vector): Coord {
//         const naiveNext: Coord = coord.getNext(direction);
//         return new Coord(
//             ((naiveNext.x % this.width) + this.width) % this.width,
//             ((naiveNext.y % this.height) + this.height) % this.height,
//         );
//     }

// }

import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Coord3D } from 'src/app/jscaip/Coord3D';
import { Encoder } from 'src/app/utils/Encoder';
import { getOptionalEncoder } from 'src/app/utils/MGPOptionalEncoder';

export class PylosCoord extends Coord3D {

    public static encoder: Encoder<PylosCoord> = Coord3D.getEncoder(PylosCoord.from);

    public static optionalEncoder: Encoder<MGPOptional<PylosCoord>> = getOptionalEncoder(PylosCoord.encoder);

    public static MAX_COORD: Coord3D = new Coord3D(3, 3, 3); // Coord3D because (3, 3, 3) is not be legal for Pylos

    public static from(x: number, y: number, z: number): PylosCoord {
        return new PylosCoord(x, y, z);
    }
    public constructor(x: number, y: number, public readonly z: number) {
        super(x, y, z);
        if (x < 0 || x > 3) throw new Error(`PylosCoord: Invalid X: ${x}.`);
        if (y < 0 || y > 3) throw new Error(`PylosCoord: Invalid Y: ${y}.`);
        if (z < 0 || z > 3) throw new Error(`PylosCoord: Invalid Z: ${z}.`);
        const floorSize: number = 4 - z;
        if (this.isNotInRange(floorSize, floorSize)) throw new Error(this.toString() + ' is not in range.');
    }
    public toString(): string {
        return 'PylosCoord' + this.toShortString();
    }
    public getLowerPieces(): PylosCoord[] {
        if (this.z === 0) throw new Error(`PylosCoord: floor pieces don't have lower pieces.`);
        const lowerZ: number = this.z - 1;
        const upLeft: PylosCoord = new PylosCoord(this.x, this.y, lowerZ);
        const upRight: PylosCoord = new PylosCoord(this.x + 1, this.y, lowerZ);
        const downLeft: PylosCoord = new PylosCoord(this.x, this.y + 1, lowerZ);
        const downRight: PylosCoord = new PylosCoord(this.x + 1, this.y + 1, lowerZ);
        return [upLeft, upRight, downLeft, downRight];
    }
    public getHigherCoords(): PylosCoord[] {
        if (this.z === 3) throw new Error(`Top piece don't have lower pieces.`);
        const higherZ: number = this.z + 1;
        const upLeft: Coord = new Coord(this.x - 1, this.y - 1);
        const upRight: Coord = new Coord(this.x, this.y - 1);
        const downLeft: Coord = new Coord(this.x - 1, this.y);
        const downRight: Coord = new Coord(this.x, this.y);
        const levelSize: number = 4 - higherZ;
        return [upLeft, upRight, downLeft, downRight]
            .filter((coord: Coord) => coord.isInRange(levelSize, levelSize))
            .map((c: Coord) => new PylosCoord(c.x, c.y, higherZ));
    }
    public getNextValid(dir: Orthogonal): MGPOptional<PylosCoord> {
        const xyNext: Coord = new Coord(this.x, this.y).getNext(dir);
        const floorSize: number = 4 - this.z;
        if (xyNext.isNotInRange(floorSize, floorSize)) {
            return MGPOptional.empty();
        } else {
            return MGPOptional.of(new PylosCoord(xyNext.x, xyNext.y, this.z));
        }
    }
}

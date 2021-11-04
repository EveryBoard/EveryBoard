import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';

export class PylosCoord extends Coord {
    public static encodeOptional(optionalCoord: MGPOptional<PylosCoord>): number {
        let result: number;
        if (optionalCoord.isPresent()) {
            result = PylosCoord.encode(optionalCoord.get()) + 1; // From 1 to 64
        } else {
            result = 0;
        } // result from 0 to 64
        return result;
    }
    public static encode(coord: PylosCoord): number {
        const z: number = coord.z;
        const y: number = coord.y * 4;
        const x: number = coord.x * 16;
        return x + y + z; // from 0 to 63
    }
    public static decodeToOptional(encodedOptional: number): MGPOptional<PylosCoord> {
        if (encodedOptional === 0) {
            return MGPOptional.empty();
        }
        return MGPOptional.of(PylosCoord.decode(encodedOptional - 1));
    }
    public static decode(coord: number): PylosCoord {
        const z: number = coord % 4;
        coord -= z; coord /= 4;

        const y: number = coord % 4;
        coord -= y; coord /= 4;

        const x: number = coord;

        return new PylosCoord(x, y, z);
    }
    constructor(x: number, y: number, public readonly z: number) {
        super(x, y);
        if (x < 0 || x > 3) throw new Error(`PylosCoord: Invalid X: ${x}.`);
        if (y < 0 || y > 3) throw new Error(`PylosCoord: Invalid Y: ${y}.`);
        if (z < 0 || z > 3) throw new Error(`PylosCoord: Invalid Z: ${z}.`);
        const floorSize: number = 4 - z;
        if (this.isNotInRange(floorSize, floorSize)) throw new Error(this.toString() + ' is not in range.');
    }
    public toString(): string {
        return 'PylosCoord' + this.toShortString();
    }
    public toShortString(): string {
        return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
    }
    public equals(obj: PylosCoord): boolean {
        if (this === obj) return true;
        if (obj.x !== this.x) return false;
        if (obj.y !== this.y) return false;
        return obj.z === this.z;
    }
    public isUpperThan(p: PylosCoord): boolean {
        return this.z > p.z;
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
    public getHigherPieces(): PylosCoord[] {
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

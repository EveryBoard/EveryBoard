import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from '../utils/MGPOptional';

export class CoordXYZ extends Coord {

    public static encodeOptional(optionalCoord: MGPOptional<CoordXYZ>, maxCoord: CoordXYZ): number {
        let result: number;
        if (optionalCoord.isPresent()) {
            result = CoordXYZ.encode(optionalCoord.get(), maxCoord) + 1; // From 1 to (N + 1)
        } else {
            result = 0;
        } // result from 0 to (N + 1)
        return result;
    }
    public static encode(coord: CoordXYZ, maxCoord: CoordXYZ): number {
        const z: number = coord.z;
        const y: number = coord.y * (maxCoord.z + 1);
        const x: number = coord.x * (maxCoord.z + 1) * (maxCoord.y + 1);
        return x + y + z;
    }
    constructor(x: number, y: number, public readonly z: number) {
        super(x, y);
    }
    public toString(): string {
        return 'CoordXYZ' + this.toShortString();
    }
    public toShortString(): string {
        return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
    }
    public equals(o: CoordXYZ): boolean {
        if (this === o) return true;
        if (o.x !== this.x) return false;
        if (o.y !== this.y) return false;
        return o.z === this.z;
    }
    public isUpperThan(p: CoordXYZ): boolean {
        return this.z > p.z;
    }
}

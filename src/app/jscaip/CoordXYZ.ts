import { Coord } from 'src/app/jscaip/Coord';

export class CoordXYZ extends Coord {

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

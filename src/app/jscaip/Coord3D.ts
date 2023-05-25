import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from '../utils/Encoder';
import { MGPFallible } from '../utils/MGPFallible';

export class Coord3D extends Coord {

    public static getCoord3DEncoder<T extends Coord3D>(generate: (x: number, y: number, z: number) => MGPFallible<T>)
    : Encoder<T>
    {
        return Encoder.tuple(
            [Encoder.identity<number>(), Encoder.identity<number>(), Encoder.identity<number>()],
            (coord: T): [number, number, number] => [coord.x, coord.y, coord.z],
            (fields: [number, number, number]): T => generate(fields[0], fields[1], fields[2]).get(),
        );
    }
    public static from(x: number, y: number, z: number): MGPFallible<Coord3D> {
        return MGPFallible.success(new Coord3D(x, y, z));
    }
    public constructor(x: number, y: number, public readonly z: number) {
        super(x, y);
    }
    public override toString(): string {
        return 'Coord3D' + this.toShortString();
    }
    public toShortString(): string {
        return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
    }
    public override equals(other: Coord3D): boolean {
        if (this === other) return true;
        if (other.x !== this.x) return false;
        if (other.y !== this.y) return false;
        return other.z === this.z;
    }
    public isHigherThan(other: Coord3D): boolean {
        return this.z > other.z;
    }
}

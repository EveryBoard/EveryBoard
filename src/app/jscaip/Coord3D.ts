import { Coord } from 'src/app/jscaip/Coord';
import { assert } from '../utils/assert';
import { Encoder } from '../utils/Encoder';
import { JSONObject, JSONValue, JSONValueWithoutArray } from '../utils/utils';

export class Coord3D extends Coord {

    public static getEncoder<T extends Coord3D>(generateMove: (x: number, y: number, z: number) => T): Encoder<T> {
        return new class extends Encoder<T> {

            public encode(coord: T): JSONValueWithoutArray {
                return {
                    x: coord.x,
                    y: coord.y,
                    z: coord.z,
                };
            }
            public decode(encoded: JSONValue): T {
                const casted: JSONObject = encoded as JSONObject;
                assert(casted.x != null && typeof casted.x === 'number' &&
                       casted.y != null && typeof casted.y === 'number' &&
                       casted.z != null && typeof casted.z === 'number',
                       'Invalid encoded Coord3D');
                return generateMove(casted.x as number, casted.y as number, casted.z as number);
            }
        };
    }

    public static of(x: number, y: number, z: number): Coord3D {
        return new Coord3D(x, y, z);
    }
    public constructor(x: number, y: number, public readonly z: number) {
        super(x, y);
    }
    public toString(): string {
        return 'Coord3D' + this.toShortString();
    }
    public toShortString(): string {
        return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
    }
    public equals(other: Coord3D): boolean {
        if (this === other) return true;
        if (other.x !== this.x) return false;
        if (other.y !== this.y) return false;
        return other.z === this.z;
    }
    public isHigherThan(other: Coord3D): boolean {
        return this.z > other.z;
    }
}

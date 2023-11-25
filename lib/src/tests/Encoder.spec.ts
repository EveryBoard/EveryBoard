/* eslint-disable max-lines-per-function */
import { ArrayUtils } from '../ArrayUtils';
import { ComparableObject, comparableEquals } from '../Comparable';
import { Encoder } from '../Encoder';
import { JSONValue } from '../JSON';
import { Pair } from './Pair.spec';

export class EncoderTestUtils {
    public static expectToBeBijective<T>(encoder: Encoder<T>, value: T): void {
        const encoded: JSONValue = encoder.encode(value);
        const decoded: T = encoder.decode(encoded);
        expect(comparableEquals(decoded, value)).withContext(`Expected decoded value (${decoded}) to be ${value}`).toBeTrue();
    }
}

class Triplet implements ComparableObject {
    public constructor(public elements: [number, number, number]) {
    }

    public equals(other: Triplet): boolean {
        return ArrayUtils.compare(this.elements, other.elements);
    }
}

describe('Encoder', () => {
    describe('tuple', () => {
        const numberEncoder: Encoder<number> = Encoder.identity<number>();

        const pairEncoder: Encoder<Pair> = Encoder.tuple(
            [numberEncoder, numberEncoder],
            (pair: Pair): [number, number] => [pair.first, pair.second],
            (fields: [number, number]): Pair => new Pair(fields[0], fields[1]));


        const tripletEncoder: Encoder<Triplet> =
            Encoder.tuple(
                [numberEncoder, numberEncoder, numberEncoder],
                (move: Triplet): [number, number, number] => move.elements,
                (fields: [number, number, number]): Triplet => new Triplet(fields));

        it('should successfully encode and decode', () => {
            EncoderTestUtils.expectToBeBijective(pairEncoder, new Pair(0, 2));
            EncoderTestUtils.expectToBeBijective(tripletEncoder, new Triplet([0, 3, 4]));
        });
    });

    describe('disjunction', () => {
        const encoder1: Encoder<number> = Encoder.identity<number>();
        function is1(value : number | boolean): value is number {
            return typeof(value) === 'number';
        }
        const encoder2: Encoder<boolean> = Encoder.identity<boolean>();
        function is2(value : number | boolean): value is boolean {
            return typeof(value) === 'boolean';
        }
        const encoder: Encoder<number | boolean> = Encoder.disjunction([is1, is2], [encoder1, encoder2]);

        it('should have a bijective encoder', () => {
            const disjunctedValues: (number | boolean)[] = [0, 1, 3, true, false];

            for (const disjunctedValue of disjunctedValues) {
                EncoderTestUtils.expectToBeBijective(encoder, disjunctedValue);
            }
        });
    });
});

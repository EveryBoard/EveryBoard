/* eslint-disable max-lines-per-function */
import { ArrayUtils } from '../ArrayUtils';
import { ComparableObject } from '../Comparable';
import { Encoder } from '../Encoder';
import { EncoderTestUtils } from './EncoderTestUtils';
import { JSONValueWithoutArray } from '../JSON';

import { Pair } from './Pair.spec';

class Triplet implements ComparableObject {
    public constructor(public elements: [number, number, number]) {
    }

    public equals(other: Triplet): boolean {
        return ArrayUtils.equals(this.elements, other.elements);
    }
}

describe('Encoder', () => {

    describe('fromFunction', () => {
        it('should provide a bijective encoder', () => {
            function encode(v: number): JSONValueWithoutArray {
                return v;
            }
            function decode(v: JSONValueWithoutArray): number {
                return v as number;
            }
            const encoder: Encoder<number> = Encoder.fromFunctions(encode, decode);
            EncoderTestUtils.expectToBeBijective(encoder, 42);
        });
    });

    describe('identity', () => {
        it('should provide a bijective encoder', () => {
            const encoder: Encoder<number> = Encoder.identity();
            EncoderTestUtils.expectToBeBijective(encoder, 42);
        });
    });

    describe('constant', () => {
        it('should provide a bijective encoder', () => {
            const encoder: Encoder<number> = Encoder.constant(42, 42);
            EncoderTestUtils.expectToBeBijective(encoder, 42);
        });
    });

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

        it('should provide a bijective encoder', () => {
            EncoderTestUtils.expectToBeBijective(pairEncoder, new Pair(0, 2));
            EncoderTestUtils.expectToBeBijective(tripletEncoder, new Triplet([0, 3, 4]));
        });

    });

    describe('disjunction', () => {
        const numberEncoder: Encoder<number> = Encoder.identity<number>();
        function isNumber(value : number | boolean): value is number {
            return typeof(value) === 'number';
        }
        const booleanEncoder: Encoder<boolean> = Encoder.identity<boolean>();
        function isBoolean(value : number | boolean): value is boolean {
            return typeof(value) === 'boolean';
        }
        const encoder: Encoder<number | boolean> = Encoder.disjunction([isNumber, isBoolean],
                                                                       [numberEncoder, booleanEncoder]);

        it('should provide a bijective encoder', () => {
            const disjunctedValues: (number | boolean)[] = [0, 1, 3, true, false];

            for (const disjunctedValue of disjunctedValues) {
                EncoderTestUtils.expectToBeBijective(encoder, disjunctedValue);
            }
        });

        it('should fail if no matcher matches', () => {
            const value: number | boolean = 4;
            // This encoder is wrong because the typecheck is twice "isBoolean".
            // Because we have a number, none of the typechecks will match, and we should have an error
            const wrongEncoder : Encoder<number | boolean> = Encoder.disjunction([isBoolean, isBoolean],
                                                                                 [numberEncoder, booleanEncoder]);
            expect(() => wrongEncoder.encode(value)).toThrowError('cannot encode value: 4');
        });

        it('should throw a clear error when the type index in encoded data is out of bounds', () => {
            // Given a disjunction encoder over 2 variants
            // When decoding invalid data with an out-of-range type index
            const invalid: JSONValueWithoutArray = { type: 99, encoded: 42 };
            // Then it should throw a descriptive error
            expect(() => encoder.decode(invalid)).toThrowError('Assertion failure: Encoders.disjunction got invalid data: 99 is not an existing type');
        });
    });

    describe('list', () => {
        const baseEncoder: Encoder<number> = Encoder.identity();
        const encoder: Encoder<Array<number>> = Encoder.list(baseEncoder);

        it('should provide a bijective encoder', () => {
            EncoderTestUtils.expectToBeBijective(encoder, [1, 2, 3]);
        });

        it('should throw a clear error when decoding a non-array', () => {
            // When decoding a non-array value (e.g. corrupted/wrong JSON)
            // Then it should throw a descriptive error
            expect(() => encoder.decode(42)).toThrowError('Assertion failure: Encoders.list got invalid data 42 is not an array');
            expect(() => encoder.decode(null)).toThrowError('Assertion failure: Encoders.list got invalid data null is not an array');
        });
    });

});

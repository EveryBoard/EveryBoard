/* eslint-disable max-lines-per-function */
import { Encoder, MoveEncoder } from '../Encoder';
import { MGPOptional } from '../MGPOptional';
import { EncoderTestUtils } from './Encoder.spec';

describe('MGPOptional', () => {

    it('MGPOptional.get should throw if empty', () => {
        const optional: MGPOptional<string> = MGPOptional.empty();
        expect(() => optional.get()).toThrowError('Value is absent');
    });
    describe('toString', () => {
        it('should succeed for empty values', () => {
            expect(MGPOptional.empty<string>().toString()).toBe('MGPOptional.empty()');
        });
        it('should rely include value for non-empty values', () => {
            expect(MGPOptional.of('foo').toString()).toBe('MGPOptional.of(foo)');
        });
    });
    describe('getEncoder', () => {
        it('should give a bijective encoder', () => {
            const encoder: Encoder<MGPOptional<number>> = MGPOptional.getEncoder(MoveEncoder.identity());
            EncoderTestUtils.expectToBeBijective(encoder, MGPOptional.empty());
            EncoderTestUtils.expectToBeBijective(encoder, MGPOptional.of(5));
        });
    });
});

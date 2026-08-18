import { JSONValue, MGPValidation } from '@everyboard/lib';

import { MGPValidators } from '../../utils/MGPValidator';
import { BooleanConfig } from '../BooleanConfig';
import { NumberConfig } from '../NumberConfig';

describe('ConfigLine', () => {

    describe('NumberConfig', () => {

        it('should accept numbers', () => {
            // Given a NumberConfig and a corresponding value
            const configLine: NumberConfig = new NumberConfig(42, () => 'some number', MGPValidators.range(0, 100));
            const value: JSONValue = 10;
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value);
            // Then it should succeed
            expect(validity.isSuccess()).toBeTrue();
        });

        it('should reject anything else', () => {
            // Given a NumberConfig and a corresponding value
            const configLine: NumberConfig = new NumberConfig(42, () => 'some number', MGPValidators.range(0, 100));
            const value: JSONValue = 'hello';
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value);
            // Then it should fail
            expect(validity.isSuccess()).toBeFalse();
            expect(validity.getReason()).toEqual('NumberConfig expects a number value');
        });
    });

    describe('BooleanConfig', () => {

        it('should accept booleans', () => {
            // Given a BooleanConfig and a corresponding value
            const configLine: BooleanConfig = new BooleanConfig(true, () => 'some boolean');
            const value: JSONValue = true;
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value);
            // Then it should succeed
            expect(validity.isSuccess()).toBeTrue();
        });

        it('should reject anything else', () => {
            // Given a BooleanConfig and a corresponding value
            const configLine: BooleanConfig = new BooleanConfig(true, () => 'some boolean');
            const value: JSONValue = 42;
            // When checking its validity
            const validity: MGPValidation = configLine.checkValidity(value);
            // Then it should fail
            expect(validity.isSuccess()).toBeFalse();
            expect(validity.getReason()).toEqual('BooleanConfig expects a boolean value');
        });
    });
});

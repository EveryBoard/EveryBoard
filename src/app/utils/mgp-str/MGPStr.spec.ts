import { MGPStr } from './MGPStr';

describe('MGPStr', () => {
    it('Equals should recognize the variable first', () => {
        const stringUnderTest: MGPStr = new MGPStr('Salut');

        expect(stringUnderTest.equals(stringUnderTest)).toBeTrue();
    });
});

import { MGPStr } from './MGPStr';

describe('MGPStr', () => {
    it('Equals should recognize the variable first', () => {
        const stringUnderTest: MGPStr = new MGPStr('Salut');

        expect(stringUnderTest.equals(stringUnderTest)).toBeTrue();
    });
    it('Equals should refuse object of wrong type then', () => {
        const content = 'Salut';
        const stringUnderTest: MGPStr = new MGPStr(content);

        expect(stringUnderTest.equals(content)).toBeFalse();
    });
});

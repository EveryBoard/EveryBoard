/* eslint-disable max-lines-per-function */
import { EloPipe } from '../elo.pipe';

describe('EloPipe', () => {
    let pipe: EloPipe;
    beforeEach(() => {
        pipe = new EloPipe();
    });

    it('should create', () => {
        expect(pipe).toBeTruthy();
    });

    it('should format number without decimals but with commas', () => {
        expect(pipe.transform(1000)).toBe('1,000');
        expect(pipe.transform(1234.56)).toBe('1,235');
    });

    it('should round correctly', () => {
        expect(pipe.transform(1.4)).toBe('1');
        expect(pipe.transform(1.5)).toBe('2');
    });


});

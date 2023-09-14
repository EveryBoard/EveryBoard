/* eslint-disable max-lines-per-function */
import { AwaleMove } from '../AwaleMove';

describe('AwaleMove', () => {
    it('should override equals correctly', () => {
        const move: AwaleMove = AwaleMove.of(0);
        const other: AwaleMove = AwaleMove.of(1);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });
});

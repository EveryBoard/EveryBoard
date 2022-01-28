/* eslint-disable max-lines-per-function */
import { FirstPlayer } from './Joiner';

describe('FirstPlayer', () => {

    it('should create the values corresponding to their string representation', () => {
        for (const firstPlayer of ['CREATOR', 'RANDOM', 'CHOSEN_PLAYER']) {
            expect(FirstPlayer.of(firstPlayer).value).toBe(firstPlayer);
        }
    });
    it('should throw when creating an invalid first player', () => {
        expect(() => FirstPlayer.of('BLI')).toThrow();
    });
});

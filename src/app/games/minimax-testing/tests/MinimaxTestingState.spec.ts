import { MinimaxTestingState } from '../MinimaxTestingState';

describe('MinimaxTestingState', () => {
    it('should throw when created without location', () => {
        expect(() => new MinimaxTestingState(0, null)).toThrowError('location cannot be null');
    });
});

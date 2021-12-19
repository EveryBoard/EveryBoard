import { Coord } from 'src/app/jscaip/Coord';
import { MinimaxTestingState } from '../MinimaxTestingState';

describe('MinimaxTestingState', () => {
    it('should successfully be created', () => {
        expect(new MinimaxTestingState(0, new Coord(0, 0))).toBeTruthy();
    });
});

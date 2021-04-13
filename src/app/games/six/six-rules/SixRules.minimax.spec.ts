import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { SixGameState } from '../six-game-state/SixGameState';
import { SixMove } from '../six-move/SixMove';
import { SixRules } from './SixRules';

describe('Six.Minimax', () => {

    let rules: SixRules;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(() => {
        rules = new SixRules(SixGameState);
    });
    it('Score should be neutral before 40th for now', () => {
        const state: SixGameState = SixGameState.getInitialSlice();
        expect(rules.getBoardValue(SixMove.fromDrop(new Coord(1, 1)), state)).toBe(0);
    });
    it('Score after 40th turn should be a substraction of the number of piece', () => {
        const state: SixGameState = SixGameState.fromRepresentation([
            [X, X, X, X, O, O, O, O, O],
            [X, X, X, X, O, O, O, O, O],
        ], 40);
        expect(rules.getBoardValue(SixMove.fromDrop(new Coord(1, 1)), state)).toBe(-2);
    });
});

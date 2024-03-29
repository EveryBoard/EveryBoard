import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RectanglzMove } from '../RectanglzMove';
import { RectanglzMoveGenerator } from '../RectanglzMoveGenerator';
import { RectanglzConfig, RectanglzNode, RectanglzRules } from '../RectanglzRules';
import { RectanglzState } from '../RectanglzState';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('RectanglzMoveGenerator', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let moveGenerator: RectanglzMoveGenerator;
    const defaultConfig: MGPOptional<RectanglzConfig> = RectanglzRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new RectanglzMoveGenerator();
    });

    it('should have all move options', () => {
        // Given an initial node
        const initialState: RectanglzState = RectanglzRules.get().getInitialState(defaultConfig);
        const node: RectanglzNode = new RectanglzNode(initialState);

        // When listing the moves
        const moves: RectanglzMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be 16 moves (6 duplications, 10 jumps)
        expect(moves.length).toBe(16);
    });

    it('should provide move', () => {
        // Given state
        const state: RectanglzState = new RectanglzState([
            [X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, O],
            [O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O],
            [O, O, X, X, O, X, O, O],
            [O, X, X, X, O, X, X, X],
            [O, X, O, X, X, X, _, X],
            [O, X, O, X, X, X, X, X],
        ], 100);
        const node: RectanglzNode = new RectanglzNode(state);

        // When calling getListMoves
        const moves: RectanglzMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be 4 moves (all jumps)
        expect(moves.length).toBe(4);
    });

    it('should have only one duplication by landing space');

});

import { RectanglzMove } from '../RectanglzMove';
import { RectanglzMoveGenerator } from '../RectanglzMoveGenerator';
import { RectanglzNode, RectanglzRules } from '../RectanglzRules';
import { RectanglzState } from '../RectanglzState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

xdescribe('RectanglzMoveGenerator', () => {

    let moveGenerator: RectanglzMoveGenerator;
    const defaultConfig: NoConfig = RectanglzRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new RectanglzMoveGenerator();
    });

    it('should have all move options', () => {
        // Given an initial node
        const initialState: RectanglzState = RectanglzRules.get().getInitialState();
        const node: RectanglzNode = new RectanglzNode(initialState);

        // When listing the moves
        const moves: RectanglzMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be this many moves
        expect(moves.length).toBe(16);
    });

    it('should have only one duplication by landing space');

});

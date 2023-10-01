import { DiaballikMove } from '../DiaballikMove';
import { DiaballikMoveGenerator } from '../DiaballikMoveGenerator';
import { DiaballikNode } from '../DiaballikRules';
import { DiaballikState } from '../DiaballikState';

fdescribe('DiaballikMoveGenerator', () => {

    let moveGenerator: DiaballikMoveGenerator;

    beforeEach(() => {
        moveGenerator = new DiaballikMoveGenerator();
    });
    it('should have all interesting 3-step options at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikState.getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node);

        // Then it should have all interesting 3-step options, which is 136 moves
        expect(moves.length).toBe(136);
    });
});

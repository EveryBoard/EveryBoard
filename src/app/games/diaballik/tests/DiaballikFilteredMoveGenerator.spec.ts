import { DiaballikMove } from '../DiaballikMove';
import { DiaballikFilteredMoveGenerator } from '../DiaballikFilteredMoveGenerator';
import { DiaballikNode } from '../DiaballikRules';
import { DiaballikState } from '../DiaballikState';

describe('DiaballikFilteredMoveGenerator', () => {

    let moveGenerator: DiaballikFilteredMoveGenerator;

    beforeEach(() => {
        moveGenerator = new DiaballikFilteredMoveGenerator();
    });
    it('should have only 3 step moves', () => {
        // Given a node
        const node: DiaballikNode = new DiaballikNode(DiaballikState.getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node);

        // Then it should have only 3-step moves
        function has3Steps(move: DiaballikMove): boolean {
            return move.getSubMoves().length === 3;
        }
        expect(moves.every(has3Steps)).toBeTrue();
    });
    it('should have all 3-step move options at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikState.getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node);

        // Then it should have all interesting move options, which is 368 moves
        expect(moves.length).toBe(368);
    });
});

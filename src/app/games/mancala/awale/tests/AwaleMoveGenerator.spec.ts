import { Table } from 'src/app/jscaip/TableUtils';
import { MancalaState } from '../../common/MancalaState';
import { AwaleMove } from '../AwaleMove';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { AwaleNode } from '../AwaleRules';

describe('AwaleMoveGenerator', () => {

    let moveGenerator: AwaleMoveGenerator;

    beforeEach(() => {
        moveGenerator = new AwaleMoveGenerator();
    });
    it('should not generate illegal moves', () => {
        // Given a state with an illegal distribution due to the do-not-starve rule
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When listing the moves
        const moves: AwaleMove[] = moveGenerator.getListMoves(node);
        // Then only the legal moves should be present
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(AwaleMove.FIVE);
    });
});

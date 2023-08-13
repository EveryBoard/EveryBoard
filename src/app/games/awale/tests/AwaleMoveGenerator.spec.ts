/* eslint-disable max-lines-per-function */
import { AwaleNode } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwaleState } from '../AwaleState';
import { Table } from 'src/app/utils/ArrayUtils';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';

describe('AwaleMinimax', () => {

    let moveGenerator: AwaleMoveGenerator;

    beforeEach(() => {
        moveGenerator = new AwaleMoveGenerator();
    });
    it('should not try to perform illegal moves', () => {
        // Given a state with an illegal distribution due to the do-not-starve rule
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 1, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When listing the moves
        const moves: AwaleMove[] = moveGenerator.getListMoves(node);
        // Then only the legal moves should be present
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(AwaleMove.FIVE);
    });
});

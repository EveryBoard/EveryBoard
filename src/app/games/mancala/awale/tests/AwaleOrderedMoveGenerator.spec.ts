/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { MancalaState } from '../../common/MancalaState';
import { AwaleMove } from '../AwaleMove';
import { AwaleNode, AwaleRules } from '../AwaleRules';
import { AwaleOrderedMoveGenerator } from '../AwaleOrderedMoveGenerator';
import { MancalaConfig } from '../../common/MancalaConfig';

describe('AwaleOrderedMoveGenerator', () => {

    let moveGenerator: AwaleOrderedMoveGenerator;
    const config: MancalaConfig = AwaleRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

    beforeEach(() => {
        moveGenerator = new AwaleOrderedMoveGenerator();
    });
    it('should order by captured houses', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 2],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0], config);
        const node: AwaleNode = new AwaleNode(state);
        // When listing the moves
        const moves: AwaleMove[] = moveGenerator.getListMoves(node);
        // Then the first move should be the capture
        expect(moves.length).toBe(2);
        expect(moves[0]).toEqual(AwaleMove.of(5));
    });
});

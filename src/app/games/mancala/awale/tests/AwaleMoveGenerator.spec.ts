import { Table } from 'src/app/utils/ArrayUtils';
import { MancalaState } from '../../common/MancalaState';
import { AwaleMove } from '../AwaleMove';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { AwaleNode, AwaleRules } from '../AwaleRules';
import { MancalaConfig } from '../../common/MancalaConfig';

describe('AwaleMoveGenerator', () => {

    let moveGenerator: AwaleMoveGenerator;
    const config: MancalaConfig = AwaleRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

    beforeEach(() => {
        moveGenerator = new AwaleMoveGenerator();
    });
    it('should not generate illegal moves', () => {
        // Given a state with an illegal distribution due to the do-not-starve rule
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0], config);
        const node: AwaleNode = new AwaleNode(state);
        // When listing the moves
        const moves: AwaleMove[] = moveGenerator.getListMoves(node);
        // Then only the legal moves should be present
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(AwaleMove.of(5));
    });
});

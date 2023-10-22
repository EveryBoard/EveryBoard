import { Table } from 'src/app/utils/ArrayUtils';
import { MancalaState } from '../../common/MancalaState';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { AwaleRules } from '../AwaleRules';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaNode } from '../../common/MancalaRules';

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
        const node: MancalaNode = new MancalaNode(state);
        // When listing the moves
        const moves: MancalaMove[] = moveGenerator.getListMoves(node);
        // Then only the legal moves should be present
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(MancalaMove.of(MancalaDistribution.of(5)));
    });
});

/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { MancalaState } from '../../common/MancalaState';
import { AwaleOrderedMoveGenerator } from '../AwaleOrderedMoveGenerator';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaNode } from '../../common/MancalaRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaConfig } from '../../common/MancalaConfig';
import { AwaleRules } from '../AwaleRules';

fdescribe('AwaleOrderedMoveGenerator', () => {

    let moveGenerator: AwaleOrderedMoveGenerator;
    const defaultConfig: MGPOptional<MancalaConfig> = AwaleRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new AwaleOrderedMoveGenerator();
    });

    it('should order by captured houses', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 2],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0]);
        const node: MancalaNode = new MancalaNode(state);

        // When listing the moves
        const moves: MancalaMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the first move should be the capture
        expect(moves.length).toBe(2);
        expect(moves[0]).toEqual(MancalaMove.of(MancalaDistribution.of(5)));
    });

});

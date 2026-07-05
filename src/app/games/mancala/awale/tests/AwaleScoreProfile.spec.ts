/* eslint-disable max-lines-per-function */
import { MGPValidation } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { Minimax } from '../../../../jscaip/AI/Minimax';
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { Table } from '../../../../jscaip/TableUtils';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaNode } from '../../common/MancalaRules';
import { MancalaScoreHeuristic } from '../../common/MancalaScoreHeuristic';
import { MancalaState } from '../../common/MancalaState';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { AwaleRules } from '../AwaleRules';

describe('Awale score profile', () => {

    let rules: AwaleRules;
    let minimax: Minimax<MancalaMove, MancalaState, MancalaConfig>;
    const level2: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };
    const defaultConfig: MancalaConfig = AwaleRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = AwaleRules.get();
        minimax = new Minimax($localize`Score`,
                              rules,
                              new MancalaScoreHeuristic(),
                              new AwaleMoveGenerator());
        minimax.configureFromConfig({ useTranspositionTables: false });
    });

    it('should not throw at first choice', () => {
        const node: MancalaNode = rules.getInitialNode(defaultConfig);
        const bestMove: MancalaMove = minimax.chooseNextMove(node, level2, defaultConfig);
        const legality: MGPValidation = rules.isLegal(bestMove,
                                                      node.gameState,
                                                      defaultConfig);
        expect(legality.isSuccess()).toBeTrue();
    });

    it('should choose capture when possible (at depth 2)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [0, 0, 0, 0, 3, 1],
            [0, 0, 0, 0, 1, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(0, 0));
        const node: MancalaNode = new MancalaNode(state);
        // When getting the best move
        const bestMove: MancalaMove = minimax.chooseNextMove(node, level2, defaultConfig);
        // Then the best move should be the capture
        expect(bestMove).toEqual(MancalaMove.of(MancalaDistribution.of(4)));
    });

    it('should prioritize moves in the same territory when no captures are possible', () => {
        const state: MancalaState = new MancalaState([
            [1, 0, 0, 0, 0, 7],
            [0, 1, 0, 0, 0, 0],
        ], 1, PlayerNumberMap.of(0, 0));
        const node: MancalaNode = new MancalaNode(state);

        expect(minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 }, defaultConfig))
            .toEqual(MancalaMove.of(MancalaDistribution.of(0)));
    });

});

/* eslint-disable max-lines-per-function */
import { AwaleRules } from '../AwaleRules';
import { MancalaState } from 'src/app/games/mancala/common/MancalaState';
import { Table } from 'src/app/utils/ArrayUtils';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { Minimax } from 'src/app/jscaip/Minimax';
import { MancalaScoreMinimax } from '../../common/MancalaScoreMinimax';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaNode } from '../../common/MancalaRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';

describe('AwaleScoreMinimax', () => {

    let rules: AwaleRules;
    let minimax: Minimax<MancalaMove, MancalaState>;
    const level1: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const level2: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };
    const defaultConfig: MGPOptional<MancalaConfig> = AwaleRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = AwaleRules.get();
        minimax = new MancalaScoreMinimax(rules, new AwaleMoveGenerator());
    });

    it('should not throw at first choice', () => {
        const node: MancalaNode = rules.getInitialNode(defaultConfig);
        const bestMove: MancalaMove = minimax.chooseNextMove(node, level2);
        const legality: MGPValidation = rules.isLegal(bestMove,
                                                      AwaleRules.get().getInitialState(defaultConfig),
                                                      defaultConfig.get());
        expect(legality.isSuccess()).toBeTrue();
    });

    it('should choose capture when possible (at depth 1)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 1],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0]);
        const node: MancalaNode = new MancalaNode(state, undefined, undefined, defaultConfig);
        // When getting the best move
        const bestMove: MancalaMove = minimax.chooseNextMove(node, level1);
        // Then the best move should be the capture
        expect(bestMove).toEqual(MancalaMove.of(MancalaDistribution.of(2)));
    });

    it('should choose capture when possible (at depth 2)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [0, 0, 0, 0, 3, 1],
            [0, 0, 0, 0, 1, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0]);
        const node: MancalaNode = new MancalaNode(state, undefined, undefined, defaultConfig);
        // When getting the best move
        const bestMove: MancalaMove = minimax.chooseNextMove(node, level2);
        // Then the best move should be the capture
        expect(bestMove).toEqual(MancalaMove.of(MancalaDistribution.of(4)));
    });

    it('should prioritize moves in the same territory when no captures are possible', () => {
        // Given a state with only one move that distributes only in the player's territory
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 7],
            [0, 1, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0]);
        const node: MancalaNode = new MancalaNode(state, undefined, undefined, defaultConfig);
        // When getting the best move
        const bestMove: MancalaMove = minimax.chooseNextMove(node, level1);
        // Then the best move should be the capture
        expect(bestMove).toEqual(MancalaMove.of(MancalaDistribution.of(0)));
    });

});

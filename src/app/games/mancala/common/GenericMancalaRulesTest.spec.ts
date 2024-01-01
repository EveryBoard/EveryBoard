/* eslint-disable max-lines-per-function */
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MancalaState } from './MancalaState';
import { MancalaMove } from './MancalaMove';
import { MancalaFailure } from './MancalaFailure';
import { Player } from 'src/app/jscaip/Player';
import { GameNode } from 'src/app/jscaip/GameNode';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MancalaConfig } from './MancalaConfig';
import { MancalaNode, MancalaRules } from './MancalaRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class MancalaRulesTestEntries {
    gameName: string; // 'Awale', 'Kalah', etc
    rules: MancalaRules;
    simpleMove: MancalaMove;
}
export function DoMancalaRulesTests(entries: MancalaRulesTestEntries): void {

    describe(entries.gameName + ' rules generic tests', () => {

        const rules: MancalaRules = entries.rules;
        const defaultConfig: MGPOptional<MancalaConfig> = entries.rules.getDefaultRulesConfig();

        it('should allow simple move', () => {
            // Given any board
            const state: MancalaState = entries.rules.getInitialState(defaultConfig);

            // When doing a simple move
            const move: MancalaMove = entries.simpleMove;

            // Then the seed should be distributed
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [4, 5, 5, 5, 5, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, PlayerNumberMap.of(0, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should refuse distributing empty space', () => {
            // Given a board where 'simpleMove' would be illegal, distributing an empty house
            const board: number[][] = [
                [4, 0, 4, 4, 4, 4],
                [4, 0, 4, 4, 4, 0],
            ];
            const state: MancalaState = new MancalaState(board, 0, PlayerNumberMap.of(0, 0));

            // When attempting to distribute empty space
            const move: MancalaMove = entries.simpleMove;

            // Then it should be illegal
            const reason: string = MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        describe('getGameStatus', () => {

            it('should identify victory for player 0', () => {
                // Given a state with no more seeds and where player 0 has captured more seeds
                const board: Table<number> = [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ];
                const state: MancalaState = new MancalaState(board, 6, PlayerNumberMap.of(26, 22));
                const node: MancalaNode = new GameNode(state);
                // Then it should be a victory for player 0
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
            });

            it('should identify victory for player 1', () => {
                // Given a state with no more seeds and where player 1 has captured more seeds
                const board: Table<number> = [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ];
                const state: MancalaState = new MancalaState(board, 6, PlayerNumberMap.of(22, 26));
                const node: MancalaNode = new GameNode(state);
                // Then it should be a victory for player 1
                RulesUtils.expectToBeVictoryFor(entries.rules, node, Player.ONE, defaultConfig);
            });

            it('should identify draw', () => {
                // Given a state with no more seeds and both players have captured the same number of seeds
                const board: Table<number> = [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ];
                const state: MancalaState = new MancalaState(board, 6, PlayerNumberMap.of(24, 24));
                const node: MancalaNode = new GameNode(state);
                // Then it should be a draw
                RulesUtils.expectToBeDraw(rules, node, defaultConfig);
            });

        });

    });

}

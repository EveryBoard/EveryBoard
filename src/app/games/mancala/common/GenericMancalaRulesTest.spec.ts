/* eslint-disable max-lines-per-function */
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { MancalaState } from './MancalaState';
import { MancalaMove } from './MancalaMove';
import { MancalaFailure } from './MancalaFailure';
import { Player } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { MancalaConfig } from './MancalaConfig';
import { MancalaNode, MancalaRules } from './MancalaRules';
import { MGPOptional } from '@everyboard/lib';

export class MancalaRulesTestEntries {
    gameName: string; // 'Awale', 'Kalah', etc
    rules: MancalaRules;
    simpleMove: MancalaMove;
}
export function DoMancalaRulesTests(entries: MancalaRulesTestEntries): void {

    describe(entries.gameName + ' rules generic tests', () => {

        const rules: MancalaRules = entries.rules;
        const defaultConfig: MGPOptional<MancalaConfig> = entries.rules.getDefaultRulesConfig();

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
                const board: Table<number> = TableUtils.create(6, 2, 0);
                const state: MancalaState = new MancalaState(board, 6, PlayerNumberMap.of(26, 22));
                const node: MancalaNode = new GameNode(state);
                // Then it should be a victory for player 0
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
            });

            it('should identify victory for player 1', () => {
                // Given a state with no more seeds and where player 1 has captured more seeds
                const board: Table<number> = TableUtils.create(6, 2, 0);
                const state: MancalaState = new MancalaState(board, 6, PlayerNumberMap.of(22, 26));
                const node: MancalaNode = new GameNode(state);
                // Then it should be a victory for player 1
                RulesUtils.expectToBeVictoryFor(entries.rules, node, Player.ONE, defaultConfig);
            });

            it('should identify draw', () => {
                // Given a state with no more seeds and both players have captured the same number of seeds
                const board: Table<number> = TableUtils.create(6, 2, 0);
                const state: MancalaState = new MancalaState(board, 6, PlayerNumberMap.of(24, 24));
                const node: MancalaNode = new GameNode(state);
                // Then it should be a draw
                RulesUtils.expectToBeDraw(rules, node, defaultConfig);
            });

        });

    });

}

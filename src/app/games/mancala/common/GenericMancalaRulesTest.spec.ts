/* eslint-disable max-lines-per-function */
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { Rules } from 'src/app/jscaip/Rules';
import { MancalaState } from './MancalaState';
import { MancalaMove } from './MancalaMove';
import { MancalaFailure } from './MancalaFailure';
import { Player } from 'src/app/jscaip/Player';
import { AbstractNode, GameNode } from 'src/app/jscaip/GameNode';

export class MancalaRulesTestEntries<M extends MancalaMove> {
    gameName: string; // 'Awale', 'Kalah', etc
    rules: Rules<M, MancalaState>;
    simpleMove: M;
}
export function DoMancalaRulesTests<M extends MancalaMove>(entries: MancalaRulesTestEntries<M>): void {

    describe(entries.gameName + ' component generic tests', () => {
        it('should allow simple move', () => {
            // Given any board
            const state: MancalaState = entries.rules.getInitialState();
            // When doing a simple move
            // Then the seed should be distributed
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [4, 5, 5, 5, 5, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [0, 0]);
            RulesUtils.expectMoveSuccess(entries.rules, state, entries.simpleMove, expectedState);
        });
        it('should refuse distributing empty space', () => {
            // Given a board where 'simpleMove' would be illegal, distributing an empty house
            const board: number[][] = [
                [4, 0, 4, 4, 4, 4],
                [4, 0, 4, 4, 4, 0],
            ];
            const state: MancalaState = new MancalaState(board, 0, [0, 0]);
            // When attempting to distribute empty space
            // Then it should be illegal
            const reason: string = MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE();
            RulesUtils.expectMoveFailure(entries.rules, state, entries.simpleMove, reason);
        });
        describe('getGameStatus', () => {
            it('should identify victory for player 0', () => {
                // Given a state with no more seeds and where player 0 has captured more seeds
                const board: Table<number> = [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ];
                const state: MancalaState = new MancalaState(board, 6, [26, 22]);
                const node: AbstractNode = new GameNode(state);
                // Then it should be a victory for player 0
                RulesUtils.expectToBeVictoryFor(entries.rules, node, Player.ZERO);
            });
            it('should identify victory for player 1', () => {
                // Given a state with no more seeds and where player 1 has captured more seeds
                const board: Table<number> = [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ];
                const state: MancalaState = new MancalaState(board, 6, [22, 26]);
                const node: AbstractNode = new GameNode(state);
                // Then it should be a victory for player 1
                RulesUtils.expectToBeVictoryFor(entries.rules, node, Player.ONE);
            });
            it('should identify draw', () => {
                // Given a state with no more seeds and both players have captured the same number of seeds
                const board: Table<number> = [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ];
                const state: MancalaState = new MancalaState(board, 6, [24, 24]);
                const node: AbstractNode = new GameNode(state);
                // Then it should be a draw
                RulesUtils.expectToBeDraw(entries.rules, node);
            });
        });
    });
}

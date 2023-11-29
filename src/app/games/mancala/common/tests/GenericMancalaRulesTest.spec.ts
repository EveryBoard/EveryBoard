/* eslint-disable max-lines-per-function */
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table, TableUtils } from 'src/app/utils/ArrayUtils';
import { MancalaState } from '../MancalaState';
import { MancalaDistribution, MancalaMove } from '../MancalaMove';
import { MancalaFailure } from '../MancalaFailure';
import { Player } from 'src/app/jscaip/Player';
import { MancalaConfig } from '../MancalaConfig';
import { RulesConfigUtils } from 'src/app/jscaip/RulesConfigUtil';
import { AbstractNode, GameNode } from 'src/app/jscaip/GameNode';
import { MancalaRules } from '../MancalaRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TestUtils } from 'src/app/utils/tests/TestUtils.spec';

export class MancalaRulesTestEntries {
    gameName: string; // 'Awale', 'Kalah', etc
    rules: MancalaRules;
    simpleMove: MancalaMove;
}

export function DoMancalaRulesTests(entries: MancalaRulesTestEntries): void {

    const defaultConfig: MGPOptional<MancalaConfig> = RulesConfigUtils.getGameDefaultConfig(entries.gameName);

    describe(entries.gameName + 'Rules generic tests', () => {

        it('should allow simple move', () => {
            // Given any board
            const state: MancalaState = MancalaRules.getInitialState(defaultConfig);
            // When doing a simple move
            // Then the seed should be distributed
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [4, 5, 5, 5, 5, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [0, 0]);
            RulesUtils.expectMoveSuccess(entries.rules, state, entries.simpleMove, expectedState, defaultConfig);
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
            RulesUtils.expectMoveFailure(entries.rules, state, entries.simpleMove, reason, defaultConfig);
        });

        it('should refuse starving when custom config refuse starvation', () => {
            // Given a state where you have to feed and pass by store
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
                mustFeed: true,
            });
            const state: MancalaState = new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [2, 0, 0, 0, 2, 0],
            ], 10, [0, 0]);

            // When attempting starving move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(4));

            // Then it should be refused
            const reason: string = MancalaFailure.SHOULD_DISTRIBUTE();
            RulesUtils.expectMoveFailure(entries.rules, state, move, reason, customConfig);
        });

        it('should allow starving when custom config allows it', () => {
            // Given a state where you don't have to feed and pass by store
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
                mustFeed: false,
            });
            const state: MancalaState = new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [2, 0, 0, 0, 2, 0],
            ], 10, [22, 22]);

            // When attempting starving move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(4));

            // Then the move should be a success
            const expectedState: MancalaState = new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ], 11, [26, 22]);
            RulesUtils.expectMoveSuccess(entries.rules, state, move, expectedState, customConfig);
        });

        it('should know when to mansoon', () => {
            // Given a state where player is about to cede his last stone, and won't be feedable
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
                mustFeed: true,
            });
            const state: MancalaState = new MancalaState([
                [0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 2, 0],
            ], 11, [22, 22]);

            // When doing the last move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then the move should be a success
            const expectedState: MancalaState = new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ], 12, [25, 23]);
            RulesUtils.expectMoveSuccess(entries.rules, state, move, expectedState, customConfig);
        });

        it('should refuse ending move in store when config requires to continue', () => {
            // Given a mancala state with a config with passByPlayerStore set to true
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
            });
            const state: MancalaState = MancalaRules.getInitialState(customConfig);

            // When attempting a store-ending single distribution
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3));

            // Then the move should be legal and the store should contain one (so, the score)
            const reason: string = 'MUST_CONTINUE_PLAYING_AFTER_KALAH_MOVE';
            TestUtils.expectToThrowAndLog(
                () => RulesUtils.expectMoveFailure(entries.rules, state, move, reason, customConfig),
                reason,
            );
        });

        describe('getGameStatus', () => {
            const smallerConfig: MGPOptional<MancalaConfig> =
                MGPOptional.of({ ...defaultConfig.get(), seedsByHouse: 2 });
            const biggerConfig: MGPOptional<MancalaConfig> =
                MGPOptional.of({ ...defaultConfig.get(), seedsByHouse: 6 });
            for (const optionalConfig of [smallerConfig, defaultConfig, biggerConfig]) {
                const config: MancalaConfig = optionalConfig.get();
                const halfOfTotalSeeds: number = config.width * config.seedsByHouse;
                describe(`Config with ${ config.seedsByHouse } seeds by house`, () => {
                    it(`should identify victory for player 0`, () => {
                        // Given a state with no more seeds and where player 0 has captured more seeds
                        const board: Table<number> = TableUtils.create(config.width, 2, 0);
                        const state: MancalaState =
                            new MancalaState(board, 6, [halfOfTotalSeeds + 2, halfOfTotalSeeds - 2]);
                        const node: AbstractNode =
                            new GameNode(state, undefined, undefined, MGPOptional.of(config));
                        // Then it should be a victory for player 0
                        RulesUtils.expectToBeVictoryFor(entries.rules, node, Player.ZERO);
                    });
                    it('should identify victory for player 1', () => {
                        // Given a state with no more seeds and where player 1 has captured more seeds
                        const board: Table<number> = TableUtils.create(config.width, 2, 0);
                        const state: MancalaState =
                            new MancalaState(board, 6, [halfOfTotalSeeds - 2, halfOfTotalSeeds + 2]);
                        const node: AbstractNode =
                            new GameNode(state, undefined, undefined, MGPOptional.of(config));
                        // Then it should be a victory for player 1
                        RulesUtils.expectToBeVictoryFor(entries.rules, node, Player.ONE);
                    });
                    it('should identify draw', () => {
                        // Given a state with no more seeds and both players have captured the same number of seeds
                        const board: Table<number> = TableUtils.create(config.width, 2, 0);
                        const state: MancalaState =
                            new MancalaState(board, 6, [halfOfTotalSeeds, halfOfTotalSeeds]);
                        const node: AbstractNode = new GameNode(state, undefined, undefined, MGPOptional.of(config));
                        // Then it should be a draw
                        RulesUtils.expectToBeDraw(entries.rules, node);
                    });
                });
            }
        });

    });

}

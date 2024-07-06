/* eslint-disable max-lines-per-function */
import { AwaleRules } from '../AwaleRules';
import { MancalaState } from '../../common/MancalaState';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { MancalaFailure } from '../../common/MancalaFailure';
import { MGPOptional } from '@everyboard/lib';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { DoMancalaRulesTests } from '../../common/tests/GenericMancalaRulesTest.spec';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaNode, MancalaRules } from '../../common/MancalaRules';

describe('AwaleRules', () => {

    const rules: MancalaRules = AwaleRules.get();
    const defaultConfig: MGPOptional<MancalaConfig> = AwaleRules.get().getDefaultRulesConfig();

    describe('generic tests', () => {

        DoMancalaRulesTests({
            gameName: 'Awale',
            rules,
            simpleMove: MancalaMove.of(MancalaDistribution.of(5)),
        });

    });

    describe('distribution', () => {

        it('should allow simple move', () => {
            // Given any board
            const state: MancalaState = rules.getInitialState(defaultConfig);

            // When doing a simple move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then the seeds should be distributed
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [4, 5, 5, 5, 5, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, PlayerNumberMap.of(0, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should not drop a piece in the starting space', () => {
            // Given a state where the player can perform a distributing move with at least 12 seeds
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 18],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(0, 0));
            // When performing a distribution
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));
            // Then the distribution should be performed as expected, and leave 0 seeds in the starting space
            const expectedBoard: Table<number> = [
                [2, 1, 1, 1, 1, 0],
                [2, 2, 2, 2, 2, 2],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, PlayerNumberMap.of(0, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow feeding move', () => {
            // Given a state where the player could and should feed its opponent
            const board: Table<number> = [
                [1, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(23, 23));

            // When performing a move that feeds the opponent
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));
            const expectedBoard: Table<number> = [
                [1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, PlayerNumberMap.of(23, 23));

            // Then the move should succeed
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('starvation and monsoon', () => {

        it('should forbid starving move', () => {
            // Given a state where the player could feed its opponent
            const board: Table<number> = [
                [1, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(23, 23));

            // When performing a move that does not feed the opponent
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the move should be illegal
            const reason: string = MancalaFailure.SHOULD_DISTRIBUTE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should not monsoon if next player will be able to feed current player', () => {
            // Given a state where next player is able to distribute
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 1],
                [0, 2, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(0, 0));

            // When current player player gives its last seed
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then the move should succeed and no monsoon should be done
            const expectedBoard: Table<number> = [
                [0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 1],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, PlayerNumberMap.of(0, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should monsoon if next player will not be able to feed current player', () => {
            // Given a state where next player is unable to feed current player
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 1],
                [0, 1, 2, 3, 4, 4],
            ];
            const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(10, 23));

            // When player gives its last seed
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then, since the other player can't distribute, all its pieces should be monsooned
            const expectedBoard: Table<number> = TableUtils.create(6, 2, 0);
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, PlayerNumberMap.of(25, 23));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: MancalaNode = new MancalaNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should monsoon if next player will not be able to feed the current player, alternative version', () => {
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 42, PlayerNumberMap.of(24, 23));

            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            const expectedBoard: Table<number> = TableUtils.create(6, 2, 0);
            const expectedState: MancalaState = new MancalaState(expectedBoard, 43, PlayerNumberMap.of(24, 24));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: MancalaNode = new MancalaNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

    });

    describe('captures', () => {

        it('should capture for player zero', () => {
            // Given a state where a capture is possible for player 0
            const board: Table<number> = [
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 2, PlayerNumberMap.of(1, 2));

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, PlayerNumberMap.of(3, 2));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should capture for player one', () => {
            // Given a state where a capture is possible for player 1
            const board: Table<number> = [
                [0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 1, 2],
            ];
            const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(1, 2));

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [0, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, PlayerNumberMap.of(1, 5));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should do multiple capture when possible', () => {
            // Given a state where a multiple-capture is possible for player 0
            const board: Table<number> = [
                [1, 1, 0, 0, 0, 1],
                [2, 1, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 2, PlayerNumberMap.of(0, 0));

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [0, 0, 0, 0, 0, 1],
                [0, 1, 0, 0, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, PlayerNumberMap.of(4, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should stop multiple capture when crossing uncapturable house', () => {
            // Given a state where a multiple-capture is possible for player 0 but interrupted
            const board: Table<number> = [
                [1, 3, 2, 1, 0, 0],
                [4, 1, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 2, PlayerNumberMap.of(0, 0));

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [2, 4, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, PlayerNumberMap.of(5, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should distribute but not capture in case of would-starve move', () => {
            // Given a state in which the player could capture all opponents seeds
            const board: Table<number> = [
                [1, 0, 0, 0, 0, 2],
                [0, 0, 0, 0, 1, 1],
            ];
            const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(0, 0));

            // When the player does a would-starve move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then, the distribution should be done but not the capture
            const expectedBoard: Table<number> = [
                [1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 2],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, PlayerNumberMap.of(0, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should not capture in your own territory', () => {
            // Given a board where you would capture in your own territory
            const board: Table<number> = [
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 1, 1],
            ];
            const state: MancalaState = new MancalaState(board, 0, PlayerNumberMap.of(0, 0));

            // When doing that move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then the distribution should be done but not the capture
            const expectedBoard: Table<number> = [
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 2, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, PlayerNumberMap.of(0, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('Custom Config', () => {

        it('should feed store when config requires to', () => {
            // Given a mancala state with a config with passByPlayerStore set to true
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
            });
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);

            // When doing simple distribution from the leftmost house
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the move should succeed and the store should contain one (so, the score)
            const expectedBoard: Table<number> = [
                [5, 5, 5, 4, 4, 4],
                [0, 4, 4, 4, 4, 4],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, PlayerNumberMap.of(1, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

        it('should not require additionnal distribution when ending distribution in store', () => {
            // Given a mancala state with a config with passByPlayerStore set to true
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
            });
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);

            // When doing simple distribution ending in store
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3));

            // Then the move should succeed and the store should contain one (so, the score)
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [5, 5, 5, 0, 4, 4],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, PlayerNumberMap.of(1, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

        it('should allow multiple sow when config allows it', () => {
            // Given a mancala state with a config with passByPlayerStore set to true
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
            });
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);

            // When doing a double distribution
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3), [MancalaDistribution.of(0)]);

            // Then the move should succeed and the store should contain one (so, the score)
            const expectedState: MancalaState = new MancalaState([
                [5, 5, 5, 5, 4, 4],
                [0, 5, 5, 0, 4, 4],
            ], 1, PlayerNumberMap.of(2, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

        it('should stop distribution on capture', () => {
            // Given a board with possible capture and a config with continueLapUntilCaptureOrEmptyHouse = true
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                continueLapUntilCaptureOrEmptyHouse: true,
            });
            const state: MancalaState = new MancalaState([
                [0, 2, 0, 4, 0, 0],
                [0, 3, 0, 4, 0, 0],
            ], 10, PlayerNumberMap.of(0, 0));

            // When doing that capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(1));

            // Then it should end the move
            const expectedState: MancalaState = new MancalaState([
                [1, 0, 0, 4, 0, 0],
                [1, 0, 0, 4, 0, 0],
            ], 11, PlayerNumberMap.of(3, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

    });

});

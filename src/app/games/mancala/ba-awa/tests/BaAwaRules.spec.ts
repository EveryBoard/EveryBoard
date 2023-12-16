/* eslint-disable max-lines-per-function */
import { BaAwaRules as BaAwaRules } from '../BaAwaRules';
import { MancalaState } from '../../common/MancalaState';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table, TableUtils } from 'src/app/utils/ArrayUtils';
import { DoMancalaRulesTests } from '../../common/tests/GenericMancalaRulesTest.spec';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaRules } from '../../common/MancalaRules';

fdescribe('BaAwaRules', () => {

    const rules: MancalaRules = BaAwaRules.get();
    const defaultConfig: MGPOptional<MancalaConfig> = rules.getDefaultRulesConfig();

    describe('generic tests', () => {

        DoMancalaRulesTests({
            gameName: 'Ba-awa',
            rules,
            simpleMove: MancalaMove.of(MancalaDistribution.of(5)),
        });

    });

    describe('distribution', () => {

        it('should drop a piece in the starting space', () => {
            // Given a state where the player can perform a distributing move with at least 12 stones
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 18],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 1, [0, 0]);
            // When performing a distribution
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));
            // Then the distribution should be performed as expected, and leave 0 stones in the starting space
            const expectedBoard: Table<number> = [
                [3, 1, 2, 0, 2, 0],
                [1, 0, 3, 3, 0, 3],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, [0, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow feeding move', () => {
            // Given a state where the player could feed its opponent
            const board: Table<number> = [
                [8, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 1, [19, 20]);

            // When performing a move that feeds the opponent
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));
            const expectedBoard: Table<number> = [
                [8, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, [19, 20]);

            // Then the move should be legal
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('starvation and monsoon', () => {

// TODO: distinguish "when player give last piece: the end" and "if player cannot play: the end"

        it('should monsoon for opponent when player give its last seed', () => {
            // Given a state where next player is unable to feed current player
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 5],
                [0, 0, 0, 1, 1, 2],
            ];
            const state: MancalaState = new MancalaState(board, 1, [19, 20]);

            // When player give its last stone
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then we still let that player do its last move, so they see the last move was all the same
            const expectedBoard: Table<number> = TableUtils.create(6, 2, 0);
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, [28, 20]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('captures', () => {

        it('should capture for player zero', () => {
            // Given a state where a capture is possible for player 0
            const board: Table<number> = [
                [3, 8, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 2, [0, 0]);

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [0, 8, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, [4, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should capture for player one', () => {
            // Given a state where a capture is possible for player 1
            const board: Table<number> = [
                [0, 0, 0, 0, 8, 1],
                [0, 0, 0, 0, 1, 3],
            ];
            const state: MancalaState = new MancalaState(board, 1, [0, 0]);

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [0, 0, 0, 0, 8, 0],
                [0, 0, 0, 0, 1, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, [0, 4]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should do capture-on-the-go for opponent when possible', () => {
            // Given a state where a capture-on-the-go is possible for passive player !
            const board: Table<number> = [
                [3, 1, 0, 0, 0, 8],
                [3, 1, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 2, [0, 0]);

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [0, 2, 1, 0, 0, 8],
                [0, 1, 0, 0, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, [0, 4]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should do capture-on-the-go for player when possible', () => {
            // Given a state where a capture-on-the-go is possible for active player !
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 8],
                [3, 2, 0, 0, 1, 0],
            ];
            const state: MancalaState = new MancalaState(board, 2, [0, 0]);

            // When performing a move that will create a 4 in a player's house
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(1));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [1, 0, 0, 0, 0, 8],
                [0, 0, 0, 0, 1, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, [4, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should do multiple capture-on-the-go for opponent when possible', () => {
            // Given a state where a multiplie capture-on-the-go is possible for passive player !
            const board: Table<number> = [
                [3, 3, 0, 0, 0, 8], // TODO FOR REVIEW: KEK cette version ne peut avoir de maison à 4+ que si elles n'ont jamais été distribuées !
                [5, 1, 0, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 2, [0, 0]);

            // When performing a move that will capture
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(0));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [0, 0, 1, 1, 1, 8],
                [0, 1, 0, 0, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, [0, 8]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });
// TODO: should mansoon both part of the board when dropping bellow 9
        it('should do multipe capture-on-the-go for player when possible', () => {
            // Given a state where a multiple capture-on-the-go is possible for active player !
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 8],
                [3, 3, 3, 0, 0, 1],
            ];
            const state: MancalaState = new MancalaState(board, 2, [0, 0]);

            // When performing a move that will create a 4 in a player's house
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(2));

            // Then the capture should be performed
            const expectedBoard: Table<number> = [
                [1, 0, 0, 0, 0, 8],
                [0, 0, 0, 0, 0, 1],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 3, [8, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it(`should mansoon for player zero when total of seed drop to 8 or less (Player.ZERO's turn)`, () => {
            // Given a state in which Player.ZERO could capture and make total seed drop to zero
            const board: Table<number> = [
                [0, 0, 0, 3, 3, 0],
                [0, 0, 2, 0, 3, 1],
            ];
            const state: MancalaState = new MancalaState(board, 0, [0, 0]);

            // When the player does a would-starve move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(5));

            // Then, the distribution should be done but not the capture
            const expectedBoard: Table<number> = TableUtils.create(6, 2, 0);
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [12, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it(`should mansoon for player zero when total of seed drop to 8 or less (Player.ONE's turn)`, () => {
            // Given a state in which Player.ZERO could capture and make total seed drop to zero
            const board: Table<number> = [
                [0, 0, 2, 3, 1, 0],
                [0, 0, 2, 0, 3, 1],
            ];
            const state: MancalaState = new MancalaState(board, 1, [0, 0]);

            // When the player does a would-starve move
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(2));

            // Then, the distribution should be done but not the capture
            const expectedBoard: Table<number> = TableUtils.create(6, 2, 0);
            const expectedState: MancalaState = new MancalaState(expectedBoard, 2, [8, 4]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('Custom Config', () => {
        it('TODO: should count "store-dropping" as "passing bellow 8"');
    });

});

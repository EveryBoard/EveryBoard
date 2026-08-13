/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerMap } from '@everyboard/games';
import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Coord, CoordFailure } from '../../../jscaip/Coord';
import { DirectionFailure } from '../../../jscaip/Direction';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { RulesUtils } from '../../../jscaip/tests/RulesUtils.spec';
import { QuebecCastlesMove } from '../QuebecCastlesMove';
import { QuebecCastlesConfig, QuebecCastlesFailure, QuebecCastlesNode, QuebecCastlesRules } from '../QuebecCastlesRules';
import { QuebecCastlesState } from '../QuebecCastlesState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('QuebecCastlesRules', () => {

    let rules: QuebecCastlesRules;
    const defaultConfig: QuebecCastlesConfig = QuebecCastlesRules.get().getDefaultRulesConfig();

    const emptyCastles: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(MGPOptional.empty(), MGPOptional.empty());
    emptyCastles.makeImmutable();
    const defaultCastles: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
        MGPOptional.of(new Coord(8, 8)),
        MGPOptional.of(new Coord(0, 0)),
    );
    defaultCastles.makeImmutable();

    beforeEach(() => {
        // This is the rules instance that we will test
        rules = QuebecCastlesRules.get();
    });

    describe('Config validation', () => {

        function expectConfigToFailWith(config: QuebecCastlesConfig, expectedError: string): void {
            const rulesConfigDescription: RulesConfigDescription<QuebecCastlesConfig> =
                rules.getRulesConfigDescription();
            const validators: ((config: QuebecCastlesConfig) => MGPValidation)[] =
                rulesConfigDescription.defaultConfigDescription.validators ?? [];
            const errors: string[] = validators
                .map((validator: (config: QuebecCastlesConfig) => MGPValidation) => validator(config))
                .filter((validation: MGPValidation) => validation.isFailure())
                .map((validation: MGPValidation) => validation.getReason());
            expect(errors).toContain(expectedError);
        }

        it('should forbid config with too little room for invader pieces', () => {
            // Given a config with too little room for invader pieces
            const customConfig: QuebecCastlesConfig = {
                ...defaultConfig,
                invaders: 15,
            };

            // Then the global config validators should reject it
            const error: string = QuebecCastlesFailure.CANNOT_PUT_THAT_MANY_PIECE_IN_THERE_FOR_INVADER(14, 5);
            expectConfigToFailWith(customConfig, error);
        });

        it('should forbid config with too little room for defender pieces', () => {
            // Given a config with too little room for defender pieces
            const customConfig: QuebecCastlesConfig = {
                ...defaultConfig,
                defenders: 15,
            };

            // Then the global config validators should reject it
            const error: string = QuebecCastlesFailure.CANNOT_PUT_THAT_MANY_PIECE_IN_THERE_FOR_DEFENDER(14, 5);
            expectConfigToFailWith(customConfig, error);
        });

        it('should forbid rhombic config where territories cross the middle of the board', () => {
            // Given a rhombic config with too many lines for territory
            const customConfig: QuebecCastlesConfig = {
                ...defaultConfig,
                linesForTerritory: 8,
            };

            // Then the global config validators should reject it
            expectConfigToFailWith(customConfig, QuebecCastlesFailure.TOO_MANY_LINES_FOR_TERRITORY());
        });

        it('should forbid rectangular config where territories cross the middle of the board', () => {
            // Given a rectangular config with too many lines for territory
            const customConfig: QuebecCastlesConfig = {
                ...defaultConfig,
                linesForTerritory: 5,
                isRhombic: false,
            };

            // Then the global config validators should reject it
            expectConfigToFailWith(customConfig, QuebecCastlesFailure.TOO_MANY_LINES_FOR_TERRITORY());
        });

    });

    describe('Castle Placement', () => {

        it('shoud have the castles placed by default', () => {
            // Given a board in default config
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When checking the castles coord
            const zeroCastle: MGPOptional<Coord> = state.castles.get(Player.ZERO);
            const oneCastle: MGPOptional<Coord> = state.castles.get(Player.ONE);

            // Then they should be upper left and lower right corner
            const maxX: number = state.getWidth() - 1;
            const maxY: number = state.getHeight() - 1;
            expect(zeroCastle).toEqual(MGPOptional.of(new Coord(maxX, maxY)));
            expect(oneCastle).toEqual(MGPOptional.of(new Coord(0, 0)));
        });

        describe('Custom Config', () => {

            it('should allow first player to drop its castle when mentioned in config', () => {
                // Given a custom config were you must place the castle yourself
                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    playersPlaceCastle: true,
                };
                const state: QuebecCastlesState = rules.getInitialState(customConfig);

                // When dropping castle
                const castle: Coord = new Coord(7, 7);
                const move: QuebecCastlesMove = QuebecCastlesMove.drop([castle]);

                // Then the move should succeed then the piece dropped by default
                const castles: PlayerMap<MGPOptional<Coord>> =
                    PlayerMap.ofValues(MGPOptional.of(castle), MGPOptional.empty());
                const expectedState: QuebecCastlesState = new QuebecCastlesState([
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, _, O, O],
                    [_, _, _, _, _, _, O, _, O],
                    [_, _, _, _, _, O, O, O, O],
                ], 1, castles);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
            });

            it('should allow second player to drop its castle when mentioned in config', () => {
                // Given a custom config were you must place the castle yourself
                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    playersPlaceCastle: true,
                };
                const firstCastle: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
                    MGPOptional.of(new Coord(7, 7)),
                    MGPOptional.empty(),
                );
                const state: QuebecCastlesState = new QuebecCastlesState([
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, _, O, O],
                    [_, _, _, _, _, _, O, _, O],
                    [_, _, _, _, _, O, O, O, O],
                ], 1, firstCastle);

                // When dropping castle
                const castle: Coord = new Coord(0, 2);
                const move: QuebecCastlesMove = QuebecCastlesMove.drop([castle]);

                // Then the move should succeed then the piece dropped by default
                const castles: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
                    MGPOptional.of(new Coord(7, 7)),
                    MGPOptional.of(castle),
                );
                const expectedState: QuebecCastlesState = new QuebecCastlesState([
                    [X, X, X, X, X, _, _, _, _],
                    [X, X, X, X, _, _, _, _, _],
                    [_, X, X, _, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, _, O, O],
                    [_, _, _, _, _, _, O, _, O],
                    [_, _, _, _, _, O, O, O, O],
                ], 2, castles);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
            });

            it('should refuse placing castles outside territory', () => {
                // Given a custom config were castle are to be place yourself
                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    playersPlaceCastle: true,
                    dropMode: 'BY_BATCH',
                };
                const state: QuebecCastlesState = rules.getInitialState(customConfig);

                // When dropping castle outside of territory
                const castle: Coord = new Coord(5, 6);
                const move: QuebecCastlesMove = QuebecCastlesMove.drop([castle]);

                // Then it should be illegal
                const reason: string = QuebecCastlesFailure.MUST_DROP_IN_YOUR_TERRITORY();
                RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
            });

            it('should refuse multiple dropping instead of one castle', () => {
                // Given a board with config "drop piece by piece"
                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    playersPlaceCastle: true,
                    dropMode: 'BY_BATCH',
                };
                const state: QuebecCastlesState = rules.getInitialState(customConfig);

                // When dropping several pieces
                const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(7, 7), new Coord(6, 6)]);

                // Then it should be illegal
                const reason: string = QuebecCastlesFailure.PLACE_ONLY_ONE_CASTLE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
            });

        });

    });

    describe('Move Phase', () => {

        it('should forbid any dropping', () => {
            // Given initial state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When dropping (even inside territory)
            const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(5, 7)]);

            // Then it should be illegal
            const reason: string = QuebecCastlesFailure.CANNOT_DROP_IN_MOVE_PHASE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving opponent piece', () => {
            // Given any state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When trying to move opponent piece
            const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(2, 2), new Coord(4, 4));

            // Then it should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving emtpy coord', () => {
            // Given any state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When trying to move empty coord
            const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(3, 3), new Coord(4, 4));

            // Then it should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid landing on your own pieces', () => {
            // Given any state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When trying to land on your own piece
            const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(6, 8), new Coord(6, 7));

            // Then it should be illegal
            const reason: string = RulesFailure.CANNOT_SELF_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid starting outside of board', () => {
            // Given any state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When trying to start a move out of board
            const outOfRange: Coord = new Coord(-2, -2);
            const move: QuebecCastlesMove = QuebecCastlesMove.translation(outOfRange, new Coord(0, 0));

            // Then it should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(outOfRange);
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid landing outside of board', () => {
            // Given any state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When trying to land on outside the board
            const outOfRange: Coord = new Coord(6, 10);
            const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(6, 8), outOfRange);

            // Then it should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(outOfRange);
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid landing on your own castle', () => {
            // Given any state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When trying to land on outside the board
            const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(8, 8));

            // Then it should be illegal
            const reason: string = QuebecCastlesFailure.CANNOT_LAND_OR_DROP_IN_YOUR_CASTLE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        describe('Custom Config', () => {

            it('should allow capture after piece by piece batch', () => {
                // Given any state where a capture is possible
                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    dropMode: 'PIECE_BY_PIECE',
                };
                const state: QuebecCastlesState = new QuebecCastlesState([
                    [_, X, X, X, X, _, _, _, _],
                    [X, X, X, X, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, X, O, O],
                    [_, _, _, _, _, _, O, O, O],
                    [_, _, _, _, _, O, O, O, _],
                ], 6, defaultCastles);

                // When trying capture
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6));

                // Then the move should succeed
                const expectedState: QuebecCastlesState = new QuebecCastlesState([
                    [_, X, X, X, X, _, _, _, _],
                    [X, X, X, X, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, O, O, O],
                    [_, _, _, _, _, _, O, _, O],
                    [_, _, _, _, _, O, O, O, _],
                ], 7, defaultCastles);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
            });

        });

        describe('Invader move', () => {

            it('should forbid move that are not orthogonal', () => {
                // Given any state
                const state: QuebecCastlesState = rules.getInitialState(defaultConfig).incrementTurn();

                // When trying to do an horse move
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(2, 2), new Coord(4, 3));

                // Then it should be illegal
                const reason: string = DirectionFailure.DIRECTION_MUST_BE_LINEAR();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid single step', () => {
                // Given any state
                const state: QuebecCastlesState = rules.getInitialState(defaultConfig).incrementTurn();

                // When trying to land on outside the board
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(2, 2), new Coord(3, 3));

                // Then it should be illegal
                const reason: string = QuebecCastlesFailure.INVALID_INVADER_DISTANCE(1);
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid longer step', () => {
                // Given any state
                const state: QuebecCastlesState = rules.getInitialState(defaultConfig).incrementTurn();

                // When trying to land on outside the board
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(2, 2), new Coord(5, 5));

                // Then it should be illegal
                const reason: string = QuebecCastlesFailure.INVALID_INVADER_DISTANCE(3);
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid move jumping over a coord', () => {
                // Given any state
                const state: QuebecCastlesState = rules.getInitialState(defaultConfig).incrementTurn();

                // When trying to jump over a piece
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(1, 1), new Coord(3, 3));

                // Then it should be illegal
                const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should allow standard jump', () => {
                // Given any state
                const state: QuebecCastlesState = rules.getInitialState(defaultConfig).incrementTurn();

                // When trying normal jump
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(2, 2), new Coord(4, 4));

                // Then the move should succeed
                const expectedState: QuebecCastlesState = new QuebecCastlesState([
                    [_, X, X, X, X, _, _, _, _],
                    [X, X, X, X, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, _, _, _, X, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, _, O, O],
                    [_, _, _, _, _, _, O, O, O],
                    [_, _, _, _, _, O, O, O, _],
                ], 2, defaultCastles);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

        });

        describe('Defender move', () => {

            it('should forbid move that are not a single step', () => {
                // Given any state
                const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

                // When trying to land on outside the board
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(5, 5));

                // Then it should be illegal
                const reason: string = QuebecCastlesFailure.INVALID_DEFENDER_DISTANCE(2);
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should allow single step', () => {
                // Given any state
                const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

                // When trying normal jump
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(6, 7), new Coord(6, 6));

                // Then the move should succeed
                const expectedState: QuebecCastlesState = new QuebecCastlesState([
                    [_, X, X, X, X, _, _, _, _],
                    [X, X, X, X, _, _, _, _, _],
                    [X, X, X, _, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, O, O, O],
                    [_, _, _, _, _, _, _, O, O],
                    [_, _, _, _, _, O, O, O, _],
                ], 1, defaultCastles);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should allow capture', () => {
                // Given any state where a capture is possible
                const state: QuebecCastlesState = new QuebecCastlesState([
                    [_, X, X, X, X, _, _, _, _],
                    [X, X, X, X, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, X, O, O],
                    [_, _, _, _, _, _, O, O, O],
                    [_, _, _, _, _, O, O, O, _],
                ], 2, defaultCastles);
                // When trying normal jump
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6));

                // Then the move should succeed
                const expectedState: QuebecCastlesState = new QuebecCastlesState([
                    [_, X, X, X, X, _, _, _, _],
                    [X, X, X, X, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, X, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, O, O, O],
                    [_, _, _, _, _, _, O, _, O],
                    [_, _, _, _, _, O, O, O, _],
                ], 3, defaultCastles);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

        });

    });

    describe('getGameStatus', () => {

        it('should recognize invader victory (castle taken)', () => {
            // Given any state where invader has stepped on the defender castle
            const state: QuebecCastlesState = new QuebecCastlesState([
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X],
            ], 10, defaultCastles);
            const node: QuebecCastlesNode = new QuebecCastlesNode(state);

            // When checking the game status
            // Then it should be a victory for Player.ONE
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should recognize defender victory (castle taken)', () => {
            // Given any state where invader has stepped on the defender castle
            const state: QuebecCastlesState = new QuebecCastlesState([
                [O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, X, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ], 10, defaultCastles);
            const node: QuebecCastlesNode = new QuebecCastlesNode(state);

            // When checking the game status
            // Then it should be a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should recognize invader victory (capture)', () => {
            // Given any state where invader has capture all defender
            const state: QuebecCastlesState = new QuebecCastlesState([
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ], 10, defaultCastles);
            const node: QuebecCastlesNode = new QuebecCastlesNode(state);

            // When checking the game status
            // Then it should be a victory for Player.ONE
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should recognize defender victory (capture)', () => {
            // Given any state where defender has captured all invader
            const state: QuebecCastlesState = new QuebecCastlesState([
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ], 10, defaultCastles);
            const node: QuebecCastlesNode = new QuebecCastlesNode(state);

            // When checking the game status
            // Then it should be a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should recognize draw', () => {
            // Given any state
            const state: QuebecCastlesState = rules.getInitialState(defaultConfig);

            // When checking the game status
            // Then it should be a victory
            const node: QuebecCastlesNode = new QuebecCastlesNode(state);
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

        it('should recognize draw (in drop phase)', () => {
            // Given any state in drop phase for player for Player.ONE
            const customConfig: QuebecCastlesConfig = {
                ...defaultConfig,
                defenders: 3,
                dropMode: 'PIECE_BY_PIECE',
            };
            const state: QuebecCastlesState = new QuebecCastlesState([
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O, O],
                [_, _, _, _, _, _, _, O, _],
            ], 1, defaultCastles);

            // When checking the game status
            // Then it should be a victory
            const node: QuebecCastlesNode = new QuebecCastlesNode(state);
            RulesUtils.expectToBeOngoing(rules, node, customConfig);
        });

    });

    describe('custom config', () => {

        describe('drop phase', () => {

            describe('place castle yourself', () => {

                it('should not drop piece after placing castle when "drop piece by piece" is chosen', () => {
                    // Given any state where castle AND piece are to be placed
                    const customConfig: QuebecCastlesConfig = {
                        ...defaultConfig,
                        dropMode: 'PIECE_BY_PIECE',
                        playersPlaceCastle: true,
                    };
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When placing the castle
                    const castleCoord: Coord = new Coord(7, 7);
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([castleCoord]);

                    // Then only the castle should be present
                    const expectedCastles: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
                        MGPOptional.of(castleCoord),
                        MGPOptional.empty(),
                    );
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                    ], 1, expectedCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

            });

            describe('drop piece by piece', () => {

                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    dropMode: 'PIECE_BY_PIECE',
                    defenders: 3,
                    invaders: 5,
                };

                it('should refuse any move', () => {
                    // Given state in drop phase with possible move
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, O, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, X, _],
                    ], 2, defaultCastles);

                    // When doing a move while still in drop phase
                    const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(1, 1), new Coord(2, 2));

                    // Then it should be illegal
                    const reason: string = QuebecCastlesFailure.CANNOT_MOVE_IN_DROP_PHASE();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should refuse putting soldier out of board', () => {
                    // Given the initial state
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping piece outside of territory
                    const outOfRange: Coord = new Coord(-2, -2);
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([outOfRange]);

                    // Then the move should be illegal
                    const reason: string = CoordFailure.OUT_OF_RANGE(outOfRange);
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should refuse putting soldier outside territory (Player.ZERO)', () => {
                    // Given the initial state
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping piece outside of territory
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(2, 2)]);

                    // Then the move should be illegal
                    const reason: string = QuebecCastlesFailure.MUST_DROP_IN_YOUR_TERRITORY();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should allow putting soldier in first turn', () => {
                    // Given the initial state
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping piece inside of territory
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(7, 7)]);

                    // Then the move should succeed
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, O, _],
                        [_, _, _, _, _, _, _, _, _],
                    ], 1, defaultCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

                it('should allow player to play normally after last batch-drop', () => {
                    // Given a board on which current player is to do the first move (after drop phase)
                    // and a drop piece by piece config
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, X, X, _, _, _, _, _, _],
                        [X, X, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, O, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 6, defaultCastles);

                    // When doing the first move
                    const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6));

                    // Then the move should succeed
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, X, X, _, _, _, _, _, _],
                        [X, X, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, O, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 7, defaultCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

                describe('opponent is out of soldier to drop', () => {

                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, X, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, O, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 5, defaultCastles);

                    it('should allow first player to drop all its remaining soldier', () => {
                        // Given a board on which current player is the only one that has piece to drop
                        // and a drop piece by piece config

                        // When dropping all its remaining piece at once
                        const coords: Coord[] = [new Coord(0, 2), new Coord(2, 0), new Coord(2, 2)];
                        const move: QuebecCastlesMove = QuebecCastlesMove.drop(coords);

                        // Then the move should succeed
                        const expectedState: QuebecCastlesState = new QuebecCastlesState([
                            [_, X, X, _, _, _, _, _, _],
                            [X, _, _, _, _, _, _, _, _],
                            [X, _, X, _, _, _, _, _, _],
                            [_, _, _, _, _, _, _, _, _],
                            [_, _, _, _, _, _, _, _, _],
                            [_, _, _, _, _, _, _, _, _],
                            [_, _, _, _, _, _, _, _, _],
                            [_, _, _, _, _, _, _, O, O],
                            [_, _, _, _, _, _, _, O, _],
                        ], 6, defaultCastles);
                        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                    });

                    it('should forbid player to drop less than all its remaining soldier', () => {
                        // Given a board on which current player is the only one that has piece to drop
                        // and a drop piece by piece config

                        // When dropping less than the awaited number of piece
                        const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(0, 2)]);

                        // Then the move should be illegal
                        const reason: string = QuebecCastlesFailure.MUST_DROP_ALL_YOUR_REMAINING_PIECES();
                        RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                    });

                    it('should forbid player to drop more than all its remaining soldier', () => {
                        // Given a board on which current player is the only one that has piece to drop
                        // and a drop piece by piece config

                        // When dropping more than the awaited number of piece
                        const coords: Coord[] = [new Coord(0, 2), new Coord(2, 0), new Coord(2, 2), new Coord(1, 1)];
                        const move: QuebecCastlesMove = QuebecCastlesMove.drop(coords);

                        // Then the move should be illegal
                        const reason: string = QuebecCastlesFailure.MUST_DROP_ALL_YOUR_REMAINING_PIECES();
                        RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                    });

                    it('should forbid player to drop on the castle', () => {
                        // Given a board on which current player is the only one that has piece to drop
                        // and a drop piece by piece config

                        // When dropping a piece on the castle
                        const coords: Coord[] = [new Coord(0, 0), new Coord(2, 0), new Coord(2, 2)];
                        const move: QuebecCastlesMove = QuebecCastlesMove.drop(coords);

                        // Then the move should be illegal
                        const reason: string = QuebecCastlesFailure.CANNOT_LAND_OR_DROP_IN_YOUR_CASTLE();
                        RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                    });

                });

                it('should forbid putting soldier on another soldier', () => {
                    // Given a state with "piece by piece" with piece already dropped
                    const coord: Coord = new Coord(7, 7);
                    const state: QuebecCastlesState = rules
                        .getInitialState(customConfig)
                        .setPieceAt(coord, Player.ZERO);

                    // When dropping on the same coord again
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([coord]);

                    // Then it should be illegal
                    const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SPACE();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should forbid dropping soldier on castle', () => {
                    // Given a state with "piece by piece"
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping on the same coord again
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([state.castles.get(Player.ZERO).get()]);

                    // Then it should be illegal
                    const reason: string = QuebecCastlesFailure.CANNOT_LAND_OR_DROP_IN_YOUR_CASTLE();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should forbid multiple dropping', () => {
                    // Given a board with config "drop piece by piece"
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping several pieces
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(7, 7), new Coord(6, 6)]);

                    // Then it should be illegal
                    const reason: string = QuebecCastlesFailure.MUST_DROP_ONE_BY_ONE();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

            });

            describe('drop piece by piece (but defender has more pieces)', () => {

                it('should allow second player to drop all its remaining soldier once opponent is out of soldier to drop', () => {
                    // Given a board on which current player is the only one that has piece to drop
                    // and a drop piece by piece config
                    const customConfig: QuebecCastlesConfig = {
                        ...defaultConfig,
                        dropMode: 'PIECE_BY_PIECE',
                        defenders: 5,
                        invaders: 3,
                    };
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, X, _, _, _, _, _, _, _],
                        [X, X, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, O, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 6, defaultCastles);

                    // When dropping all its remaining piece at once
                    const coords: Coord[] = [new Coord(8, 6), new Coord(6, 8)];
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop(coords);

                    // Then the move should succeed
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, X, _, _, _, _, _, _, _],
                        [X, X, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, O],
                        [_, _, _, _, _, _, O, O, _],
                    ], 7, defaultCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

            });

            describe('drop piece by piece & place castle', () => {

                it('should includes castles in calculation', () => {
                    // Given any state two turn away from last drop
                    const customConfig: QuebecCastlesConfig = {
                        ...defaultConfig,
                        dropMode: 'PIECE_BY_PIECE',
                        playersPlaceCastle: true,
                        defenders: 3,
                        invaders: 5,
                    };
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 5, defaultCastles);

                    // When doing normal move
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(1, 1)]);

                    // Then the move should succeed
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [X, X, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 6, defaultCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

            });

            describe('drop by batch & place castle', () => {

                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    dropMode: 'BY_BATCH',
                    playersPlaceCastle: true,
                    defenders: 2,
                    invaders: 2,
                };

                it('should allow dropping all piece after dropping castle', () => {
                    // Given a board in turn 3
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                    ], 2, defaultCastles);

                    // When dropping all defender pieces
                    const drops: Coord[] = [new Coord(8, 7), new Coord(7, 8)];
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop(drops);

                    // Then the move should succeed and the pieces dropped
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 3, defaultCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

            });

            describe('drop by batch', () => {

                const customConfig: QuebecCastlesConfig = {
                    ...defaultConfig,
                    dropMode: 'BY_BATCH',
                    defenders: 2,
                    invaders: 2,
                };

                it('should refuse putting soldier outside territory (Player.ZERO)', () => {
                    // Given the second turn and a config where you drop yourself
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping piece outside of territory
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(5, 6), new Coord(7, 7)]);

                    // Then the move should be illegal
                    const reason: string = QuebecCastlesFailure.MUST_DROP_IN_YOUR_TERRITORY();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should refuse putting soldier outside territory (Player.ONE)', () => {
                    // Given the second turn and a config where you drop yourself
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                    ], 1, defaultCastles);

                    // When dropping piece outside of territory
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(1, 1), new Coord(3, 2)]);

                    // Then the move should be illegal
                    const reason: string = QuebecCastlesFailure.MUST_DROP_IN_YOUR_TERRITORY();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should allow first player (defender) to drop all its soldier at once', () => {
                    // Given a custom config where you have to drop yourself
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping all your pieces
                    const drops: Coord[] = [new Coord(8, 7), new Coord(7, 8)];
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop(drops);

                    // Then the move should succeed and the pieces dropped
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 1, defaultCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

                it('should forbid player to drop less soldier', () => {
                    // Given a custom config where you have to drop yourself
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping less than all your pieces
                    const drops: Coord[] = [new Coord(7, 7)];
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop(drops);

                    // Then the move should be illegal
                    const reason: string = QuebecCastlesFailure.MUST_DROP_ALL_YOUR_PIECES();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should forbid player to drop duplicate coord', () => {
                    // Given a custom config where you have to drop yourself
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping twice the same coord
                    const drops: Coord[] = [new Coord(7, 7), new Coord(7, 7)];
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop(drops);

                    // Then the move should be illegal
                    const reason: string = QuebecCastlesFailure.MUST_DROP_ALL_YOUR_PIECES();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should forbid player to drop more soldier', () => {
                    // Given a custom config where you have to drop yourself
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping more than all your pieces
                    const drops: Coord[] = [new Coord(7, 7), new Coord(8, 7), new Coord(7, 8)];
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop(drops);

                    // Then the move should be illegal
                    const reason: string = QuebecCastlesFailure.CANNOT_DROP_THAT_MANY_PIECES();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

                it('should allow second player (invader) to drop all its soldier at once', () => {
                    // Given a custom config where you have to drop yourself
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 1, defaultCastles);

                    // When dropping all your pieces
                    const drops: Coord[] = [new Coord(0, 1), new Coord(1, 0)];
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop(drops);

                    // Then the move should succeed and the pieces dropped
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, X, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 2, defaultCastles);
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
                });

            });

            describe('isRhombic = false', () => {

                it('should refuse putting soldier outside territory (Player.ZERO)', () => {
                    // Given the initial state
                    const customConfig: QuebecCastlesConfig = {
                        ...defaultConfig,
                        dropMode: 'PIECE_BY_PIECE',
                        isRhombic: false,
                    };
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // When dropping piece outside of territory
                    const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(2, 2)]);

                    // Then the move should be illegal
                    const reason: string = QuebecCastlesFailure.MUST_DROP_IN_YOUR_TERRITORY();
                    RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
                });

            });

            describe('defender & invader', () => {

                it('should have 5 pieces in two lines', () => {
                    // Given a custom config with 5 pieces to drop
                    const customConfig: QuebecCastlesConfig = {
                        ...defaultConfig,
                        defenders: 5,
                        invaders: 5,
                    };

                    // When generating initial state
                    const state: QuebecCastlesState = rules.getInitialState(customConfig);

                    // Then it should have piece filled in corners
                    const expectedState: QuebecCastlesState = new QuebecCastlesState([
                        [_, X, X, _, _, _, _, _, _],
                        [X, X, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, O],
                        [_, _, _, _, _, _, O, O, _],
                    ], 0, defaultCastles);
                    expect(expectedState).toEqual(state);
                });

            });

        });

        it('should fill board for rectangular version', () => {
            // Given a rectangular config
            const customConfig: QuebecCastlesConfig = {
                ...defaultConfig,
                isRhombic: false,
            };

            // When displaying initial board
            const state: QuebecCastlesState = rules.getInitialState(customConfig);

            // Then it should look like this
            const expectedState: QuebecCastlesState = new QuebecCastlesState([
                [_, X, X, X, X, X, X, X, X],
                [_, X, X, X, _, X, X, X, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _, _],
                [O, O, O, O, O, O, O, O, _],
            ], 0, defaultCastles);
            expect(state).toEqual(expectedState);
        });

    });

});

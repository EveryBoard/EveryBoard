/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';
import { MGPOptional } from '@everyboard/lib';

import { ActivatedRouteStub, ComponentTestUtils, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { QuebecCastlesComponent } from '../quebec-castles.component';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { QuebecCastlesConfig, QuebecCastlesFailure, QuebecCastlesRules } from '../QuebecCastlesRules';
import { QuebecCastlesMove } from '../QuebecCastlesMove';
import { Coord } from 'src/app/jscaip/Coord';
import { QuebecCastlesState } from '../QuebecCastlesState';
import { RulesConfigurationComponent } from 'src/app/components/wrapper-components/rules-configuration/rules-configuration.component';
import { DebugElement } from '@angular/core';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { PlayerOrNone } from 'src/app/jscaip/Player';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('QuebecCastlesComponent', () => {

    let testUtils: ComponentTestUtils<QuebecCastlesComponent>;
    const rules: QuebecCastlesRules = QuebecCastlesRules.get();
    const defaultConfig: MGPOptional<QuebecCastlesConfig> = rules.getDefaultRulesConfig();
    const defaultThrones: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
        MGPOptional.of(new Coord(8, 8)),
        MGPOptional.of(new Coord(0, 0)),
    );
    defaultThrones.makeImmutable();

    beforeEach(fakeAsync(async() => {
        // This `testUtils` will be used throughout the test suites as a matcher for various test conditions
        testUtils = await ComponentTestUtils.forGame<QuebecCastlesComponent>('QuebecCastles');
    }));

    it('should highlight first selected piece', fakeAsync(async() => {
        // Given any board in move phase
        // When clicking on a piece of current player
        await testUtils.expectClickSuccess('#click-7-7');
        // Then first coord should be selected
        testUtils.expectElementToHaveClass('#piece-7-7', 'selected-stroke');
    }));

    it('should apply move on second click', fakeAsync(async() => {
        // Given any board in move phase where a piece is selected
        await testUtils.expectClickSuccess('#click-7-7');

        // When clicking on a case next to it
        // Then the move should succeed
        const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6));
        await testUtils.expectMoveSuccess('#click-6-6', move);
    }));

    it('should show landing space as moved', fakeAsync(async() => {
        // Given any board in move phase where a piece is selected
        await testUtils.expectClickSuccess('#click-7-7');

        // When clicking on a case next to it
        const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6));
        await testUtils.expectMoveSuccess('#click-6-6', move);

        // Then the move should succeed
        testUtils.expectElementToHaveClasses('#square-6-6', ['base', 'moved-fill']);
    }));

    it('should show last capture', fakeAsync(async() => {
        // Given any board in move phase where a piece is about to be captured
        const state: QuebecCastlesState = new QuebecCastlesState([
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O, O],
            [_, _, _, _, _, _, _, O, O],
            [_, _, _, _, _, O, O, O, _],
        ], 3, defaultThrones);
        await testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click-2-2');

        // When doign the capture
        const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(2, 2), new Coord(4, 4));
        await testUtils.expectMoveSuccess('#click-4-4', move);

        // Then the move capture should be highlighted
        testUtils.expectElementToHaveClass('#square-4-4', 'captured-fill');
    }));

    it('should not select opponent piece', fakeAsync(async() => {
        // Given any board in move phase
        // When clicking on an opponent piece
        await testUtils.expectClickFailure('#click-2-2', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        // Then opponent piece should not be selected
        testUtils.expectElementNotToHaveClass('#piece-2-2', 'selected-stroke');
    }));

    it('should not select empty space', fakeAsync(async() => {
        // Given any board in move phase
        // When clicking on an empty space
        // Then it should fail
        await testUtils.expectClickFailure('#click-5-5', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
    }));

    it('should deselect when clicking on same piece again', fakeAsync(async() => {
        // Given any board with a selected piece
        await testUtils.expectClickSuccess('#click-7-7');

        // When clicking on the piece again
        await testUtils.expectClickFailure('#click-7-7');

        // Then the piece should no longer be selected
        testUtils.expectElementNotToHaveClass('#piece-7-7', 'selected-stroke');
    }));

    it('should change selected piece when clicking on other piece', fakeAsync(async() => {
        // Given any board with a selected piece
        await testUtils.expectClickSuccess('#click-7-7');

        // When clicking on another
        await testUtils.expectClickSuccess('#click-6-7');

        // Then the piece should no longer be selected and the new one should
        testUtils.expectElementNotToHaveClass('#piece-7-7', 'selected-stroke');
        testUtils.expectElementToHaveClass('#piece-6-7', 'selected-stroke');
    }));

    it('should show possible landings', fakeAsync(async() => {
        // Given a board in move phase
        // When selecting a player piece that can move
        await testUtils.expectClickSuccess('#click-6-7');

        // Then it should show its possible landing square
        testUtils.expectElementToExist('#landing-5-7');
        testUtils.expectElementToExist('#landing-6-6');
        testUtils.expectElementToExist('#landing-5-6');
    }));

    it('should rotate', fakeAsync(async() => {
        // Given a board in standard rhombic config
        // When displaying it
        // Then it should have a transform on the board
        const board: DebugElement = testUtils.findElement('#quebec');
        const boardTransform: string = board.attributes.transform as string;
        expect(boardTransform).toBe('rotate(45, 450, 450)');
    }));

    describe('custom config', () => {

        describe('isRhombic = false', () => {

            it('should not rotate', fakeAsync(async() => {
                // Given a board in non rhombic config
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    isRhombic: false,
                });
                const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(customConfig);

                // When displaying it
                await testUtils.setupState(state, { config: customConfig });

                // Then it should not have a transform on the board
                const board: DebugElement = testUtils.findElement('#quebec');
                const boardTransform: string = board.attributes.transform as string;
                expect(boardTransform).toBe('rotate(0, 450, 450)');
            }));

        });

        describe('drop by batch', () => {

            it('should allow dropping a second piece', fakeAsync(async() => {
                // Given any board with a dropped piece
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.expectClickSuccess('#click-7-7');

                // When dropping another one
                await testUtils.expectClickSuccess('#click-6-6');

                // Then the other piece should be dropped
                testUtils.expectElementToHaveClasses('#piece-7-7', ['base', 'player0-fill', 'selected-stroke']);
                testUtils.expectElementToHaveClasses('#piece-6-6', ['base', 'player0-fill', 'selected-stroke']);
            }));

            it('should make your territory visible', fakeAsync(async() => {
                // Given any state in drop phase
                // When displaying it
                // Then territory should be visible
            }));

            it('should forbid dropping outside territory', fakeAsync(async() => {
                // Given any board in drop phase
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });

                // When dropping outside territory
                await testUtils.expectClickSuccess('#click-3-8');

                // Then no piece should have been dropped
                testUtils.expectElementNotToExist('#piece-3-8');
            }));

            it('should not display drop-validator when it is not your turn', fakeAsync(async() => {
                // Given a board when it is not your turn to play
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.getComponent().setInteractive(false);

                // When displaying board
                // Then it should not have drop-validator
                testUtils.expectElementNotToExist('#drop-validator');
            }));

            it('should not display drop-validator when it is your turn but not all piece are dropped', fakeAsync(async() => {
                // Given a board where it is your turn to play
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });

                // When displaying board
                // Then it should not have drop-validator
                testUtils.expectElementNotToExist('#drop-validator');
                testUtils.expectElementToExist('#remaining-piece-8');
            }));

            it('should display drop-validator when it is your turn and all piece have been dropped', fakeAsync(async() => {
                // Given a board where it is your turn to play
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                    defenders: 2,
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.expectClickSuccess('#click-7-8');
                await testUtils.expectClickSuccess('#click-8-7');

                // When displaying board
                // Then it should not have drop-validator
                testUtils.expectElementToExist('#drop-validator');
                testUtils.expectElementNotToExist('#remaining-piece-0');
            }));

            it('should deselect piece when clicking a second time', fakeAsync(async() => {
                // Given any board on which a piece is already dropped
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.expectClickSuccess('#click-7-7');

                // When clicking on it again
                // Then the other piece should be dropped
                await testUtils.expectClickSuccess('#click-7-7');
            }));

            it('should show validation button when last piece is dropped', fakeAsync(async() => {
                // Given any board in drop phase with only one piece left to drop
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                    defenders: 3,
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.expectClickSuccess('#click-7-7');
                await testUtils.expectClickSuccess('#click-6-6');

                // When dropping the last one
                await testUtils.expectClickSuccess('#click-5-5');

                // Then the validation button should be visible
                testUtils.expectElementToHaveClass('#piece-7-7', 'selected-stroke');
            }));

            it('should allow validating drop when there is enough', fakeAsync(async() => {
                // Given a board in drop phase, with all drop done but one
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                    defenders: 3,
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.expectClickSuccess('#click-7-8');
                await testUtils.expectClickSuccess('#click-6-8');

                // When dropping last piece
                await testUtils.expectClickSuccess('#click-5-8');

                // Then the validator should be clickable
                testUtils.expectElementNotToHaveClass('#drop-validator', 'opacity-70');
            }));

            it('should show last dropped after all dropped', fakeAsync(async() => {
                // Given a board on which all piece has been dropped
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                    defenders: 3,
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.expectClickSuccess('#click-5-8');
                await testUtils.expectClickSuccess('#click-6-8');
                await testUtils.expectClickSuccess('#click-7-8');

                // When validating the drop
                const coords: Coord[] = [new Coord(5, 8), new Coord(6, 8), new Coord(7, 8)];
                const move: QuebecCastlesMove = QuebecCastlesMove.drop(coords);
                await testUtils.expectMoveSuccess('#drop-validator', move);

                // Then the dropped piece should be marked as moved-stroke
                testUtils.expectElementToHaveClasses('#square-5-8', ['base', 'player0-fill', 'territory-opacity']);
                testUtils.expectElementToHaveClasses('#square-6-8', ['base', 'player0-fill', 'territory-opacity']);
                testUtils.expectElementToHaveClasses('#square-7-8', ['base', 'player0-fill', 'territory-opacity']);
                testUtils.expectElementToHaveClasses('#piece-5-8', ['base', 'player0-fill', 'moved-stroke']);
                testUtils.expectElementToHaveClasses('#piece-6-8', ['base', 'player0-fill', 'moved-stroke']);
                testUtils.expectElementToHaveClasses('#piece-7-8', ['base', 'player0-fill', 'moved-stroke']);
            }));

            it('should display last drop for player one', fakeAsync(async() => {
                // Given a board on which all piece has been dropped for Player.ONE
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                    defenders: 3,
                    invaders: 3,
                });
                const initialState: QuebecCastlesState = rules.getInitialState(customConfig).incrementTurn();
                await testUtils.setupState(initialState, { config: customConfig });
                await testUtils.expectClickSuccess('#click-1-1');
                await testUtils.expectClickSuccess('#click-2-1');
                await testUtils.expectClickSuccess('#click-1-2');

                // // When validating the drop
                const coords: Coord[] = [new Coord(1, 1), new Coord(2, 1), new Coord(1, 2)];
                const move: QuebecCastlesMove = QuebecCastlesMove.drop(coords);
                await testUtils.expectMoveSuccess('#drop-validator', move);

                // // Then the dropped should be marked as last-moved
                testUtils.expectElementToHaveClasses('#square-1-1', ['base', 'moved-fill']);
                testUtils.expectElementToHaveClasses('#square-2-1', ['base', 'moved-fill']);
                testUtils.expectElementToHaveClasses('#square-1-2', ['base', 'moved-fill']);
                testUtils.expectElementToHaveClasses('#piece-1-1', ['base', 'player1-fill']);
                testUtils.expectElementToHaveClasses('#piece-2-1', ['base', 'player1-fill']);
                testUtils.expectElementToHaveClasses('#piece-1-2', ['base', 'player1-fill']);
            }));

            it('should allow second player to drop after a first drop has been done', fakeAsync(async() => {
                // Given any board with a dropped piece
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'BY_BATCH',
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });
                await testUtils.expectClickSuccess('#click-7-7');
                // When dropping another one
                await testUtils.expectClickSuccess('#click-6-6');
                // Then the other piece should be dropped
                testUtils.expectElementToHaveClasses('#piece-7-7', ['base', 'player0-fill', 'selected-stroke']);
                testUtils.expectElementToHaveClasses('#piece-6-6', ['base', 'player0-fill', 'selected-stroke']);
            }));

        });

        describe('drop piece by piece', () => {

            it('should drop single piece', fakeAsync(async() => {
                // Given any drop in a "drop yourself & piece by piece"
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'PIECE_BY_PIECE',
                });
                await testUtils.setupState(rules.getInitialState(customConfig), { config: customConfig });

                // When doing single click
                // Then it should drop
                const move: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(7, 7)]);
                await testUtils.expectMoveSuccess('#click-7-7', move);
            }));

            it('should allow player to drop all its remaining soldier once opponent is out of soldier to drop', fakeAsync(async() => {
                // Given a board on which current player is the only one that has piece to drop
                // and a drop piece by piece config
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'PIECE_BY_PIECE',
                    defenders: 3,
                    invaders: 5,
                });
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
                ], 5, defaultThrones);
                await testUtils.setupState(state, { config: customConfig });

                // When dropping all its remaining piece at once
                const coords: Coord[] = [new Coord(0, 2), new Coord(2, 0), new Coord(2, 2)];
                const move: QuebecCastlesMove = QuebecCastlesMove.drop(coords);
                await testUtils.expectClickSuccess('#click-0-2');
                await testUtils.expectClickSuccess('#click-2-0');
                await testUtils.expectClickSuccess('#click-2-2');

                // Then the move should succeed
                await testUtils.expectMoveSuccess('#drop-validator', move);
            }));

            it('should not mix translation and drop', fakeAsync(async() => {
                // Given a board on which current player is the only one that has piece to drop
                // and a drop piece by piece config
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'PIECE_BY_PIECE',
                    defenders: 3,
                    invaders: 5,
                });
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
                ], 5, defaultThrones);
                await testUtils.setupState(state, { config: customConfig });

                // When dropping all its remaining piece at once then clicking on a piece
                await testUtils.expectClickSuccess('#click-0-2');
                await testUtils.expectClickSuccess('#click-2-0');
                await testUtils.expectClickSuccess('#click-2-2');
                await testUtils.expectClickSuccess('#click-0-1');

                // Then the last click should not have interfered with the drop
                testUtils.expectElementNotToHaveClass('#piece-0-1', 'selected-stroke');
            }));

            it('should forbid player to drop on the throne', fakeAsync(async() => {
                // Given a board on which current player is the only one that has piece to drop
                // and a drop piece by piece config
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'PIECE_BY_PIECE',
                    defenders: 3,
                    invaders: 5,
                });
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
                ], 5, defaultThrones);
                await testUtils.setupState(state, { config: customConfig });

                // When dropping a piece on the throne
                await testUtils.expectClickSuccess('#click-0-0');

                // Then no piece should have been dropped
                testUtils.expectElementNotToExist('#piece-0-0');
            }));

            it('should allow player to play normally after last batch-drop', fakeAsync(async() => {
                // Given a board on which current player is to do the first move (after drop phase)
                // and a drop piece by piece config
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'PIECE_BY_PIECE',
                    defenders: 3,
                    invaders: 5,
                });
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
                ], 6, defaultThrones);
                await testUtils.setupState(state, { config: customConfig });

                // When doing the first move
                const move: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6));
                await testUtils.expectClickSuccess('#click-7-7');

                // Then the move should succeed
                await testUtils.expectMoveSuccess('#click-6-6', move);
            }));

            it('should forbid player to change aleady-dropped piece', fakeAsync(async() => {
                // Given a final drop where user drop all its remaining pieces
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'PIECE_BY_PIECE',
                    defenders: 3,
                    invaders: 5,
                });
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
                ], 5, defaultThrones);
                await testUtils.setupState(state, { config: customConfig });

                // When attempting to move a piece that was already dropped
                await testUtils.expectClickSuccess('#click-0-1');

                // Then the clicked piece should not be selected
                testUtils.expectElementNotToHaveClass('#piece-0-1', 'selected-stroke');
            }));

        });

        describe('place throne yourself', () => {

            it('should have first click being king drop', fakeAsync(async() => {
                // Given the initial board in "drop king yourself" config
                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    width: 7,
                    height: 7,
                    playersPlaceThrone: true,
                });
                const state: QuebecCastlesState = rules.getInitialState(customConfig);
                await testUtils.setupState(state, { config: customConfig });

                // When clicking inside territory
                const throne: Coord = new Coord(6, 6);
                const move: QuebecCastlesMove = QuebecCastlesMove.drop([throne]);
                await testUtils.expectMoveSuccess('#click-6-6', move);

                // Then the throne should be drawn there now
                testUtils.expectElementToExist('#throne-PLAYER_ZERO-6-6');
                // Also, even if the default config must be used, the new configurated size must remain
                testUtils.expectElementNotToExist('#click-7-7');
            }));

        });

    });

});

describe('QuebecCastles Custom Configs', () => {

    let testUtils: SimpleComponentTestUtils<RulesConfigurationComponent>;
    let component: RulesConfigurationComponent;
    const rules: QuebecCastlesRules = QuebecCastlesRules.get();
    const defaultConfig: MGPOptional<QuebecCastlesConfig> = rules.getDefaultRulesConfig();

    async function setCustomConfigTags(tags: { [key : string]: number | boolean | string }): Promise<void> {
        await testUtils.chooseConfig('Custom');
        testUtils.detectChanges();
        for (const key of Object.keys(tags)) {
            const value: number | boolean | string = tags[key];
            component.rulesConfigForm.get(key)?.setValue(value);
            tick(1);
        }
    }

    function expectElementToHaveError(expectedError: string): void {
        testUtils.expectElementToExist('#form-error');
        const errorElement: DebugElement = testUtils.findElement('#form-error > div');
        expect(errorElement.nativeElement.innerHTML).toEqual(expectedError);
    }

    beforeEach(async() => {
        const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub('whatever-game');
        testUtils = await SimpleComponentTestUtils.create(RulesConfigurationComponent, activatedRoute);
        component = testUtils.getComponent();
        component.rulesConfigDescriptionOptional = rules.getRulesConfigDescription();
        component.editable = true;
    });

    it('should forbid config with too little room for pieces', fakeAsync(async() => {
        // Given a config with too little room for defender piece
        const customConfig: QuebecCastlesConfig = {
            ...defaultConfig.get(),
            defenders: 15, // There won't be enough room for that many pieces
        };

        // When setting up that invalid config
        await setCustomConfigTags(customConfig);

        // Then there should be an error eh!
        const error: string = QuebecCastlesFailure.CANNOT_PUT_THAT_MANY_PIECE_IN_THERE_FOR_PLAYER_ONE(14, 4);
        expectElementToHaveError(error);
    }));

    it('should forbid config where player line cross the middle of the board (rhombic)', fakeAsync(async() => {
        // Given a config with too much lines for territory
        const customConfig: QuebecCastlesConfig = {
            ...defaultConfig.get(),
            linesForTerritory: 8,
        };

        // When setting up that invalid config
        await setCustomConfigTags(customConfig);

        // Then there should be an error eh!
        const error: string = QuebecCastlesFailure.TOO_MANY_LINES_FOR_TERRITORY();
        expectElementToHaveError(error);
    }));

    it('should forbid config where player line cross the middle of the board (rectangular)', fakeAsync(async() => {
        // Given a config with too much lines for territory (rectangular board)
        const customConfig: QuebecCastlesConfig = {
            ...defaultConfig.get(),
            linesForTerritory: 5,
            isRhombic: false,
        };

        // When setting up that invalid config
        await setCustomConfigTags(customConfig);

        // Then there should be an error eh!
        const error: string = QuebecCastlesFailure.TOO_MANY_LINES_FOR_TERRITORY();
        expectElementToHaveError(error);
    }));

});

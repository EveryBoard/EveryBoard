/* eslint-disable max-lines-per-function */
import { Type } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Encoder } from 'src/app/utils/Encoder';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { TaflComponent } from '../tafl.component';
import { TaflFailure } from '../TaflFailure';
import { TaflMove } from '../TaflMove';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflRules } from '../TaflRules';
import { TaflState } from '../TaflState';
import { RulesConfigUtils } from 'src/app/jscaip/RulesConfigUtil';
import { TaflConfig } from '../TaflConfig';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class TaflTestEntries<C extends TaflComponent<R, M>,
                             R extends TaflRules<M>,
                             M extends TaflMove>
{
    component: Type<C>; // TablutComponent, BrandhubComponent, etc
    gameName: string; // 'Tablut', 'Brandhub', etc
    secondPlayerPiece: Coord; // The coord of a piece belonging to Player.ONE
    validFirstCoord: Coord; // The coord of a piece belonging to Player.ZERO that could move this turn (in initialState)
    moveProvider: (start: Coord, end: Coord) => MGPFallible<M>;
    validSecondCoord: Coord; // The coord of an empty space that could be the landing coord of validFirstCoord
    diagonalSecondCoord: Coord; // An empty space coord in diagonal of validFirstCoord
    stateReadyForCapture: TaflState; // A state in which a capture is possible for current player
    capture: M; // The capture possible in stateReadyForCapture
    firstCaptured: Coord; // The capture made by 'capture'
    otherPlayerPiece: Coord; // A different coord as validFirstCoord of the same player
    stateReadyForJumpOver: TaflState;
    jumpOver: M; // An illegal move on stateReadyForJumpOver, that could make a piece jump over another
}

export function DoTaflTests<C extends TaflComponent<R, M>,
                            R extends TaflRules<M>,
                            M extends TaflMove>(entries: TaflTestEntries<C, R, M>)
    : void
{

    let testUtils: ComponentTestUtils<C>;

    describe(entries.gameName + ' component generic tests', () => {

        beforeEach(fakeAsync(async() => {
            testUtils = await ComponentTestUtils.forGame<C>(entries.gameName);
        }));

        it('should create', () => {
            testUtils.expectToBeCreated();
        });

        describe('First click', () => {

            it('should cancel move when clicking on opponent piece', fakeAsync( async() => {
                // Given any state
                // When clicking on an opponent piece
                // Then the move should be illegal
                const opponentPiece: string = '#click_' + entries.secondPlayerPiece.x + '_' + entries.secondPlayerPiece.y;
                const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
                await testUtils.expectClickFailure(opponentPiece, reason);
            }));

            it('should cancel move when first click on empty space', fakeAsync( async() => {
                // Given any state
                // When clicking on an empty space
                // Then it should be a failure
                await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
            }));

            it('should highlight selected piece', fakeAsync(async() => {
                // Given any state
                // When clicking on one of your piece
                const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // Then it should have selected the piece
                testUtils.expectElementToHaveClass('#piece_' + playersCoord, 'selected-stroke');
            }));

        });

        describe('Second click', () => {

            it('should allow simple move', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                const start: Coord = entries.validFirstCoord;
                const end: Coord = entries.validSecondCoord;
                const playersCoord: string = start.x + '_' + start.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // When moving your piece
                const move: M = entries.moveProvider(start, end).get();

                // Then the move should be legal
                const landingSpace: string = '#click_' + end.x + '_' + end.y;
                await testUtils.expectMoveSuccess(landingSpace, move);
                // And the square on the way should be highlighted
                const movedOverCoords: Coord[] = move.getMovedOverCoords();
                for (const movedOverCoord of movedOverCoords) {
                    const elementName: string = '#space_' + movedOverCoord.x + '_' + movedOverCoord.y;
                    testUtils.expectElementToHaveClass(elementName, 'moved-fill');
                }
            }));

            it('should fail but not throw during diagonal move attempt', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // When attempting diagonal move
                const message: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();

                // Then it should not have throwed
                const secondClick: string = '#click_' + entries.diagonalSecondCoord.x + '_' + entries.diagonalSecondCoord.y;
                expect(async() => await testUtils.expectClickFailure(secondClick, message)).not.toThrow();
            }));

            it('should show captured piece and left spaces', fakeAsync(async() => {
                // Given a board where a capture is ready to be made
                await testUtils.setupState(entries.stateReadyForCapture);
                const firstCoord: Coord = entries.capture.getStart();
                await testUtils.expectClickSuccess('#click_' + firstCoord.x + '_' + firstCoord.y);

                // When finalizing the capture
                const secondCoord: Coord = entries.capture.getEnd();
                await testUtils.expectMoveSuccess('#click_' + secondCoord.x + '_' + secondCoord.y, entries.capture);

                // Then captured and move highlight should be shown
                const component: C = testUtils.getGameComponent();
                expect(component.getRectClasses(entries.firstCaptured.x, entries.firstCaptured.y)).toContain('captured-fill');
                expect(component.getRectClasses(firstCoord.x, firstCoord.y)).toContain('moved-fill');
                expect(component.getRectClasses(secondCoord.x, secondCoord.y)).toContain('moved-fill');
            }));

            it('should select other piece when clicking on another piece of the player', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // When clicking another piece of yours
                const otherCoord: string = entries.otherPlayerPiece.x + '_' + entries.otherPlayerPiece.y;
                await testUtils.expectClickSuccess('#click_' + otherCoord);

                // Then that piece should be selected and the previous unselected
                testUtils.expectElementToHaveClass('#piece_' + otherCoord, 'selected-stroke');
                testUtils.expectElementNotToHaveClass('#piece_' + playersCoord, 'selected-stroke');
            }));

            it('should deselect clicked piece when it is click for the second time in a row', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // When clicking on it again
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // Then that piece should be deselected
                testUtils.expectElementNotToHaveClass('#piece_' + playersCoord, 'selected-stroke');
            }));

            it('should cancelMove when trying to jump over another piece', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                await testUtils.setupState(entries.stateReadyForJumpOver);
                const firstCoord: string = entries.jumpOver.getStart().x + '_' + entries.jumpOver.getStart().y;
                await testUtils.expectClickSuccess('#click_' + firstCoord);

                // When trying an illegal move
                const move: M = entries.jumpOver;

                // Then the move should have failed
                const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
                const secondCoord: string = entries.jumpOver.getEnd().x + '_' + entries.jumpOver.getEnd().y;
                await testUtils.expectMoveFailure('#click_' + secondCoord, reason, move);
                // And the piece should be unselected
                testUtils.expectElementNotToHaveClass('#piece_' + firstCoord, 'selected-stroke');
            }));

        });

        it('should have a bijective encoder', () => {
            const rules: R = testUtils.getGameComponent().rules;
            const encoder: Encoder<M> = testUtils.getGameComponent().encoder;
            const moveGenerator: TaflMoveGenerator<M> = new TaflMoveGenerator(rules);
            const defaultConfig: MGPOptional<TaflConfig> = RulesConfigUtils.getGameDefaultConfig(entries.gameName);
            const firstTurnMoves: M[] = moveGenerator
                .getListMoves(rules.getInitialNode(defaultConfig), defaultConfig)
                .map((move: TaflMove) => {
                    return entries.moveProvider(move.getStart(), move.getEnd()).get();
                });
            for (const move of firstTurnMoves) {
                EncoderTestUtils.expectToBeBijective(encoder, move);
            }
        });

        it('should hide first move when taking back', fakeAsync(async() => {
            // Given a state with a first move done
            const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
            await testUtils.expectClickSuccess('#click_' + playersCoord);
            const move: M = entries.moveProvider(entries.validFirstCoord, entries.validSecondCoord).get();
            const landingCoord: string = entries.validSecondCoord.x + '_' + entries.validSecondCoord.y;
            const landingSpace: string = '#click_' + landingCoord;
            await testUtils.expectMoveSuccess(landingSpace, move);

            // When taking it back
            await testUtils.expectInterfaceClickSuccess('#takeBack');

            // Then no highlight should be found
            testUtils.expectElementNotToHaveClass('#space_' + playersCoord, 'moved-fill');
            testUtils.expectElementNotToHaveClass('#space_' + landingCoord, 'moved-fill');
        }));

    });

}

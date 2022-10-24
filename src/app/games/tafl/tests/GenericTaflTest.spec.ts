
/* eslint-disable max-lines-per-function */
import { Type } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MoveEncoder, NumberEncoder } from 'src/app/utils/Encoder';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { TaflComponent } from '../tafl.component';
import { TaflFailure } from '../TaflFailure';
import { TaflMinimax } from '../TaflMinimax';
import { TaflMove } from '../TaflMove';
import { TaflRules } from '../TaflRules';
import { TaflState } from '../TaflState';


export class TaflTestEntries<C extends TaflComponent<R, M, S>,
                             R extends TaflRules<M, S>,
                             M extends TaflMove,
                             S extends TaflState>
{
    component: Type<C>; // TablutComponent, BrandhubComponent, etc
    gameName: string; // 'Tablut', 'Brandhub', etc
    secondPlayerPiece: Coord; // The coord of a piece belonging to Player.ONE
    validFirstCoord: Coord; // The coord of a piece belonging to Player.ZERO that could move this turn (in initialState)
    moveProvider: (start: Coord, end: Coord) => M;
    validSecondCoord: Coord; // The coord of an empty space that could be the landing coord of validFirstCoord
    diagonalSecondCoord: Coord; // An empty space coord in diagonal of validFirstCoord
    stateReadyForCapture: S; // A state in which a capture is possible for current player
    capture: M; // The capture possible in stateReadyForCapture
    firstCaptured: Coord; // The capture made by 'capture'
    otherPlayerPiece: Coord; // A different coord as validFirstCoord of the same player
    stateReadyForJumpOver: S;
    jumpOver: M; // An illegal move on stateReadyForJumpOver, that could make a piece jump over another
}
export function DoTaflTests<C extends TaflComponent<R, M, S>,
                            R extends TaflRules<M, S>,
                            M extends TaflMove,
                            S extends TaflState>(entries: TaflTestEntries<C, R, M, S>)
    : void
{
    let testUtils: ComponentTestUtils<C>;
    describe(entries.gameName + ' component generic tests', () => {
        beforeEach(fakeAsync(async() => {
            testUtils = await ComponentTestUtils.forGame<C>(entries.gameName);
        }));
        it('should create', () => {
            expect(testUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
            expect(testUtils.getComponent()).withContext('Component should be created').toBeDefined();
        });
        describe('First click', () => {
            it('should cancel move when clicking on opponent piece', fakeAsync( async() => {
                // Given any state
                // When clicking on an opponent piece
                // Then the move should be illegal
                const opponentPiece: string = '#click_' + entries.secondPlayerPiece.x + '_' + entries.secondPlayerPiece.y;
                const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
                await testUtils.expectClickFailure(opponentPiece, reason);
            }));
            it('should cancel move when first click on empty space', fakeAsync( async() => {
                // Given any state
                // When clicking on an empty space
                // Then it should be a failure
                await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            }));
            it('should highlight selected piece', fakeAsync(async() => {
                // Given any state
                // When clicking on one of your piece
                const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // Then it should have selected the piece
                testUtils.expectElementToHaveClass('#piece_' + playersCoord, 'selected');
            }));
        });
        describe('Second click', () => {
            it('should allow simple move', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // When moving your piece
                const move: M = entries.moveProvider(entries.validFirstCoord, entries.validSecondCoord);

                // Then the move should be legal
                const landingSpace: string = '#click_' + entries.validSecondCoord.x + '_' + entries.validSecondCoord.y;
                await testUtils.expectMoveSuccess(landingSpace, move);
            }));
            it('Diagonal move attempt should not throw', fakeAsync(async() => {
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
                testUtils.setupState(entries.stateReadyForCapture);
                const firstCoord: Coord = entries.capture.coord;
                await testUtils.expectClickSuccess('#click_' + firstCoord.x + '_' + firstCoord.y);

                // When finalizing the capture
                const secondCoord: Coord = entries.capture.end;
                await testUtils.expectMoveSuccess('#click_' + secondCoord.x + '_' + secondCoord.y, entries.capture);

                // Then captured and move highlight should be shown
                const component: C = testUtils.getComponent();
                expect(component.getRectClasses(entries.firstCaptured.x, entries.firstCaptured.y)).toContain('captured');
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
                testUtils.expectElementToHaveClass('#piece_' + otherCoord, 'selected');
                testUtils.expectElementNotToHaveClass('#piece_' + playersCoord, 'selected');
            }));
            it('should deselect clicked piece when it is click for the second time in a row', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                const playersCoord: string = entries.validFirstCoord.x + '_' + entries.validFirstCoord.y;
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // When clicking on it again
                await testUtils.expectClickSuccess('#click_' + playersCoord);

                // Then that piece should be deselected
                testUtils.expectElementNotToHaveClass('#piece_' + playersCoord, 'selected');
            }));
            it('should cancelMove when trying to jump over another piece', fakeAsync(async() => {
                // Given a state where first click selected one of your pieces
                testUtils.setupState(entries.stateReadyForJumpOver);
                const firstCoord: string = entries.jumpOver.coord.x + '_' + entries.jumpOver.coord.y;
                await testUtils.expectClickSuccess('#click_' + firstCoord);

                // When trying an illegal move
                const move: M = entries.jumpOver;

                // Then the move should have failed
                const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
                const secondCoord: string = entries.jumpOver.end.x + '_' + entries.jumpOver.end.y;
                await testUtils.expectMoveFailure('#click_' + secondCoord, reason, move);
                // And the piece should be unselected
                testUtils.expectElementNotToHaveClass('#piece_' + firstCoord, 'selected');
            }));
        });
        it('encoder should be correct', () => {
            const rules: R = testUtils.getComponent().rules;
            MGPNode.ruler = rules;
            const encoder: MoveEncoder<M> = testUtils.getComponent().encoder;
            rules.node = rules.node.getInitialNode();
            const minimax: TaflMinimax = new TaflMinimax(rules, 'TaflMinimax');
            const firstTurnMoves: M[] = minimax
                .getListMoves(rules.node)
                .map((move: TaflMove) => {
                    return entries.moveProvider(move.coord, move.end);
                });
            for (const move of firstTurnMoves) {
                NumberEncoderTestUtils.expectToBeCorrect(encoder as NumberEncoder<M>, move);
            }
        });
    });
}

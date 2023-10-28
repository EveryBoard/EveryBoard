/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { MartianChessComponent, MartianChessFace } from '../martian-chess.component';
import { MartianChessMove } from '../MartianChessMove';
import { MartianChessState } from '../MartianChessState';
import { MartianChessPiece } from '../MartianChessPiece';
import { DirectionFailure } from 'src/app/jscaip/Direction';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('MartianChessComponent', () => {

    let testUtils: ComponentTestUtils<MartianChessComponent>;

    const _: MartianChessPiece = MartianChessPiece.EMPTY;
    const A: MartianChessPiece = MartianChessPiece.PAWN;
    const B: MartianChessPiece = MartianChessPiece.DRONE;
    const C: MartianChessPiece = MartianChessPiece.QUEEN;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<MartianChessComponent>('MartianChess');
    }));
    it('should show selected piece when clicking on it', fakeAsync(async() => {
        // Given the initial board
        // When clicking on on of your pieces
        await testUtils.expectClickSuccess('#click_1_5');

        // Then the piece should have a selected style
        testUtils.expectElementToHaveClass('#pawn_1_5', 'selected-stroke');
    }));
    it('should show indicators of next possible click once piece is selected', fakeAsync(async() => {
        // Given any board where displacement, capture and promotions are all possible
        const board: Table<MartianChessPiece> = [
            [_, _, _, _],
            [_, _, _, _],
            [C, C, B, _],
            [_, _, _, _],
            [_, _, B, A],
            [_, B, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ];
        const state: MartianChessState = new MartianChessState(board, 0);
        await testUtils.setupState(state);

        // When selecting a piece able to do capture/promotion/displacement
        await testUtils.expectClickSuccess('#click_2_4');

        // Then all those options should be shown as a landing coord
        testUtils.expectElementToExist('#indicator_2_2'); // capturable opponent
        testUtils.expectElementToExist('#indicator_2_3'); // displacement
        testUtils.expectElementToExist('#indicator_3_3'); // displacement

        testUtils.expectElementToExist('#indicator_3_4'); // promotion
        testUtils.expectElementToExist('#indicator_3_5'); // displacement

        testUtils.expectElementToExist('#indicator_2_6'); // displacement
        testUtils.expectElementToExist('#indicator_2_5'); // displacement
        testUtils.expectElementNotToExist('#indicator_0_6'); // illegal displacement
        testUtils.expectElementNotToExist('#indicator_1_5'); // illegal promotion

        testUtils.expectElementToExist('#indicator_0_4'); // displacement
        testUtils.expectElementToExist('#indicator_1_4'); // displacement
        testUtils.expectElementToExist('#indicator_0_2'); // capturable opponent
        testUtils.expectElementToExist('#indicator_1_3'); // displacement
    }));
    it('should not select opponent piece', fakeAsync(async() => {
        // Given the initial board

        // When clicking an opponent piece
        await testUtils.expectClickSuccess('#click_0_0');

        // Then it should not select the piece but not toast error
        testUtils.expectElementNotToHaveClass('#queen_0_0', 'selected-stroke');
    }));
    it('should not select empty space', fakeAsync(async() => {
        // Given the initial board
        // When clicking an empty space immediately
        // Then it should not toast
        await testUtils.expectClickSuccess('#click_3_4');
    }));
    it('should cancel move attempt when clicking twice on the same piece', fakeAsync(async() => {
        // Given a board with a selected piece
        await testUtils.expectClickSuccess('#click_1_5');

        // When clicking on the piece again
        await testUtils.expectClickSuccess('#click_1_5');

        // Then the piece should be deselected
        testUtils.expectElementNotToHaveClass('#pawn_1_5', 'selected-stroke');
    }));
    it('should not throw when attempting invalid move', fakeAsync(async() => {
        // Given a board where a first click was done
        await testUtils.expectClickSuccess('#click_1_5');

        // When cliking on a invalid second coord
        // Then the move should have been illegal
        const reason: string = DirectionFailure.DIRECTION_MUST_BE_LINEAR();
        await testUtils.expectClickFailure('#click_0_3', reason);
    }));
    it('should change selectedPiece when second clicking on a non-landable friendly piece', fakeAsync(async() => {
        // Given a board where a first click was done
        await testUtils.expectClickSuccess('#click_3_7');

        // When cliking on one of your other piece that cannot be your landing coord
        await testUtils.expectClickSuccess('#click_2_6');

        // Then the move should not have been canceled but the first piece selected changed
        testUtils.expectElementToHaveClass('#drone_2_6', 'selected-stroke');
    }));
    it('should propose illegal move so that a toast is given to explain', fakeAsync(async() => {
        // Given a board where a first click was done
        await testUtils.expectClickSuccess('#click_3_7');

        // When clicking on a fully illegal coord
        // Then the move should be illegal
        const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
        const move: MartianChessMove = MartianChessMove.from(new Coord(3, 7), new Coord(0, 4)).get();
        await testUtils.expectMoveFailure('#click_0_4', reason, move);
    }));
    it('should toast the move invalidity', fakeAsync(async() => {
        // Given a board where a first click was done
        await testUtils.expectClickSuccess('#click_3_7');

        // When finishing an invalid move creation
        // Then the move failure reason should have been toasted
        const reason: string = DirectionFailure.DIRECTION_MUST_BE_LINEAR();
        await testUtils.expectClickFailure('#click_0_3', reason);
    }));
    it('should attempt the move when doing the second click (success)', fakeAsync(async() => {
        // Given a board where a first click was done
        await testUtils.expectClickSuccess('#click_1_5');

        // When cliking on a invalid second coord
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(0, 4)).get();

        // Then the move should be legal and the board changed
        await testUtils.expectMoveSuccess('#click_0_4', move);
    }));
    it('should highlight left coord and landing coord (empty landing coord)', fakeAsync(async() => {
        // Given a board where a move is about to be done
        await testUtils.expectClickSuccess('#click_1_5');

        // When finalizing the move
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(0, 4)).get();
        await testUtils.expectMoveSuccess('#click_0_4', move);

        // Then left square and landing square should be shown as moved
        testUtils.expectElementToHaveClass('#square_1_5', 'moved-fill');
        testUtils.expectElementToHaveClass('#square_0_4', 'moved-fill');
    }));
    it('should highlight left coord and captured coord', fakeAsync(async() => {
        // Given a board where a capture is about to be done
        const board: Table<MartianChessPiece> = [
            [C, C, B, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, A, _],
            [_, A, _, _],
            [_, _, _, _],
            [_, _, B, A],
            [_, A, _, _],
        ];
        const state: MartianChessState = new MartianChessState(board, 0);
        await testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click_1_4');

        // When capturing
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 4), new Coord(2, 3)).get();
        await testUtils.expectMoveSuccess('#click_2_3', move);

        // Then left square and landing square should be captured
        testUtils.expectElementToHaveClass('#square_1_4', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#square_2_3', 'moved-fill');
        testUtils.expectElementToHaveClass('#square_2_3', 'captured-fill');
    }));
    it('should highlight left coord and field promotion coord', fakeAsync(async() => {
        // Given a board where a field promotion is about to be done
        const board: Table<MartianChessPiece> = [
            [C, C, B, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, B, A],
            [_, A, _, _],
        ];
        const state: MartianChessState = new MartianChessState(board, 0);
        await testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click_1_7');

        // When finalizing the move
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();
        await testUtils.expectMoveSuccess('#click_2_6', move);

        // Then left square and landing square should be shown as moved
        testUtils.expectElementToHaveClass('#square_1_7', 'moved-fill');
        testUtils.expectElementToHaveClass('#square_2_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#queen_2_6', 'last-move-stroke');
    }));
    describe('clock and countdown interaction and appeareance', () => {

        it('should select the clock sign when clicking on it', fakeAsync(async() => {
            // Given a board with the clock not called yet

            // When clicking on the clock
            await testUtils.expectClickSuccess('#clockOrCountDownView');

            // Then the clock circle should be selected
            testUtils.expectElementToHaveClass('#clockOrCountDownCircle', 'selected-stroke');
        }));
        it('should be possible to unselect the clock when changing your mind', fakeAsync(async() => {
            // Given a board with the clock not called yet but the clock just called (locally)
            await testUtils.expectClickSuccess('#clockOrCountDownView');

            // When clicking on the clock again
            await testUtils.expectClickSuccess('#clockOrCountDownView');

            // Then the clock should no longer be selected
            testUtils.expectElementNotToHaveClass('#clockOrCountDownCircle', 'selected-stroke');
        }));
        it('should send the move with clock call when doing it with a selected clock', fakeAsync(async() => {
            // Given a board where clock has been clicked a a piece too
            await testUtils.expectClickSuccess('#clockOrCountDownView');
            await testUtils.expectClickSuccess('#click_1_5');

            // When clicking on a legal landing coord for your piece
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(0, 6), true).get();

            // Then a move with 'call the clock' should have been sent
            await testUtils.expectMoveSuccess('#click_0_6', move);
        }));
        it('should replace the clock by the count down when calling the clock', fakeAsync(async() => {
            // Given a board where the clock is present, called, and move about to be submitted
            await testUtils.expectClickSuccess('#clockOrCountDownView');
            await testUtils.expectClickSuccess('#click_1_5');

            // When doing the move
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(0, 6), true).get();
            await testUtils.expectMoveSuccess('#click_0_6', move);

            // Then the clock should be replace by the count down (7 turn remaining)
            testUtils.expectTextToBe('#countDownText', '7');
        }));
        it('should not select the circle when clock was called in previous turns', fakeAsync(async() => {
            // Given a board where the clock has been called in the past
            const board: Table<MartianChessPiece> = MartianChessState.getInitialState().board;
            const state: MartianChessState = new MartianChessState(board, 4, MGPOptional.empty(), MGPOptional.of(3));
            await testUtils.setupState(state);

            // When clicking on the circle
            await testUtils.expectClickSuccess('#clockOrCountDownView');

            // Then the clock should not have been selected
            testUtils.expectElementNotToHaveClass('#clockOrCountDownCircle', 'selected-stroke');
        }));
    });
    describe('Visual Modes', () => {
        it('should unfold "Mode Panel" when clicking on the cog', fakeAsync(async() => {
            // Given the initial board
            // When clicking on the cog
            await testUtils.clickElement('#modeCog');

            // Then the modePanel should be displayed
            testUtils.expectElementToExist('#modePanel');
        }));
        it('should fold "Mode Panel" when clicking again on the cog', fakeAsync(async() => {
            // Given the initial board with a clicked cog
            await testUtils.clickElement('#modeCog');

            // When clicking on the cog again
            await testUtils.clickElement('#modeCog');

            // Then the modePanel should not be displayed
            testUtils.expectElementNotToExist('#modePanel');
        }));
        it('should test all view mode', fakeAsync(async() => {
            for (const styleAndName of testUtils.getGameComponent().listOfStyles) {
                // Given a board in the initial mode with panel mode displayed
                await testUtils.clickElement('#modeCog');

                // When clicking on the shape named like the style
                await testUtils.clickElement('#' + styleAndName.name);

                // Then the mode should have been chosen
                const currentStyle: MartianChessFace = testUtils.getGameComponent().style;
                expect(currentStyle).toBe(styleAndName.style);
            }
        }));
    });
});

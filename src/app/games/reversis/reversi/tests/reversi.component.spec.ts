/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { Direction, EightDirection } from '@everyboard/games';
import { RectangularBoardShape } from '@everyboard/games';
import { EightDirectionSquareTopology } from '@everyboard/games';
import { SimpleGameStateWithTable } from '@everyboard/games';
import { FourStatePiece } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { ReversiConfig } from '@everyboard/games/reversi';
import { ReversiMove } from '@everyboard/games/reversi';
import { ReversiState } from '@everyboard/games/reversi';
import { ReversiRules } from '@everyboard/games/reversi';

import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { ReversiComponent } from '../reversi.component';


fdescribe('ReversiComponent', () => {

    let testUtils: ComponentTestUtils<ReversiComponent>;
    const defaultConfig: ReversiConfig = ReversiRules.get().getDefaultRulesConfig();

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const ordinalTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
    const squareShape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(8, 8, ordinalTopology);

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<ReversiComponent>('Reversi');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    fit('should show last move and captures', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [_, _, _, _, X, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, X, O, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, O, _, _, _, _],
        ];
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 0);
        const state: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, gameState);
        await testUtils.setupState(state);

        const move: ReversiMove = new ReversiMove(0, 4);
        await testUtils.expectMoveSuccess('#click-0-4', move);

        testUtils.expectElementNotToHaveClass('#click-1-3', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-2-2', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-3-1', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-4-0', 'captured-fill');

        testUtils.expectElementToHaveClasses('#click-1-4', ['base', 'captured-fill']);

        testUtils.expectElementToHaveClasses('#click-1-5', ['base', 'captured-fill']);
        testUtils.expectElementToHaveClasses('#click-2-6', ['base', 'captured-fill']);

        testUtils.expectElementToHaveClasses('#click-0-4', ['base', 'moved-fill']);
    }));

    describe('first click', () => {

        it(`should hide last move's capture`, fakeAsync(async() => {
            // Given a board with a last move
            const previousState: ReversiState<Direction> = ReversiRules.get().getInitialState(defaultConfig);
            const previousMove: ReversiMove = new ReversiMove(5, 3);
            const board: Table<FourStatePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, O, O, O, _, _],
                [_, _, _, X, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
            const state: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, gameState);
            await testUtils.setupState(state, { previousState, previousMove });

            const move: ReversiMove = new ReversiMove(5, 4);
            await testUtils.expectMoveSuccess('#click-5-4', move);

            testUtils.expectElementNotToHaveClass('#click-4-3', 'captured-fill');
            testUtils.expectElementToHaveClass('#click-4-4', 'captured-fill');
        }));

    });

    it('should fake a click on ReversiMove.PASS.coord to pass', fakeAsync(async() => {
        // Given a fictitious board on which player can only pass
        const board: FourStatePiece[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [O, X, _, _, _, _, _, _],
        ];
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
        const state: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, gameState);

        // When displaying the board
        await testUtils.setupState(state);

        // Then the player can pass
        await testUtils.expectPassSuccess(ReversiMove.PASS);
    }));
});

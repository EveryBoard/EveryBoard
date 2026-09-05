/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { Shape } from '../../../jscaip/shape/Shape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { SquareTopology } from '../../../jscaip/topology/SquareTopology';
import { Topology } from '../../../jscaip/topology/Topology';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { ConnectNMove } from '../ConnectNMove';
import { ConnectNConfig, ConnectNRules } from '../ConnectNRules';
import { ConnectNComponent } from '../connect-n.component';


describe('ConnectNComponent', () => {

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const defaultConfig: ConnectNConfig = ConnectNRules.get().getDefaultRulesConfig();
    const defaultTopology: Topology = new SquareTopology();
    const defaultShape: Shape = new RectangularShape(defaultConfig.boardSize, defaultConfig.boardSize, defaultTopology);

    let testUtils: ComponentTestUtils<ConnectNComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<ConnectNComponent>('ConnectN');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('first click', () => {

        it('should do the first move immediately after first click at first turn', fakeAsync(async() => {
            // Given the initial state of the component
            // When clicking anywhere
            // Then a first move should be done
            const move: ConnectNMove = ConnectNMove.of([new Coord(9, 9)]);
            await testUtils.expectMoveSuccess('#click-9-9', move);
        }));

        it('should cancel move when clicking on occupied piece from previous turns', fakeAsync(async() => {
            // Given a component with pieces on it, from previous turns
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            await testUtils.setupState(state);
            // When clicking on them
            // Then it should fail
            await testUtils.expectClickFailure('#click-9-9', RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }));

        it('should drop the first of two pieces when clicking empty coord', fakeAsync(async() => {
            // Given a component with one move already done
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            await testUtils.setupState(state);

            // When clicking on an empty square
            await testUtils.expectClickSuccess('#click-8-8');

            // Then the dropped piece should be displayed
            testUtils.expectElementToHaveClass('#dropped-8-8', 'moved-stroke');
        }));

        it('should hide last move when doing first click', fakeAsync(async() => {
            // Given a board with a last move
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            const previousMove: ConnectNMove = ConnectNMove.of([new Coord(9, 9)]);
            await testUtils.setupState(state, { previousMove });

            // When doing a first click
            await testUtils.expectClickSuccess('#click-8-8');

            // Then the highlights from last turn should be hidden
            testUtils.expectElementNotToHaveClass('#click-9-9', 'last-move-stroke');
        }));

    });

    describe('second click', () => {

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given a component where you already dropped your first piece
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click-8-8');

            // When clicking again on this piece
            await testUtils.expectClickFailureWithAsymmetricNaming('#dropped-8-8', '#click-8-8');

            // Then it should deselect it without toast
            testUtils.expectElementNotToExist('#dropped-8-8');
        }));

        it('should do move when clicking on a second empty square', fakeAsync(async() => {
            // Given a component where you already dropped your first piece
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click-8-8');

            // When clicking on a second empty square
            const move: ConnectNMove = ConnectNMove.of([new Coord(8, 8), new Coord(7, 7)]);

            // Then the move should succeed
            await testUtils.expectMoveSuccess('#click-7-7', move);
        }));

        it('should show last move again when cancelling move', fakeAsync(async() => {
            // Given a component with one move already done, and a first click done
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click-8-8');

            // When clicking on an empty square
            await testUtils.expectClickFailure('#click-8-8');

            // Then the dropped piece should be displayed
            testUtils.expectElementToHaveClasses('#click-9-9', ['base', 'player0-fill']);
        }));

    });

    describe('view', () => {

        it('should show highlight when victory occur', fakeAsync(async() => {
            // Given a board where current player is about to win
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, X, X, X, X, O, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, X, O, O, O, O, O, X, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 7);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click-6-8');

            // When finishing your move
            const move: ConnectNMove = ConnectNMove.of([new Coord(6, 8), new Coord(5, 8)]);

            // Then the victory squares should be highlighted
            await testUtils.expectMoveSuccess('#click-5-8', move);
            testUtils.expectElementToHaveClass('#click-5-8', 'victory-stroke');
            testUtils.expectElementToHaveClass('#click-6-8', 'victory-stroke');
            testUtils.expectElementToHaveClass('#click-7-8', 'victory-stroke');
            testUtils.expectElementToHaveClass('#click-8-8', 'victory-stroke');
            testUtils.expectElementToHaveClass('#click-9-8', 'victory-stroke');
            testUtils.expectElementToHaveClass('#click-10-8', 'victory-stroke');
        }));

        it('should show previous move (first move)', fakeAsync(async() => {
            // Given a board with a last move
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When displaying it
            const previousMove: ConnectNMove = ConnectNMove.of([new Coord(9, 9)]);
            await testUtils.setupState(state, { previousMove });

            // Then last piece should have the highlight
            testUtils.expectElementToHaveClass('#click-9-9', 'last-move-stroke');
        }));

        it('should show previous move (next moves)', fakeAsync(async() => {
            // Given a board with a last move
            const gameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, X, X, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 1);
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );
            const previousMove: ConnectNMove = ConnectNMove.of([new Coord(10, 9), new Coord(11, 9)]);

            // When displaying it
            await testUtils.setupState(state, { previousMove });

            // Then last piece should have the highlight
            testUtils.expectElementToHaveClass('#click-10-9', 'last-move-stroke');
            testUtils.expectElementToHaveClass('#click-11-9', 'last-move-stroke');
        }));

    });

});

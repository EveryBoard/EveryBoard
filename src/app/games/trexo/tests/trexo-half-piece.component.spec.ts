/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';

import { Coord } from '../../../jscaip/Coord';
import { Coord3D } from '../../../jscaip/Coord3D';
import { SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { TrexoMove } from '../TrexoMove';
import { TrexoHalfPieceComponent } from '../trexo-half-piece.component';
import { TrexoComponent } from '../trexo.component';

describe('TrexoHalfPieceComponent', () => {

    function expectAllLinesToBeDisplayed(): void {
        /**
         * Then all those lines should be displayed:
         *     0------1
         *    /      /|
         *   2------3 |
         *   |      | 4
         *   |      |/
         *   5------6
         */
        testUtils.expectElementToExist('#line-0-to-1');
        testUtils.expectElementToExist('#line-2-to-3');
        testUtils.expectElementToExist('#line-5-to-6');
        testUtils.expectElementToExist('#line-0-to-2');
        testUtils.expectElementToExist('#line-1-to-3');
        testUtils.expectElementToExist('#line-4-to-6');
        testUtils.expectElementToExist('#line-2-to-5');
        testUtils.expectElementToExist('#line-3-to-6');
        testUtils.expectElementToExist('#line-1-to-4');
    }

    let testUtils: SimpleComponentTestUtils<TrexoHalfPieceComponent>;

    let component: TrexoHalfPieceComponent;

    /** Those are all the points, and line-A-to-B is the name of the line going from point A to point B
     * Pretty complex notation right ?
     *     0------1
     *    /      /|
     *   2------3 |
     *   |      | 4
     *   |      |/
     *   5------6
     */

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(TrexoHalfPieceComponent);
        component = testUtils.getComponent();
        testUtils.setInput('coord', new Coord3D(1, 1, 0));
        testUtils.setInput('mode', TrexoComponent.modeMap['3D']);
        testUtils.setInput('pieceClasses', []);
    }));

    it('should create', fakeAsync(async() => {
        testUtils.detectChanges();
        expect(component).toBeTruthy();
    }));

    it(`should display parallelogram as closed when missing move`, () => {
        // Given a component on which no move is given

        // When displaying it
        testUtils.detectChanges();

        // Then all lines should be displayed
        expectAllLinesToBeDisplayed();
    });

    it(`should display parallelogram as open to the right when it is the left part of the tile`, () => {
        // Given a component on which the move and coord indicate that the coord is on the left part of the tile
        testUtils.setInput('move', TrexoMove.from(new Coord(1, 1), new Coord(2, 1)).get());

        // When displaying it
        testUtils.detectChanges();

        /**
         * Then all those lines should be displayed:
         *     0------1
         *    /
         *   2------3
         *   |
         *   |
         *   5------6
         */
        testUtils.expectElementToExist('#line-0-to-1');
        testUtils.expectElementToExist('#line-2-to-3');
        testUtils.expectElementToExist('#line-5-to-6');
        testUtils.expectElementToExist('#line-0-to-2');
        testUtils.expectElementToExist('#line-2-to-5');
        testUtils.expectElementNotToExist('#line-1-to-4');
        testUtils.expectElementNotToExist('#line-1-to-3');
        testUtils.expectElementNotToExist('#line-4-to-6');
        testUtils.expectElementNotToExist('#line-3-to-6');
    });

    it(`should display parallelogram as open to the left when it is the rightmost part of the tile`, () => {
        // Given a component on which the move and coord indicate that the coord is on the right part of the tile
        testUtils.setInput('move', TrexoMove.from(new Coord(1, 1), new Coord(0, 1)).get());

        // When displaying it
        testUtils.detectChanges();

        /**
         * Then all those lines should be displayed:
         *     0------1
         *           /|
         *   2------3 |
         *          | 4
         *          |/
         *   5------6
         */
        testUtils.expectElementToExist('#line-0-to-1');
        testUtils.expectElementToExist('#line-2-to-3');
        testUtils.expectElementToExist('#line-5-to-6');
        testUtils.expectElementToExist('#line-1-to-3');
        testUtils.expectElementToExist('#line-4-to-6');
        testUtils.expectElementToExist('#line-3-to-6');
        testUtils.expectElementToExist('#line-1-to-4');
        testUtils.expectElementNotToExist('#line-0-to-2');
        testUtils.expectElementNotToExist('#line-2-to-5');
    });

    it(`should display parallelogram as open to the bottom when it is the upper part of the tile`, () => {
        // Given a component on which the move and coord indicate that the coord is on the top part of the tile
        testUtils.setInput('move', TrexoMove.from(new Coord(1, 1), new Coord(1, 2)).get());

        // When displaying it
        testUtils.detectChanges();

        /**
         * Then all those lines should be displayed:
         *     0------1
         *    /      /|
         *   2      3 |
         *            4
         *           /
         *          6
         */
        testUtils.expectElementToExist('#line-0-to-1');
        testUtils.expectElementToExist('#line-0-to-2');
        testUtils.expectElementToExist('#line-1-to-3');
        testUtils.expectElementToExist('#line-1-to-4');
        testUtils.expectElementToExist('#line-4-to-6');
        testUtils.expectElementNotToExist('#line-2-to-3');
        testUtils.expectElementNotToExist('#line-2-to-5');
        testUtils.expectElementNotToExist('#line-3-to-6');
        testUtils.expectElementNotToExist('#line-5-to-6');
    });

    it(`should display parallelogram as open to the top when it is the lower part of the tile`, () => {
        // Given a component on which the move and coord indicate that the coord is on the bottom part of the tile
        testUtils.setInput('move', TrexoMove.from(new Coord(1, 1), new Coord(1, 0)).get());

        // When displaying it
        testUtils.detectChanges();

        /**
         * Then all those lines should be displayed:
         *     0      1
         *    /      /
         *   2------3
         *   |      | 4
         *   |      |/
         *   5------6
         */
        testUtils.expectElementToExist('#line-2-to-3');
        testUtils.expectElementToExist('#line-5-to-6');
        testUtils.expectElementToExist('#line-0-to-2');
        testUtils.expectElementToExist('#line-1-to-3');
        testUtils.expectElementToExist('#line-4-to-6');
        testUtils.expectElementToExist('#line-2-to-5');
        testUtils.expectElementToExist('#line-3-to-6');
        testUtils.expectElementNotToExist('#line-0-to-1');
        testUtils.expectElementNotToExist('#line-1-to-4');
    });

    it(`should work the same when the coord is the "end" of the move not its start`, () => {
        // Given a component on which the move and coord indicate that the coord is on the bottom part of the tile
        testUtils.setInput('move', TrexoMove.from(new Coord(1, 0), new Coord(1, 1)).get());

        // When displaying it
        testUtils.detectChanges();

        /**
         * Then all those lines should be displayed:
         *     0      1
         *    /      /
         *   2------3
         *   |      | 4
         *   |      |/
         *   5------6
         */
        testUtils.expectElementToExist('#line-2-to-3');
        testUtils.expectElementToExist('#line-5-to-6');
        testUtils.expectElementToExist('#line-0-to-2');
        testUtils.expectElementToExist('#line-1-to-3');
        testUtils.expectElementToExist('#line-4-to-6');
        testUtils.expectElementToExist('#line-2-to-5');
        testUtils.expectElementToExist('#line-3-to-6');
        testUtils.expectElementNotToExist('#line-0-to-1');
        testUtils.expectElementNotToExist('#line-1-to-4');
    });

    it(`should display 'Z' on the piece when mustDisplayHeight is true`, () => {
        // Given a component with mustDisplayHeight as true
        testUtils.setInput('mustDisplayHeight', true);

        // When displaying it
        testUtils.detectChanges();

        // Then height should be displayed
        const height: DebugElement = testUtils.findElement('#height-1-1-0');
        expect(height.nativeElement.innerHTML).toBe('0');
    });

    it(`should not display 'Z' on the piece when mustDisplayHeight is false`, () => {
        // Given a component with mustDisplayHeight as false
        testUtils.setInput('mustDisplayHeight', false);

        // When displaying it
        testUtils.detectChanges();

        // Then height should be displayed
        testUtils.expectElementNotToExist('#height-1-1-0');
    });

    it('should display the full parallelogram when there is a victory highlight', () => {
        // Given a component with a victory highlight
        testUtils.setInput('move', TrexoMove.from(new Coord(1, 0), new Coord(1, 1)).get());
        testUtils.setInput('pieceClasses', ['victory-stroke']);

        // When displaying it
        testUtils.detectChanges();

        // Then all lines should be displayed
        expectAllLinesToBeDisplayed();
    });

    it('should display the full parallelogram when there is a last move highlight', () => {
        // Given a component with a victory highlight
        testUtils.setInput('move', TrexoMove.from(new Coord(1, 0), new Coord(1, 1)).get());
        testUtils.setInput('pieceClasses', ['last-move-stroke']);

        // When displaying it
        testUtils.detectChanges();

        // Then all lines should be displayed
        expectAllLinesToBeDisplayed();
    });

});

/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { CoordXYZ } from 'src/app/jscaip/CoordXYZ';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { TrexoHalfPieceComponent } from '../three-d-iso-square.component';
import { TrexoComponent } from '../trexo.component';
import { TrexoMove } from '../TrexoMove';

describe('ThreeDIsoSquareComponent', () => {

    let testUtils: SimpleComponentTestUtils<TrexoHalfPieceComponent>;

    let component: TrexoHalfPieceComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(TrexoHalfPieceComponent);
        component = testUtils.getComponent();
        component.coord = new CoordXYZ(1, 1, 0);
        component.mode = TrexoComponent.modeMap['3D'];
    }));

    it('should create', fakeAsync(async() => {
        // wait for the chat to be initialized (without it, ngOnInit will not be called)
        testUtils.detectChanges();
        expect(component).toBeTruthy();
    }));

    it(`should display rhombus as closed when missing move`, () => {
        // Given a component on which no move is given

        // When displaying it
        testUtils.detectChanges();

        // Then the component shoud have the 5 different potential piece (hence, a fully closed rhombus-prism)
        testUtils.expectElementToExist('#tile_1_1_0');
        testUtils.expectElementToExist('#right_up_1_1_0');
        testUtils.expectElementToExist('#down_right_1_1_0');
        testUtils.expectElementToExist('#right_down_1_1_0');
        testUtils.expectElementToExist('#down_left_1_1_0');
    });

    it(`should display rhombus as open to the right when lefter part of move`, () => {
        // Given a component on which the move and coord indicate that the coord is on the left part of the tile
        component.move = TrexoMove.from(new Coord(1, 1), new Coord(2, 1)).get();

        // When displaying it
        testUtils.detectChanges();

        // Then the component shoud have only the tile and the horizontal part oriented to the right
        testUtils.expectElementToExist('#tile_1_1_0');
        testUtils.expectElementToExist('#down_left_1_1_0');

        testUtils.expectElementNotToExist('#right_up_1_1_0');
        testUtils.expectElementNotToExist('#down_right_1_1_0');
        testUtils.expectElementNotToExist('#right_down_1_1_0');
    });

    it(`should display rhombus as open to the left when righter part of move`, () => {
        // Given a component on which the move and coord indicate that the coord is on the right part of the tile
        component.move = TrexoMove.from(new Coord(1, 1), new Coord(0, 1)).get();

        // When displaying it
        testUtils.detectChanges();

        // Then the component shoud have everything but the horizontal part oriented to the right
        testUtils.expectElementToExist('#tile_1_1_0');
        testUtils.expectElementToExist('#right_up_1_1_0');
        testUtils.expectElementToExist('#right_down_1_1_0');
        testUtils.expectElementToExist('#down_right_1_1_0');

        testUtils.expectElementNotToExist('#down_left_1_1_0');
    });

    it(`should display rhombus as open to the bottom when upper part of move`, () => {
        // Given a component on which the move and coord indicate that the coord is on the top part of the tile
        component.move = TrexoMove.from(new Coord(1, 1), new Coord(1, 2)).get();

        // When displaying it
        testUtils.detectChanges();

        // Then the component shoud have the tile and the right down "volume"
        testUtils.expectElementToExist('#tile_1_1_0');
        testUtils.expectElementToExist('#right_up_1_1_0');

        testUtils.expectElementNotToExist('#right_down_1_1_0');
        testUtils.expectElementNotToExist('#down_right_1_1_0');
        testUtils.expectElementNotToExist('#down_left_1_1_0');
    });

    it(`should display rhombus as open to the top when upper part of move`, () => {
        // Given a component on which the move and coord indicate that the coord is on the bottom part of the tile
        component.move = TrexoMove.from(new Coord(1, 1), new Coord(1, 0)).get();

        // When displaying it
        testUtils.detectChanges();

        // Then the component shoud have everything but the diagonal volume oriented down
        testUtils.expectElementToExist('#tile_1_1_0');
        testUtils.expectElementToExist('#right_down_1_1_0');
        testUtils.expectElementToExist('#down_right_1_1_0');
        testUtils.expectElementToExist('#down_left_1_1_0');

        testUtils.expectElementNotToExist('#right_up_1_1_0');
    });

    it(`should work the same when the coord is the "end" of the move not its start`, () => {
        // Given a component on which the move and coord indicate that the coord is on the bottom part of the tile
        component.move = TrexoMove.from(new Coord(1, 0), new Coord(1, 1)).get();

        // When displaying it
        testUtils.detectChanges();

        // Then the component shoud have everything but the diagonal volume oriented down
        testUtils.expectElementToExist('#tile_1_1_0');
        testUtils.expectElementToExist('#right_down_1_1_0');
        testUtils.expectElementToExist('#down_right_1_1_0');
        testUtils.expectElementToExist('#down_left_1_1_0');

        testUtils.expectElementNotToExist('#right_up_1_1_0');
    });

    it(`should display 'Z' on the piece when mustDisplayHeight is true`, () => {
        // Given a component with mustDisplayHeight as true
        component.mustDisplayHeight = true;

        // When displaying it
        testUtils.detectChanges();

        // Then height should be displayed
        const height: DebugElement = testUtils.findElement('#height_1_1_0');
        expect(height.nativeElement.innerHTML).toBe('0');
    });
    it(`should not display 'Z' on the piece when mustDisplayHeight is false`, () => {
        // Given a component with mustDisplayHeight as true
        component.mustDisplayHeight = false;

        // When displaying it
        testUtils.detectChanges();

        // Then height should be displayed
        testUtils.expectElementNotToExist('#height_1_1_0');
    });
});

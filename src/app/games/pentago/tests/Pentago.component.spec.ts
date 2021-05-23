import { fakeAsync } from '@angular/core/testing';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PentagoComponent } from '../Pentago.component';
import { PentagoMove } from '../PentagoMove';

describe('PentagoComponent:', () => {
    let componentTestUtils: ComponentTestUtils<PentagoComponent>;

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<PentagoComponent>('Pentago');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('PentagoComponent should be created');
    });
    it('Should do move in one click when click make all block are neutral', fakeAsync(async() => {
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        await componentTestUtils.expectMoveSuccess('#click_1_1', move);
    }));
    it('Should show a "skip rotation button" when there is both neutral and non-neutral blocks');
    it('Should display arrows to allow rotating specific block');
});

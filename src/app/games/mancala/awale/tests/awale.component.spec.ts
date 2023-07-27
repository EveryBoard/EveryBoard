/* eslint-disable max-lines-per-function */
import { AwaleComponent } from '../awale.component';
import { AwaleMove } from '../AwaleMove';
import { MancalaState } from 'src/app/games/mancala/commons/MancalaState';
import { DoMancalaComponentTests } from '../../commons/GenericMancalaComponentTest.spec';

describe('AwaleComponent', () => {

    DoMancalaComponentTests({
        component: AwaleComponent,
        gameName: 'Awale',
        mansoonableState: new MancalaState([
            [0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 4],
        ], 121, [0, 0]),
        mansooningMove: AwaleMove.FIVE,
        mansoonedCoords: [{ x: 5, y: 1, content: ' -5 ' }],
        capturableState: new MancalaState([
            [4, 1, 4, 4, 4, 4],
            [2, 4, 4, 4, 4, 4],
        ], 0, [0, 0]),
        capturingMove: AwaleMove.ZERO,
        capturedCoords: [{ x: 1, y: 0, content: ' -2 ' }],
    });
    // it('should display filled-then-captured capture', fakeAsync(async() => {
    //     // Given a board where some empty space could filled then captured
    //     const board: Table<number> = [
    //         [11, 4, 4, 4, 4, 0],
    //         [17, 4, 4, 4, 4, 4],
    //     ];
    //     const state: MancalaState = new MancalaState(board, 0, [0, 0]);
    //     await testUtils.setupState(state);

    //     // When doing the capturing move
    //     // const move: AwaleMove = AwaleMove.ZERO;
    //     // TODO: await expectMoveSuccess('#click_0_1', move);

    //     // Then the space in question should be marked as "captured"
    //     const content: DebugElement = testUtils.findElement('#secondary_message_5_0');
    //     expect(content.nativeElement.innerHTML).toBe(' -2 ');
    //     testUtils.expectElementToHaveClass('#circle_5_0', 'captured-fill');
    // }));
});

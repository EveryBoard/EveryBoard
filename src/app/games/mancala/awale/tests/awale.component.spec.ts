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

        fillableThenCapturableState: new MancalaState([
            [11, 4, 4, 4, 4, 0],
            [17, 4, 4, 4, 4, 4],
        ], 0, [0, 0]),
        fillingThenCapturingMove: AwaleMove.ZERO,
        filledThenCapturedCoords: [{ x: 5, y: 0, content: ' -2 ' }],
    });
});

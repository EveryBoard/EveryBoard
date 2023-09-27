/* eslint-disable max-lines-per-function */
import { AwaleComponent } from '../awale.component';
import { AwaleMove } from '../AwaleMove';
import { MancalaState } from 'src/app/games/mancala/common/MancalaState';
import { doMancalaComponentTests as doMancalaComponentTests } from '../../common/GenericMancalaComponentTest.spec';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';

describe('AwaleComponent', () => {

    doMancalaComponentTests({
        component: AwaleComponent,
        gameName: 'Awale',
        moveGenerator: new AwaleMoveGenerator(),
        distribution: {
            state: MancalaState.getInitialState(),
            move: AwaleMove.ZERO,
            result: [
                { x: 0, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 1, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 2, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 3, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
            ],
        },
        secondDistribution: {
            state: new MancalaState([
                [5, 5, 5, 5, 4, 4],
                [0, 4, 4, 4, 4, 4],
            ], 1, [0, 0]),
            move: AwaleMove.ONE,
            result: [
                { x: 2, y: 0, content: { mainContent: ' 6 ', secondaryContent: ' +1 ' } },
                { x: 3, y: 0, content: { mainContent: ' 6 ', secondaryContent: ' +1 ' } },
                { x: 4, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 5, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 5, y: 1, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
            ],
        },
        monsoon: {
            state: new MancalaState([
                [0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 4],
            ], 121, [0, 0]),
            move: AwaleMove.FIVE,
            result: [{ x: 5, y: 1, content: { mainContent: ' -5 ' } }],
        },
        capture: {
            state: new MancalaState([
                [4, 1, 4, 4, 4, 4],
                [2, 4, 4, 4, 4, 4],
            ], 0, [0, 0]),
            move: AwaleMove.ZERO,
            result: [{ x: 1, y: 0, content: { mainContent: ' -2 ' } }],
        },
        fillThenCapture: {
            state: new MancalaState([
                [11, 4, 4, 4, 4, 0],
                [17, 4, 4, 4, 4, 4],
            ], 0, [0, 0]),
            move: AwaleMove.ZERO,
            result: [{ x: 5, y: 0, content: { mainContent: ' -2 ' } }],
        },
    });
});

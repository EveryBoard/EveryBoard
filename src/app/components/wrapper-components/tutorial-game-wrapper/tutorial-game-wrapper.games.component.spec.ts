/* eslint-disable max-lines-per-function */
import { TutorialGameWrapperComponent } from './tutorial-game-wrapper.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { fakeAsync } from '@angular/core/testing';
import { GameWrapper } from '../GameWrapper';

describe('TutorialGameWrapperComponent (games)', () => {

    for (const game of GameInfo.ALL_GAMES()) {
        if (game.display) {
            it(game.urlName, fakeAsync(async() => {
                const wrapper: GameWrapper =
                    (await ComponentTestUtils.forGame(game.urlName, TutorialGameWrapperComponent)).wrapper;
                expect(wrapper).toBeTruthy();
            }));
        }
    }
});

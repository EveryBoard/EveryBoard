import { fakeAsync } from '@angular/core/testing';
import { GameInfo } from 'src/app/components/normal-component/pick-game/pick-game.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { NewGameComponent } from '../new-game.component';
import { NewGameRules } from '../NewGameRules';
import { NewGameTutorial } from '../NewGameTutorial';

fdescribe('NewGameComponent', () => {
    let testUtils: ComponentTestUtils<NewGameComponent>;

    beforeEach(fakeAsync(async() => {
        // This next statement *should be removed for any real game*.
        // Instead, you should look at the README at how to add your game to the project.
        spyOn(GameInfo, 'ALL_GAMES').and.returnValue([
            new GameInfo('New Game', 'NewGame', NewGameComponent, new NewGameTutorial(), NewGameRules.get(), new Date('2018-08-28'), 'This is the one-line description of the game'),
        ]);
        // This `testUtils` will be used throughout the test suites as a matcher for various test conditions
        testUtils = await ComponentTestUtils.forGame<NewGameComponent>('NewGame');
    }));
    it('should create', () => {
        // This test is done in all games to ensure that their initialization works as expected
        testUtils.expectToBeCreated();
    });
    /**
     * For the remaining tests, you want to cover all possible uses of the component.
     * You can rely on these:
     *   - `testUtils.setupState` to change the game state of the component
     *   - `testUtils.expectMoveSuccess` to ensure that a move can be performed by clicking on an element
     *   - `testUtils.expectClickSuccess` to ensure that a click works, e.g., to build part of a move
     *   - `testUtils.expectMoveFailure` to ensure that a move fails as expected, showing a toast to the user
     *   - `testUtils.expectClickFailure` to ensure that a click is rejected by the component, showing a toast to the
     *     user. The difference between a click failure and a move failure is that the move failure is generated by the
     *     rules, while the click failure is generated by the component.
     *   - `testUtils.expectElementToExist` to check the presence of an HTML element on the component, given its id
     *   - `testUtils.expectElementNotToExist` to check the absence of an HTML element on the component, given its id
     *   - `testUtils.expectElementToHaveClass` to check that an existing HTML element has a given CSS class
     */
});

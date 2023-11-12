import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';

export class DraughtTutorial extends Tutorial {
    /**
     * A tutorial is simply a list of `TutorialStep`s.
     * There are multiple kinds of tutorial steps:
     *   - `informational` only displays a state and a message
     *   - `anyMove` expects the user to perform any move
     *   - `fromMove` expects the user to perform a specific move
     *   - `forClick` expects the user to perform a specific click
     *   - `forPredicate` expects the user to perform a move that matches a given predicate
     */
    public tutorial: TutorialStep[] = [];
}

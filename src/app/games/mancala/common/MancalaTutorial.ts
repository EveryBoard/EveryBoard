import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { MancalaMove } from './MancalaMove';
import { MancalaState } from './MancalaState';

export class MancalaTutorial {

    // public static SOWING: (solutionMove: MancalaMove, config: MancalaConfig) => TutorialStep =
    //     (solutionMove: MancalaMove, config: MancalaConfig) => TutorialStep.fromMove(
    //         $localize`Sowing`, TODO
    //         $localize`The main move in Mancala games is sowing, let's see how seeds are sown. As you are playing Dark, the 6 houses on the bottom are yours.<br/><br>Click on the rightmost bottom house to sow the seeds it contains: they will be sown clockwise, one seed per house.<br/><br/>Click on the rightmost house!`,
    //         MancalaRules.getInitialState(config),
    public static sowing(state: MancalaState, solutionMove: MancalaMove): TutorialStep {
        return TutorialStep.fromMove(
            $localize`Sowing`,
            $localize`The main move in Mancala games is sowing, let's see how seeds are sown. As you are playing Dark, the 6 houses on the bottom are yours.<br/><br>Click on the rightmost bottom house to sow the seeds it contains: they will be sown clockwise, one seed per house.<br/><br/>Click on the rightmost house!`,
            state,
            [solutionMove],
            $localize`Look at the 4 houses that follow clockwise the one you picked, they now contain 5 seeds. This is how seeds are sown: one by one from the house next to the one they come from, clockwise.`,
            $localize`Failed. Choose the rightmost house on the bottom.`,
        );
    }
}

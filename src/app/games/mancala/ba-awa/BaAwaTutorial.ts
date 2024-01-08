import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { BaAwaConfig } from './BaAwaConfig';
import { BaAwaRules } from './BaAwaRules';
import { MancalaTutorial } from '../common/MancalaTutorial';
import { MancalaState } from '../common/MancalaState';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';

const defaultConfig: MGPOptional<BaAwaConfig> = BaAwaRules.get().getDefaultRulesConfig();

export class BaAwaTutorial extends Tutorial {

    public gameName: string = $localize`Ba-awa`;

    public tutorial: TutorialStep[] = [
        MancalaTutorial.intro(
            this.gameName,
            BaAwaRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Kalah`,
            $localize`Bonus fact: Ba-awa, also called Adi, is played mainly in Ghana.`,
            BaAwaRules.get().getInitialState(defaultConfig),
        ),
        MancalaTutorial.sowing(
            new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 9],
            ], 0, [0, 0]),
        ),
        TutorialStep.fromMove(
            $localize`Multiple laps sowing`,
            $localize`However, the distribution only stop when the last house contains, after you dropped your last seed, zero or four seeds.<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 2, 0, 0, 2, 0],
                [0, 0, 0, 5, 0, 0],
            ], 0, [0, 0]),
            [MancalaMove.of(MancalaDistribution.of(3))],
            $localize`So, after landing in the house with 3 seeds, a second lap has been started`,
            $localize`Failed, try again`,
        ),
        TutorialStep.fromMove(
            $localize`Captures during move (1/2)`,
            $localize`If, during some distribution, you pass by one of your house that contains 3 seeds, and drop a fourth seed, you capture it immediately!<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 8, 0, 0, 0, 0],
                [0, 0, 3, 2, 0, 0],
            ], 0, [0, 0]),
            [MancalaMove.of(MancalaDistribution.of(3))],
            $localize`Congratulation, you captured 4 seeds.`,
            $localize`Wrong, you did not capture anything.`,
        ),
        TutorialStep.fromMove(
            $localize`Captures during move (2/2)`,
            $localize`If, during some distribution, you pass by one house of the opponent that contains 3 seeds, and drop a fourth seed, the opponent capture it immediately!<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 3, 0, 0, 8, 0],
                [3, 0, 1, 0, 0, 0],
            ], 0, [0, 0]),
            [MancalaMove.of(MancalaDistribution.of(0))],
            $localize`There it is, the opponent captured 4 seeds.`,
            $localize`Wrong, you did not capture anything.`,
        ),
        TutorialStep.fromMove(
            $localize`Captures`,
            $localize`Though, if your very last seed is drop in a house of the opponent that contains 3 seeds, you capture it immediately!<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 1, 1, 3, 8, 0],
                [2, 7, 2, 0, 0, 0],
            ], 0, [0, 0]),
            [MancalaMove.of(MancalaDistribution.of(0))],
            $localize`There it is, the opponent captured 4 seeds.`,
            $localize`Wrong, you did not capture anything.`,
        ),
        TutorialStep.fromMove(
            $localize`End game`,
            $localize`At any end of turn, if the number of seed reach 8 or less, the first player capture capture the 8 seeds`,
            new MancalaState([
                [0, 1, 1, 3, 8, 0],
                [2, 7, 2, 0, 0, 0],
            ], 0, [0, 0]),
            [MancalaMove.of(MancalaDistribution.of(0))],
            $localize`There it is, the opponent captured 4 seeds.`,
            $localize`Wrong, you did not capture anything.`,
        ),
    ];
}

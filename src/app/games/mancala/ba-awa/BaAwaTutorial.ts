import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { MGPOptional } from '@everyboard/lib';
import { BaAwaConfig } from './BaAwaConfig';
import { BaAwaRules } from './BaAwaRules';
import { MancalaTutorial } from '../common/MancalaTutorial';
import { MancalaState } from '../common/MancalaState';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

const defaultConfig: MGPOptional<BaAwaConfig> = BaAwaRules.get().getDefaultRulesConfig();

export class BaAwaTutorial extends Tutorial {

    public gameName: string = $localize`Ba-awa`;

    public tutorial: TutorialStep[] = [
        MancalaTutorial.intro(
            this.gameName,
            BaAwaRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Ba-awa`,
            $localize`Bonus fact: Ba-awa, also called Adi, is played mainly in Ghana.`,
            BaAwaRules.get().getInitialState(defaultConfig),
        ),
        MancalaTutorial.sowing(
            new MancalaState([
                [4, 4, 4, 4, 4, 4],
                [4, 0, 4, 4, 4, 4],
            ], 0, PlayerNumberMap.of(0, 0)),
        ),
        TutorialStep.fromMove(
            $localize`Multiple laps sowing`,
            $localize`However, the distribution only stops when the last seed is dropped in a house that contains zero or three seeds (before drop).<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 2, 4, 0, 0, 0],
                [0, 0, 0, 5, 0, 0],
            ], 0, PlayerNumberMap.of(0, 0)),
            [MancalaMove.of(MancalaDistribution.of(3))],
            $localize`So, after landing in the house with 2 seeds (then 3), a second lap has been started.`,
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Captures during distribution` + ' (1/2)',
            $localize`If, during some distribution, you pass by one of your houses that contains 3 seeds, and drop a fourth seed, you capture the house immediately, then continue the distribution!<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 8, 0, 0, 0, 0],
                [0, 0, 3, 2, 0, 0],
            ], 0, PlayerNumberMap.of(0, 0)),
            [MancalaMove.of(MancalaDistribution.of(3))],
            $localize`Congratulations, you captured 4 seeds.`,
            MancalaTutorial.YOU_DID_NOT_CAPTURE_ANY_SEEDS(),
        ),
        TutorialStep.fromMove(
            $localize`Captures during distribution` + ' (2/2)',
            $localize`If, during some distribution, you pass by one house of the opponent that contains 3 seeds, and drop a fourth seed, the opponent captures the house immediately, while you continue to distribute.<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 3, 0, 0, 8, 0],
                [3, 0, 1, 0, 0, 0],
            ], 0, PlayerNumberMap.of(0, 0)),
            [MancalaMove.of(MancalaDistribution.of(0))],
            $localize`There it is, the opponent captured 4 seeds.`,
            MancalaTutorial.YOU_DID_NOT_CAPTURE_ANY_SEEDS(),
        ),
        TutorialStep.fromMove(
            $localize`Captures`,
            $localize`Though, if your very last seed is dropped in a house of the opponent that contains 3 seeds (4 with your seed), you capture it immediately!<br/><br/>You're playing Dark, do such a move!`,
            new MancalaState([
                [0, 1, 1, 3, 8, 0],
                [2, 7, 2, 0, 0, 0],
            ], 0, PlayerNumberMap.of(0, 0)),
            [MancalaMove.of(MancalaDistribution.of(0))],
            $localize`Congratulations, you captured 4 seeds.`,
            MancalaTutorial.YOU_DID_NOT_CAPTURE_ANY_SEEDS(),
        ),
        TutorialStep.fromMove(
            TutorialStepMessage.END_OF_THE_GAME(),
            $localize`At the end of a turn, if the number of seeds reaches 8 or less, the first player (Dark) captures the remaining seeds.<br/><br/>You're playing Dark, end the game by capturing!`,
            new MancalaState([
                [0, 1, 1, 3, 0, 0],
                [1, 0, 2, 0, 0, 4],
            ], 0, PlayerNumberMap.of(0, 0)),
            [MancalaMove.of(MancalaDistribution.of(2))],
            $localize`There it is, you captured all remaining seeds.`,
            MancalaTutorial.YOU_DID_NOT_CAPTURE_ANY_SEEDS(),
        ),
    ];
}

import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaConfig } from '../common/MancalaConfig';
import { BaAwaRules } from './BaAwaRules';
import { MancalaTutorial } from '../common/MancalaTutorial';
import { MancalaState } from '../common/MancalaState';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';

const defaultConfig: MGPOptional<MancalaConfig> = BaAwaRules.get().getDefaultRulesConfig();

export class BaAwaTutorial extends Tutorial {

    public gameName: string = $localize`Ba-awa`;

    public tutorial: TutorialStep[] = [
        // 1. voici le plateau
        MancalaTutorial.intro(
            this.gameName,
            BaAwaRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Kalah`,
            $localize`Bonus fact: Ba-awa, also called Adi, is played mainly in Ghana.`,
            BaAwaRules.get().getInitialState(defaultConfig),
        ),
        // 2. voici une distribution à la zob en un seul lap
        MancalaTutorial.sowing(
            new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 11],
            ], 0, [0, 0]),
        ),
        // 3. voici une distribution en deux lap
        TutorialStep.anyMove(
            $localize`Multiple laps sowing`,
            $localize`However, the distribution only stop when the last house contains, after you dropped your last seed, zero or four seeds. Example here`,
            new MancalaState([
                [0, 2, 0, 0, 0, 0],
                [0, 0, 0, 5, 0, 0],
            ], 0, [0, 0]),
            MancalaMove.of(MancalaDistribution.of(3)),
            $localize`So, after landing in a house with 3 seeds, a second lap has been started`,
        ),
        // 4. voici une distribution capturant-au-passage chez vous
        // 5. voici une distribution capturant-au-passage chez lui
        // 4. voici un simple lap capturant chez vous
        // 5. voici un simple lap capturant chez lui
        // 6. voici une capture chez l'autre à proporement parler
        // 7. Quand on tombe à 8graines ou moins, on finit !
    ];
}

import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { AbaloneGameState } from './AbaloneGameState';

export const abaloneDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'Plateau',
        `À l'Abalone, le but du jeu est d'être le premier joueur à pousser 6 pièces adverses en dehors du plateau. Voyons voir comment!`,
        AbaloneGameState.getInitialSlice(),
    ),
];

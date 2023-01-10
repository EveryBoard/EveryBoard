import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { TrexoMove } from './TrexoMove';
import { TrexoState } from './TrexoState';

export class TrexoTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        // 1. but du jeu et plateau
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`At Trexo, the goal of the game is to align 5 piece of your color in an horizontal, vertical or diagonal line. But the thing is that player, each at their turn, put a tile of the board, that tile is constituted of two piece, one from the opponent, one from you!`,
            TrexoState.getInitialState()),
        TutorialStep.anyMove(
            $localize`Dropping a tile`,
            $localize`When you drop at tile, it need to be on even ground, and it cannot be right on top of another tile. In others words, it need to be either on the floor, either on two tiles at the same height. To do that, just click on the place where you want to put the opponent piece, then on the neighboring square where you want to put your piece.<br/><br/>You're playing Dark, go ahead.`,
            TrexoState.getInitialState(),
            TrexoMove.from(new Coord(4, 4), new Coord(3, 4)).get(),
            $localize`Congratulation!`),
        // 3. Placer une pièce en hauteur

        // 4. Victoire
    ];
}

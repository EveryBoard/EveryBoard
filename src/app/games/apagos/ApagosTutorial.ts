import { ApagosMove } from 'src/app/games/apagos/ApagosMove';
import { ApagosState } from 'src/app/games/apagos/ApagosState';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { ApagosCoord } from './ApagosCoord';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class ApagosTutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board and goal of the game`,
            $localize`At Apagos, there is 4 squares, each of them have a fix number of holes to put pieces, each player start with 10 pieces. Dark pieces belong to first player, light pieces belong to the second one. The game ends when no player can do a move, the player owning the most pieces in the righter square wins!`,
            ApagosState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Drop`,
            $localize`One of the two kind of move is the drop. To do one, you must click on any visible arrow, being of your color or the opponent's. If the receiving square is one of the 3 lefter ones, it will 'climb' one step right, and the one on its right will slide one step below. You play Light.<br/><br/>Drop a piece on one of thoses three squares.`,
            ApagosState.fromRepresentation(1, [
                [0, 0, 0, 1],
                [0, 0, 0, 0],
                [7, 5, 3, 1],
            ], 9, 10),
            ApagosMove.drop(ApagosCoord.ZERO, Player.ZERO),
            $localize`Bravo!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Transfer`,
            $localize`The other kind of move is the transfer.<ol><li>Choose one of your pieces on the board by clicking on the square in which it is.</li><li>Choose its landing square by clicking on one of the arrow to finish the transfer.</li></ol>It can only be done with your pieces, from an higher square to a lower one.<br/><br/>You're playing Dark, do a transfer!`,
            ApagosState.fromRepresentation(2, [
                [0, 0, 1, 0],
                [0, 1, 0, 0],
                [7, 5, 3, 1],
            ], 9, 9),
            ApagosMove.transfer(ApagosCoord.TWO, ApagosCoord.ZERO).get(),

            (move: ApagosMove, _: ApagosState) => {
                if (move.isDrop()) {
                    return MGPValidation.failure($localize`This move is a drop! Please do a transfer!`);
                }
                return MGPValidation.SUCCESS;
            },
            $localize`Bravo!`,
        ),
        // TODOTODO explain victory
    ];
}

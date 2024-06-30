import { ApagosMove } from 'src/app/games/apagos/ApagosMove';
import { ApagosState } from 'src/app/games/apagos/ApagosState';
import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { ApagosConfig, ApagosRules } from './ApagosRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const defaultConfig: MGPOptional<ApagosConfig> = ApagosRules.get().getDefaultRulesConfig();

export class ApagosTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`At Apagos, there are 4 squares, each of them has a fixed number of holes for pieces. Each player starts with 10 pieces. Dark pieces belong to the first player, light pieces belong to the second one. The game ends when no one can play. The player owning the most pieces in the rightmost square wins!`,
            ApagosRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Drop`,
            $localize`There are two kinds of moves. One is the drop. To do one, you must click on a visible arrow, being of your color or the opponent's. If the chosen square is one of the 3 leftmost ones, it will exchange position with the square on its right.<br/><br/>You're playing Light. Drop a piece on one of those three squares.`,
            ApagosState.fromRepresentation(1, [
                [0, 0, 0, 1],
                [0, 0, 0, 0],
                [7, 5, 3, 1],
            ], 9, 10),
            ApagosMove.drop(0, Player.ZERO),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Transfer`,
            $localize`The other kind of move is the transfer.<ol><li>Choose one of your pieces on the board by clicking on the square in which it is.</li><li>Choose its landing square by clicking on one of the arrow to finish the transfer.</li></ol>It can only be done with your pieces, from a higher square to a lower one.<br/><br/>You're playing Dark, do a transfer!`,
            ApagosState.fromRepresentation(2, [
                [0, 0, 1, 0],
                [0, 1, 0, 0],
                [7, 5, 3, 1],
            ], 9, 9),
            ApagosMove.transfer(2, 0).get(),

            (move: ApagosMove, _previous: ApagosState, _result: ApagosState) => {
                if (move.isDrop()) {
                    return MGPValidation.failure($localize`This move is a drop, please do a transfer!`);
                }
                return MGPValidation.SUCCESS;
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Victory`,
            $localize`When you put a last piece into a square, the games end. In this configuration you can win.<br/><br/>You're playing Light, do the winning move!`,
            ApagosState.fromRepresentation(3, [
                [1, 0, 3, 4],
                [2, 1, 3, 1],
                [3, 1, 7, 5],
            ], 2, 3),
            ApagosMove.drop(2, Player.ONE),

            (move: ApagosMove, _previous: ApagosState, _result: ApagosState) => {
                if (move.isDrop()) {
                    if (move.piece.equalsValue(Player.ONE)) {
                        return MGPValidation.SUCCESS;
                    } else {
                        return MGPValidation.failure($localize`You actively made your opponent win!`);
                    }
                } else {
                    return MGPValidation.failure($localize`Wrong choice, your opponent will win in the next turn no matter which piece is dropped!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
    ];
}

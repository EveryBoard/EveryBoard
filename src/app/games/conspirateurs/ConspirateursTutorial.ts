import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from '@everyboard/lib';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursState } from './ConspirateursState';
import { ConspirateursRules } from './ConspirateursRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class ConspirateursTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`Conspirateurs is played on a 17x17 board. The object of the game is to place all of your pieces in shelters, which are the special squares on the edge of the board. Note the central zone in the middle of the board, where each player will put their pieces initially.`,
            ConspirateursRules.get().getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Initial phase`,
            $localize`In the initial phase of the game, each player drop their 20 pieces, one per turn consecutively, in the central zone of the board. This phase does not allow any other kind of move.<br/><br/>You're playing Dark, drop one of your piece in the central zone.`,
            ConspirateursRules.get().getInitialState(),
            ConspirateursMoveDrop.of(new Coord(7, 7)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Simple move`,
            $localize`Once all pieces have been placed, there are two kind of moves that can be performed. The first is a simple move in any direction, orthogonally or diagonally, of a single step.<br/><br/>You're playing Dark. Click on one of your piece and perform such a move.`,
            new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, O, X, X, O, O, X, O, X, _, _, _, _],
                [_, _, _, _, O, X, O, X, O, O, O, O, X, _, _, _, _],
                [_, _, _, _, O, X, _, _, _, _, _, X, O, _, _, _, _],
                [_, _, _, _, X, O, O, X, X, X, O, O, O, _, _, _, _],
                [_, _, _, _, X, O, X, X, X, X, X, X, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 40),
            ConspirateursMoveSimple.from(new Coord(4, 6), new Coord(3, 5)).get(),
            (move: ConspirateursMove, _previous: ConspirateursState, _result: ConspirateursState) => {
                if (ConspirateursMove.isSimple(move)) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You have made a jump, not a simple move. Try again!`);
                }

            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Jumps`,
            $localize`The other type of move is a jump. A piece can jump over a neighboring piece in any direction, as long as it lands directly on the square after that piece, along the same direction.<br/><br/>You're playing Dark. Perform a jump by clicking on one of your piece that can perform a jump, and then on the target square. You may need to click a second time on the target square to confirm your jump, in case your piece is still highlighted (we will see shortly why this is useful).`,
            new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, O, X, X, O, O, X, O, X, _, _, _, _],
                [_, _, _, _, O, X, O, X, O, O, O, O, X, _, _, _, _],
                [_, _, _, _, O, X, _, _, _, _, _, X, O, _, _, _, _],
                [_, _, _, _, X, O, O, X, X, X, O, O, O, _, _, _, _],
                [_, _, _, _, X, O, X, X, X, X, X, X, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 40),
            ConspirateursMoveJump.from([new Coord(6, 7), new Coord(6, 5)]).get(),
            (move: ConspirateursMove, _previous: ConspirateursState, _result: ConspirateursState) => {
                if (ConspirateursMove.isJump(move)) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You have not performed a jump. Try again!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Chaining jumps in a single move`,
            $localize`Jumps can be chained when possible. You can decide whether to continue a jump or to stop it at any time. To finish your jump, click a second time on your current location. Otherwise, simply keep clicking on your next location. Once no more destination is possible, your move will end without you needing to click the piece a second time.<br/><br/>You're playing Dark and you can perform a triple jump! Do it.`,
            new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, O, _, X, O, O, X, O, X, _, _, _, _],
                [_, _, _, _, O, _, O, X, O, O, O, O, X, _, _, _, _],
                [_, _, _, _, O, X, _, _, _, _, _, X, O, _, _, _, _],
                [_, _, _, _, X, O, O, X, X, X, O, O, O, _, _, _, _],
                [_, _, _, _, X, O, X, X, X, X, X, X, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 40),
            [ConspirateursMoveJump.from([new Coord(8, 6), new Coord(6, 4), new Coord(6, 2), new Coord(6, 0)]).get()],
            $localize`Congratulations! You now know everything to play the game. Remember: to win, you have to place all of your pieces in shelters before your opponent does.`,
            $localize`You have not performed a triple jump. Try again!`,
        ),
    ];
}

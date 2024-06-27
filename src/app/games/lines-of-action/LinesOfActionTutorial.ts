import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from '@everyboard/lib';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';
import { LinesOfActionRules } from './LinesOfActionRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class LinesOfActionTutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Lines of Actions, the goal is to group your pieces contiguously, orthogonally and/or diagonally.
        Here, Dark wins the game:
        Dark's pieces are forming a single group, while Light's pieces form three groups.`,
            new LinesOfActionState([
                [_, _, _, _, _, _, _, _],
                [X, _, _, _, O, _, _, X],
                [_, _, O, O, X, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], 0),
        ),
        TutorialStep.anyMove(
            $localize`Initial board and initial move`,
            $localize`Here is the initial board.
         Moves can be made orthogonally or diagonally.
         The length of a move is equal to the number of pieces that are on the line of the move.
         Note that there is a helping indicator to let you know where a piece can land when you select it.<br/><br/>
         You're playing Dark, make the first move!`,
            LinesOfActionRules.get().getInitialState(),
            LinesOfActionMove.from(new Coord(1, 7), new Coord(1, 5)).get(),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Jumping`,
            $localize`During a move, it is possible to jump above your own pieces.
        But it is forbidden to jump over the opponent's pieces.<br/><br/>
        You're playing Dark, make a jump over one of your pieces on the following board.`,
            new LinesOfActionState([
                [_, _, _, _, _, _, _, _],
                [_, _, X, O, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, O],
            ], 0),
            [LinesOfActionMove.from(new Coord(3, 1), new Coord(6, 1)).get()],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Failed. You did not jump over one of your pieces.`,
        ),
        TutorialStep.fromMove(
            $localize`Moving`,
            $localize`Here is a different board. Pick the dark piece in the middle (line 4, column 4)
        and observe its possible moves.
        <ul>
            <li>Horizontally, this piece can move only of one square because it is the only piece on this line.</li>
            <li>Vertically, this piece can move of three squares because there are in total three pieces on that vertical line.
                But it can only go up, as below it the landing square is occupied by one of your pieces.</li>
            <li>Diagonally, only one move is possible: on the diagonal that contains three pieces,
                only in the direction where it does not jump over one of the opponent's pieces.
                On the other diagonal, there are too many pieces to end the move on the board.</li>
        </ul><br/>
        You're playing Dark, make one of these moves.`,
            new LinesOfActionState([
                [_, _, _, _, _, _, X, _],
                [_, _, _, _, _, O, _, _],
                [_, _, _, _, X, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, X, _, X],
                [_, _, _, O, _, _, X, X],
                [_, _, _, O, _, _, _, _],
            ], 0),
            [
                LinesOfActionMove.from(new Coord(3, 3), new Coord(3, 0)).get(),
                LinesOfActionMove.from(new Coord(3, 3), new Coord(0, 0)).get(),
                LinesOfActionMove.from(new Coord(3, 3), new Coord(2, 3)).get(),
                LinesOfActionMove.from(new Coord(3, 3), new Coord(4, 3)).get(),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Failed. This was not one of the expected moves.`,
        ),
        TutorialStep.fromPredicate(
            $localize`Captures`,
            $localize`If a move ends on an opponent's piece, it is captured and removed from the board.
        However, a move cannot end on one of the player's pieces.
        Watch out, having less pieces at Lines of Action makes a victory easier, as there are less pieces to regroup!
        If a player has only one piece, that player wins the game.<br/><br/>
        On the following board, try to capture one piece with Dark.`,
            new LinesOfActionState([
                [_, O, _, O, O, O, O, _],
                [X, _, _, _, _, _, _, X],
                [_, _, O, _, X, _, _, _],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [_, O, O, O, O, O, O, _],
            ], 0),
            LinesOfActionMove.from(new Coord(2, 2), new Coord(4, 2)).get(),
            (move: LinesOfActionMove, previous: LinesOfActionState, _result: LinesOfActionState): MGPValidation => {
                if (previous.getPieceAt(move.getEnd()) === PlayerOrNone.ONE) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure(TutorialStepMessage.FAILED_TRY_AGAIN());
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Tie`,
            $localize`In the special case where a move ends up connecting all pieces of both player, simultaneously,
        then the game ends up with a tie.<br/><br/>
        You're playing Dark, force the tie in one move.`,
            new LinesOfActionState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [O, _, _, O, X, O, _, _],
                [_, _, _, O, _, _, _, X],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
            ], 0),
            [LinesOfActionMove.from(new Coord(0, 2), new Coord(4, 2)).get()],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
    ];
}

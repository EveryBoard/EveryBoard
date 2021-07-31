import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';

const X: number = Player.ZERO.value;
const O: number = Player.ONE.value;
const _: number = Player.NONE.value;

export const linesOfActionTutorial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Goal of the game`,
        $localize`At Lines of Actions, the goal is to group your pieces contiguously, orthogonally and/or diagonally.
        Here, Dark wins the game:
        Darks's pieces are forming a single group, while Light's pieces form three groups.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [O, _, _, _, X, _, _, O],
            [_, _, X, X, O, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ], 0),
    ),
    DidacticialStep.anyMove(
        $localize`Initial board and moves`,
        $localize`Here is the initial board.
         Moves can be made orthogonally or diagonally.
         The length of a move is equal to the number of pieces that are on the line of the move.
         Note that there is a helping indicator to let you know where a piece can land when you select it.<br/><br/>
         You're playing Dark, make the first move!`,
        LinesOfActionState.getInitialSlice(),
        new LinesOfActionMove(new Coord(1, 7), new Coord(1, 5)),
        $localize`Congratulations!`,
    ),
    DidacticialStep.fromMove(
        $localize`Jumping`,
        $localize`During a move, it is possible to jump above your own pieces.
        But it is forbidden to jump over the opponent's pieces.<br/><br/>
        You're playing Dark, make a jump over one of your pieces on the following board.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [_, _, O, X, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, X],
        ], 0),
        [new LinesOfActionMove(new Coord(3, 1), new Coord(6, 1))],
        $localize`Congratulations!`,
        $localize`Failed. You did not jump over one of your pieces.`,
    ),
    DidacticialStep.fromMove(
        $localize`Moving`,
        $localize`Here is a different board. Pick the dark piece in the middle (line 4, column 4)
        and observe its possible moves.
        Horizontally, this piece can move only of one square because it is the only piece on this line.
        Vertically, this piece can move of three squares because there are in total three pieces on that vertical line.
        But it can only go up, as below it the landing case is occupied by one of your pieces.
        Diagonally, only one move is possible: on the diagonal that contains three pieces,
        only in the direction where it does not jump over one of the opponent's pieces.
        On the other diagonal, there are too many pieces to end the move on the board.<br/><br/>
        Make one of these moves.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, O, _],
            [_, _, _, _, _, X, _, _],
            [_, _, _, _, O, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, O, _, O],
            [_, _, _, X, _, _, O, O],
            [_, _, _, X, _, _, _, _],
        ], 0),
        [
            new LinesOfActionMove(new Coord(3, 3), new Coord(3, 0)),
            new LinesOfActionMove(new Coord(3, 3), new Coord(0, 0)),
            new LinesOfActionMove(new Coord(3, 3), new Coord(2, 3)),
            new LinesOfActionMove(new Coord(3, 3), new Coord(4, 3)),
        ],
        $localize`Congratulations!`,
        $localize`Failed. This was not one of the expected moves.`,
    ),
    DidacticialStep.fromMove(
        $localize`Capturing`,
        $localize`If a move ends on an opponent's pieces, this one is captured and removed from the board.
        However, a move cannot end on one of the player's pieces.
        Watch out, having less pieces at Lines of Action makes a victory easier, as there are less pieces to regroup!
        If a player has only one piece, that player wins the game.<br/><br/>
        On the following board, try to capture one piece with Dark.`,
        new LinesOfActionState([
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, X, _, O, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ], 0),
        [new LinesOfActionMove(new Coord(2, 2), new Coord(4, 2))],
        $localize`Congratulations!`,
        $localize`Failed!`,
    ),
    DidacticialStep.fromMove(
        $localize`Tie`,
        $localize`In the special case where a move ends up connecting all pieces of both player, simultaneously,
        then the game ends up with a tie.<br/><br/>
        You're playing Dark, force the tie in one move.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [X, _, _, X, O, X, _, _],
            [_, _, _, X, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ], 0),
        [new LinesOfActionMove(new Coord(0, 2), new Coord(4, 2))],
        $localize`Congratulations!`,
        $localize`Failed!`,
    ),
];

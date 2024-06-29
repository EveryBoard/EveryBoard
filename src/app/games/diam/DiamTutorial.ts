import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { DiamMoveDrop, DiamMoveShift } from './DiamMove';
import { DiamPiece } from './DiamPiece';
import { DiamState } from './DiamState';
import { DiamRules } from './DiamRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const __: DiamPiece = DiamPiece.EMPTY;
const A1: DiamPiece = DiamPiece.ZERO_FIRST;
const A2: DiamPiece = DiamPiece.ZERO_SECOND;
const B1: DiamPiece = DiamPiece.ONE_FIRST;
const B2: DiamPiece = DiamPiece.ONE_SECOND;

export class DiamTutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board and player pieces`,
            $localize`Diam's board is a circular board made of 8 spaces. Each player has 8 pieces: 4 of one color, and 4 of another color. Initially, the board is empty. All the remaining pieces are displayed next to the board: Dark's pieces are on the left, Light's pieces are on the right.`,
            DiamRules.get().getInitialState(),
        ),
        TutorialStep.fromMove(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Diam, the goal is to align two of your pieces, having exactly the same color, on diametrically opposed spaces, on top of at least another piece. Note here that Dark does not win because the dark pieces are not on top of any other piece. You're playing Light. Here, you can win by dropping one of your pieces on the leftmost space. You can do it by clicking on the corresponding piece next to the board, and then on the space in which you want to drop your piece.<br/><br/>You're playing Light, win the game!`,
            DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, B1, __, __, __],
                [A1, __, __, __, A1, __, __, __],
            ], 3),
            [new DiamMoveDrop(0, DiamPiece.ONE_FIRST)],
            TutorialStepMessage.CONGRATULATIONS_YOU_WON(),
            $localize`Failed, you should drop your piece on the leftmost space, using the piece of the same color of the other piece you already have on the board.`,
        ),
        TutorialStep.fromMove(
            $localize`Types of move`,
            $localize`You can perform two types of move: either dropping one of your piece like you did in the previous step, or you can shift one of your pieces on the board to a neighboring space. You can pick any of your piece on the board, even if there are pieces on top of it. Only one condition applies: there can never be more than 4 pieces in a space. When you pick a piece with other pieces on top of it, all the other pieces move with yours.<br/><br/>You're playing Dark, try to move one of your piece that is already on the board.`,
            DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, B2, __, __, __],
                [__, __, __, __, A1, __, __, __],
                [B1, __, __, __, A2, __, __, __],
            ], 4),
            [
                DiamMoveShift.ofRepresentation(new Coord(4, 3), 'counterclockwise'),
                DiamMoveShift.ofRepresentation(new Coord(4, 3), 'clockwise'),
                DiamMoveShift.ofRepresentation(new Coord(4, 2), 'counterclockwise'),
                DiamMoveShift.ofRepresentation(new Coord(4, 2), 'clockwise'),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Failed, try to move one of your piece that is already on the board.`,
        ),
        TutorialStep.fromMove(
            $localize`Special case`,
            $localize`It can happen that, in a single turn, both players reach an alignment. If it is the case, only the player with the highest alignment wins.<br/><br/>Here, playing Dark, you can win by performing such a move, do it!`,
            DiamState.ofRepresentation([
                [__, __, __, __, A1, __, __, __],
                [__, __, __, __, B2, __, __, A1],
                [__, __, __, __, A1, __, __, B2],
                [__, B1, __, __, A2, __, __, B1],
            ], 8),
            [DiamMoveShift.ofRepresentation(new Coord(4, 2), 'counterclockwise')],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Failed, try to shift a stack of pieces to the left.`,
        ),
    ];
}

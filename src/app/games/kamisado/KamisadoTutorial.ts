import { KamisadoMove } from 'src/app/games/kamisado/KamisadoMove';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const __: number = KamisadoPiece.NONE.getValue();
const or: number = KamisadoPiece.ZERO.ORANGE.getValue();
const Or: number = KamisadoPiece.ONE.ORANGE.getValue();
const bl: number = KamisadoPiece.ZERO.BLUE.getValue();
const Bl: number = KamisadoPiece.ONE.BLUE.getValue();
const pu: number = KamisadoPiece.ZERO.PURPLE.getValue();
const Pu: number = KamisadoPiece.ONE.PURPLE.getValue();
const pi: number = KamisadoPiece.ZERO.PINK.getValue();
const Pi: number = KamisadoPiece.ONE.PINK.getValue();
const ye: number = KamisadoPiece.ZERO.YELLOW.getValue();
const Ye: number = KamisadoPiece.ONE.YELLOW.getValue();
const re: number = KamisadoPiece.ZERO.RED.getValue();
const Re: number = KamisadoPiece.ONE.RED.getValue();
const gr: number = KamisadoPiece.ZERO.GREEN.getValue();
const Gr: number = KamisadoPiece.ONE.GREEN.getValue();
const br: number = KamisadoPiece.ZERO.BROWN.getValue();
const Br: number = KamisadoPiece.ONE.BROWN.getValue();

export const kamisadoTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Goal of the game`,
        $localize`At Kamisado, there are two ways to win the game:
        either by moving one of your pieces on the opponent's starting line,
        or by forcing the opponent to make a move that blocks the entire game.
        Here, Dark wins because its brown piece is on Light's starting line, on the top left.`,
        new KamisadoPartSlice(5, KamisadoColor.ORANGE, MGPOptional.empty(), false, [
            [br, Bl, Pu, Pi, Ye, Re, Gr, Br],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, Or, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, gr, re, ye, pi, pu, bl, or],
        ]),
    ),
    TutorialStep.anyMove(
        $localize`Initial board and initial move`,
        $localize`Here is the initial board.
        At Kamisado, pieces can only move forward, vertically or diagonally.
        You're playing first, with dark pieces, you can make your first move.<br/><br/>
        Click on the piece of your choice and click on the landing square.`,
        KamisadoPartSlice.getInitialSlice(),
        KamisadoMove.of(new Coord(7, 7), new Coord(3, 3)),
        $localize`Perfect! Note that each of your piece has a different color.`,
    ),
    TutorialStep.fromMove(
        $localize`Moving`,
        $localize`Let us now consider the move of Light, after the blue piece has been moved by Dark.
        All moves after the initial move must be made from the piece that corresponds to the color
        of the square upon which the last move ended.
        Here, the last move ended on the pink square, hence the pink piece must move.
        It is already selected, you do not have to click on it.<br/><br/>
        Move it on a blue square.`,
        new KamisadoPartSlice(1, KamisadoColor.PINK, MGPOptional.of(new Coord(3, 0)), false, [
            [Or, Bl, Pu, Pi, Ye, Re, Gr, Br],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, bl, __],
            [__, __, __, __, __, __, __, __],
            [br, gr, re, ye, pi, pu, __, or],
        ]),
        [
            KamisadoMove.of(new Coord(3, 0), new Coord(3, 6)),
            KamisadoMove.of(new Coord(3, 0), new Coord(4, 1)),
        ],
        $localize`Congratulations!`,
        $localize`You have not moved your pink piece on a blue square!`,
    ),
    TutorialStep.informational(
        $localize`Stuck situation`,
        $localize`Dark moved to another pink square, hence you have to move your pink piece again.
        However, your pink piece is stuck! In this case, you must pass your turn.
        Dark will now have to play by moving its pink piece.`,
        new KamisadoPartSlice(1, KamisadoColor.PINK, MGPOptional.of(new Coord(3, 6)), false, [
            [Or, Bl, Pu, __, Ye, Re, Gr, Br],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, bl],
            [__, __, __, __, __, __, __, __],
            [__, __, __, Pi, __, __, __, __],
            [br, gr, re, ye, pi, pu, __, or],
        ]),
    ),
    TutorialStep.fromMove(
        $localize`Victory by blocking`,
        $localize`At any time, if a player blocks the entire game, that player loses.
        In other words, if a player forces its opponent to move a piece that that opponent cannot move,
        and the player cannot move its own piece of the same color, then that player loses.
        Here, you're playing Dark and you can force your opponent to create such a situation, hence you can force your opponent to lose!<br/><br/>
        Try to make this move.`,
        new KamisadoPartSlice(2, KamisadoColor.RED, MGPOptional.of(new Coord(2, 4)), false, [
            [__, Bl, Pu, __, Ye, Re, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, Pi, __, Pu, __, __],
            [__, __, __, ye, __, __, __, __],
            [__, __, re, __, __, __, __, __],
            [__, __, __, __, __, __, Gr, __],
            [Or, __, __, __, __, pi, __, Br],
            [br, gr, __, __, __, __, bl, or],
        ]),
        [KamisadoMove.of(new Coord(2, 4), new Coord(0, 2))],
        $localize`Perfect!
         Light must move its green piece on the orange square, forcing you to play with your orange piece.
         Your orange piece will be stuck and you will have to pass your turn.
         Light will have to pass its turn too because its orange piece is also stuck: the game is completely stuck.
         In this case, the last player to have moved a piece loses.
         Here, Light will have moved its green piece last, you therefore win!`,
        $localize`Failed!`,
    ),
];

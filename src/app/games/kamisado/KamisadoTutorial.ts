import { KamisadoMove } from 'src/app/games/kamisado/KamisadoMove';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { KamisadoState } from 'src/app/games/kamisado/KamisadoState';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from '@everyboard/lib';
import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { KamisadoRules } from './KamisadoRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const __: KamisadoPiece = KamisadoPiece.EMPTY;
const or: KamisadoPiece = KamisadoPiece.ZERO.ORANGE;
const Or: KamisadoPiece = KamisadoPiece.ONE.ORANGE;
const bl: KamisadoPiece = KamisadoPiece.ZERO.BLUE;
const Bl: KamisadoPiece = KamisadoPiece.ONE.BLUE;
const pu: KamisadoPiece = KamisadoPiece.ZERO.PURPLE;
const Pu: KamisadoPiece = KamisadoPiece.ONE.PURPLE;
const pi: KamisadoPiece = KamisadoPiece.ZERO.PINK;
const Pi: KamisadoPiece = KamisadoPiece.ONE.PINK;
const ye: KamisadoPiece = KamisadoPiece.ZERO.YELLOW;
const Ye: KamisadoPiece = KamisadoPiece.ONE.YELLOW;
const re: KamisadoPiece = KamisadoPiece.ZERO.RED;
const Re: KamisadoPiece = KamisadoPiece.ONE.RED;
const gr: KamisadoPiece = KamisadoPiece.ZERO.GREEN;
const Gr: KamisadoPiece = KamisadoPiece.ONE.GREEN;
const br: KamisadoPiece = KamisadoPiece.ZERO.BROWN;
const Br: KamisadoPiece = KamisadoPiece.ONE.BROWN;

export class KamisadoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Kamisado, there are two ways to win the game:
        either by moving one of your pieces on the opponent's starting line,
        or by forcing the opponent to make a move that blocks the entire game.
        Here, Dark wins because its brown piece is on Light's starting line, on the top left.`,
            new KamisadoState(5, KamisadoColor.ORANGE, MGPOptional.empty(), false, [
                [br, Bl, Pu, Pi, Ye, Re, Gr, Br],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, Or, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, gr, re, ye, pi, pu, bl, or],
            ]),
        ).withPreviousMove(KamisadoMove.of(new Coord(0, 7), new Coord(0, 0))),
        TutorialStep.anyMove(
            $localize`Initial board and initial move`,
            $localize`Here is the initial board.
        At Kamisado, pieces can only move forward, vertically or diagonally.
        You're playing first, with dark pieces, you can make your first move.<br/><br/>
        You're playing Dark, click on the piece of your choice and click on a landing square.`,
            KamisadoRules.get().getInitialState(),
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
        You're playing Light, move your piece on a blue square.`,
            new KamisadoState(1, KamisadoColor.PINK, MGPOptional.of(new Coord(3, 0)), false, [
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
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You have not moved your pink piece on a blue square!`,
        ).withPreviousMove(KamisadoMove.of(new Coord(6, 7), new Coord(6, 5))),
        TutorialStep.informational(
            $localize`Stuck situation`,
            $localize`Dark moved to another pink square, hence you have to move your pink piece again.
        However, your pink piece is stuck! In this case, you must pass your turn.
        Dark will now have to play by moving its pink piece.`,
            new KamisadoState(1, KamisadoColor.PINK, MGPOptional.of(new Coord(3, 6)), false, [
                [Or, Bl, Pu, __, Ye, Re, Gr, Br],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, bl],
                [__, __, __, __, __, __, __, __],
                [__, __, __, Pi, __, __, __, __],
                [br, gr, re, ye, pi, pu, __, or],
            ]),
        ).withPreviousMove(KamisadoMove.of(new Coord(6, 5), new Coord(7, 4))),
        TutorialStep.fromMove(
            $localize`Victory by blocking`,
            $localize`At any time, if a player blocks the entire game, that player loses.
        In other words, if a player forces its opponent to move a piece that the opponent cannot move,
        and the player cannot move its own piece of the same color, then that player loses.
        Here, you're playing Dark and you can force your opponent to create such a situation, hence you can force your opponent to lose!<br/><br/>
        You're playing Dark, analyze the board and make the winning move.`,
            new KamisadoState(2, KamisadoColor.RED, MGPOptional.of(new Coord(2, 4)), false, [
                [__, Bl, Pu, __, __, Re, __, __],
                [__, __, __, Ye, __, __, __, __],
                [__, __, __, Pi, __, Pu, __, __],
                [__, __, __, ye, __, __, __, __],
                [__, __, re, __, __, __, __, __],
                [__, __, __, __, __, __, Gr, __],
                [Or, __, __, __, __, pi, __, Br],
                [br, gr, __, __, __, __, bl, or],
            ]),
            [KamisadoMove.of(new Coord(2, 4), new Coord(0, 2))],
            $localize`Perfect!
         Your opponent must move its green piece on the orange square, forcing you to play with your orange piece.
         Your orange piece will be stuck and you will have to pass your turn.
         Your opponent will have to pass its turn too because its orange piece is also stuck: the game is completely stuck.
         In this case, the last player to have moved a piece loses.
         Here, your opponent will have moved its green piece last, you therefore win!`,
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ).withPreviousMove(KamisadoMove.of(new Coord(4, 0), new Coord(3, 1))),
    ];
}

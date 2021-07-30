import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { DidacticialStep } from '../DidacticialStep';

export const quartoTutorial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Goal of the game`,
        $localize`Quarto is an alignment game.
        The goal is to align four pieces that have at least one common aspect:
        <ul>
          <li>their color (light or dark)</li>
          <li>their size (big or small)</li>
          <li>their pattern (empty or dotted)</li>
          <li>their shape (round or square)</li>
        <ul>
        Here, we have a board with a victory by an alignment of round pieces.`,
        new QuartoPartSlice([
            [14, 12, 4, 2],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
        ], 7, QuartoPiece.ABAB),
    ),
    DidacticialStep.anyMove(
        $localize`Placement`,
        $localize`Every placement occurs in two steps: placing the piece you have in hand on a square of the board,
        and picking a piece that the opponent will have to place, by clicking one one of the pieces on the side of the board.
        If you prefer, the order of these two steps can be reversed.
        Keep in mind that the second click confirms the move.<br/><br/>
        Make a move.`,
        new QuartoPartSlice([
            [14, 3, 6, 16],
            [16, 16, 16, 16],
            [16, 8, 16, 16],
            [16, 16, 16, 16],
        ], 7, QuartoPiece.ABAA),
        new QuartoMove(2, 2, QuartoPiece.BAAB),
        $localize`Perfect!`,
    ),
    DidacticialStep.fromMove(
        $localize`Situation`,
        $localize`We have here a tricky situation.<br/><br/>
        Analyse the board and play your move, carefully paying attention not to let the opponent win on the next move.`,
        new QuartoPartSlice([
            [15, 14, 13, 16],
            [4, 11, 12, 16],
            [5, 8, 9, 16],
            [16, 16, 16, 16],
        ], 7, QuartoPiece.AABA),
        [new QuartoMove(3, 3, QuartoPiece.AABB)],
        $localize`Well done!`,
        $localize`Failed!`,
    ),
];

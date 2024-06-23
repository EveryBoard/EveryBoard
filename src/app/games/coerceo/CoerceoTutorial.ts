import { MGPOptional } from '@everyboard/lib';
import { CoerceoRegularMove, CoerceoTileExchangeMove } from 'src/app/games/coerceo/CoerceoMove';
import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { CoerceoState } from 'src/app/games/coerceo/CoerceoState';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { CoerceoConfig, CoerceoRules } from './CoerceoRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const defaultConfig: MGPOptional<CoerceoConfig> = CoerceoRules.get().getDefaultRulesConfig();

export class CoerceoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Board and goal of the game`,
            $localize`Coerceo is played on a board like this, composed of hexagonal tiles, each comprising 6 triangles.
         The triangles are the spaces on which pieces move during the game.
         The tiles can be removed from the board (you will see how later).
         The dark pieces belong to the first player and can only move on the dark spaces,
         while the light pieces belong to the second player and can only move on the light spaces.
         The goal of the game is to capture all of the opponent's pieces.`,
            CoerceoRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Move`,
            $localize`To move a piece, you need to:
        <ol>
          <li>Click on one of your pieces.</li>
          <li>Click on one of the triangular space highlighted in yellow.</li>
        </ol>
        You can pass through the opponent's pieces.<br/><br/>
        You're playing first, hence you're playing Dark.
        Perform any move.`,
            CoerceoRules.get().getInitialState(defaultConfig),
            CoerceoRegularMove.of(new Coord(3, 5), new Coord(5, 5)),
            $localize`Congratulations! Let's see captures now.`,
        ),
        TutorialStep.fromMove(
            $localize`Captures`,
            $localize`Every piece has three neighboring triangular spaces (2 on the sides).
        When all neighboring spaces except one are occupied, and one opponent moves to that last free space, your piece is captured!
        However, it is possible to place a piece between 3 of the opponent's pieces (or 2 on the side) without being captured.<br/><br/>
        You're playing Light, make a capture.`,
            new CoerceoState([
                [N, N, N, N, N, N, O, _, O, N, N, N, N, N, N],
                [N, N, N, O, _, _, _, _, _, O, _, _, N, N, N],
                [_, X, _, X, O, X, _, _, O, _, _, X, _, X, _],
                [X, _, _, _, _, _, _, _, _, _, X, _, _, _, X],
                [_, X, _, X, _, _, _, _, _, _, _, X, _, X, _],
                [_, O, _, O, _, _, _, _, _, _, _, O, _, O, _],
                [O, _, _, _, O, _, _, _, _, _, O, _, _, _, O],
                [_, O, _, O, _, _, X, _, X, _, _, O, _, O, _],
                [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
                [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
            ], 3, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0)),
            [
                CoerceoRegularMove.of(new Coord(5, 2), new Coord(4, 1)),
                CoerceoRegularMove.of(new Coord(3, 4), new Coord(4, 3)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Failed, you have not captured any piece.`,
        ),
        TutorialStep.fromMove(
            $localize`Gain a tile`,
            $localize`When a tile is empty, it can become removable from the board.
        For it to be removable, at least three of its sides must be free, and these should be neighboring sides.
        Note that if one empty tile, neighboring a tile that was just removed, also becomes removable, it will be removed too.
        For example, here, the topmost dark piece will not disconnect its tile when leaving it.
        But, by leaving the bottom left tile, two tiles will be removed.<br/><br/>
        You're playing Dark, perform a move that lets you gain two tiles.`,
            new CoerceoState([
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [_, _, _, N, N, N, _, _, _, N, N, N, N, N, N],
                [_, _, X, _, _, _, _, O, _, N, N, N, N, N, N],
                [_, _, _, X, _, _, _, _, _, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, O, N, N, N],
                [_, _, O, _, _, X, _, _, _, _, O, _, _, _, O],
                [_, _, _, _, _, _, X, _, X, _, _, O, _, O, _],
                [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
                [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
            ], 2, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0)),
            [
                CoerceoRegularMove.of(new Coord(2, 6), new Coord(4, 6)),
                CoerceoRegularMove.of(new Coord(2, 6), new Coord(3, 5)),
                CoerceoRegularMove.of(new Coord(2, 6), new Coord(3, 7)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Failed, you have not gained the two tiles that you could, try again!`,
        ),
        TutorialStep.fromMove(
            $localize`Exchanging a tile`,
            $localize`When you have a tile, you can see it on the left of the board.
        As soon as you have two, you can click on an opponent's piece to capture it immediately instead of moving one of your pieces.
        This will cost you two tiles.
        If any tiles are removed during that turn, nobody will get them.<br/><br/>
        You're playing Light, gain some time and capture the last piece to win directly!`,
            new CoerceoState([
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, _, _, O, N, N, N, N, N, N, N, N, N],
                [N, N, N, _, _, _, _, _, _, N, N, N, N, N, N],
                [N, N, N, _, _, _, X, _, X, N, N, N, N, N, N],
                [N, N, N, _, _, X, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
            ], 1, PlayerNumberMap.of(0, 2), PlayerNumberMap.of(0, 0)),
            [
                CoerceoTileExchangeMove.of(new Coord(5, 5)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`It's nice to move a piece, but you could have had the opponent's piece immediately by clicking on it!`,
        ),
        TutorialStep.fromMove(
            $localize`Special capture`,
            $localize`When a tile is removed from the board during your turn, some of the opponent's pieces may have lost their last free neighboring space, they will therefore be captured!
        If this happens to one of your piece during your turn, it will however stay on the board.<br/><br/>
        A move that demonstrates both of these things can be done on this board by Light. Try it!`,
            new CoerceoState([
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, _, _, O, _, _, _, N, N, N, N, N, N],
                [N, N, N, _, O, X, _, X, _, N, N, N, N, N, N],
                [N, N, N, _, X, O, _, _, _, N, N, N, N, N, N],
                [N, N, N, _, _, X, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ], 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0)),
            [
                CoerceoRegularMove.of(new Coord(7, 6), new Coord(6, 5)),
                CoerceoRegularMove.of(new Coord(7, 6), new Coord(8, 5)),
            ],
            $localize`Congratulations! See, your piece no longer had any empty neighboring space after you have gained the tile, but it stayed on the board as it was your turn.
        However, the opponent's piece has disappeared because the tile's capture has removed its last empty neighboring space.`,
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
    ];
}

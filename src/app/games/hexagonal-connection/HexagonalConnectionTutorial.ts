import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { HexagonalConnectionState } from './HexagonalConnectionState';
import { HexagonalConnectionMove } from './HexagonalConnectionMove';
import { Coord } from 'src/app/jscaip/Coord';
import { HexagonalConnectionConfig, HexagonalConnectionRules } from './HexagonalConnectionRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPOptional } from '@everyboard/lib';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const defaultConfig: MGPOptional<HexagonalConnectionConfig> = HexagonalConnectionRules.get().getDefaultRulesConfig();
const initialState: HexagonalConnectionState = HexagonalConnectionRules.get().getInitialState(defaultConfig);

export class HexagonalConnectionTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board and object of the game`,
            $localize`Hexagonal Connection is played on an hexagonal board, the aim is to be the first to align 6 of yours pieces.`,
            initialState,
        ),
        TutorialStep.anyMove(
            $localize`First turn`,
            $localize`On the first turn, the first player plays only one piece.<br/><br/>You're playing Dark, place your first piece by clicking on a space.`,
            initialState,
            HexagonalConnectionMove.of([new Coord(12, 12)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Next turns`,
            $localize`On all following turns, the players play two pieces.<br/><br/>You're playing Light, do the winning move.`,
            new HexagonalConnectionState([
                [N, N, N, N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, O, _, X, O, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, O, O, _, _, X, O, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, X, O, O, O, O, X, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, O, O, O, O, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, _, X, O, X, X, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, O, X, O, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, X, _, X, _, O, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, X, X, _, X, _, _, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N, N, N, N],
            ], 21),
            [HexagonalConnectionMove.of([new Coord(10, 16), new Coord(11, 15)])],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ), // TODO FOR REVIEW: NAMING IT HEXODIA ? HEXADIA ?
        TutorialStep.fromMove(
            $localize`Hexagonal Diagonals`,
            $localize`But an original kind of diagonal also exist in Hexodia. Here, Dark has made alignment in each of those three direction, in only one a victory is still possible.<br/><br/>You're playing Dark, do the winning move.`,
            new HexagonalConnectionState([
                [N, N, N, N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, N, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, X, _, _, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, O, _, _, O, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, O, _, _, X, _, _, O, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, O, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, O, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, X, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, N, N, N, N, N, N, N, N, N, N, N, N],
            ], 20),
            [HexagonalConnectionMove.of([new Coord(0, 18), new Coord(2, 17)])],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
    ];
}

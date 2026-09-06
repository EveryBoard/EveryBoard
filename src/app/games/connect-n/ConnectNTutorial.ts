import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { PlayerOrNone } from '../../jscaip/Player';
import { RectangularShape } from '../../jscaip/shape/RectangularShape';
import { Shape } from '../../jscaip/shape/Shape';
import { SimpleGameStateWithTable } from '../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameStateWithTable } from '../../jscaip/state/TopologicGameStateWithTable';
import { SquareTopology } from '../../jscaip/topology/SquareTopology';
import { Topology } from '../../jscaip/topology/Topology';

import { ConnectNMove } from './ConnectNMove';
import { ConnectNConfig, ConnectNRules } from './ConnectNRules';


const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const defaultConfig: ConnectNConfig = ConnectNRules.get().getDefaultRulesConfig();
const defaultTopology: Topology = new SquareTopology();
const defaultShape: Shape = new RectangularShape(defaultConfig.boardSize, defaultConfig.boardSize, defaultTopology);
export class ConnectNTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`Connect Six is played on a 19x19 board, on which stones are put on the intersections. The object of the game is to align 6 of your pieces.`,
            ConnectNRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`First turn`,
            $localize`At the first turn, the first player plays only one piece.<br/><br/>You're playing Dark, place your first piece by clicking on an intersection.`,
            ConnectNRules.get().getInitialState(defaultConfig),
            ConnectNMove.of([new Coord(9, 9)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Next turns`,
            $localize`On all following turns, the players play two pieces, until a victory or a draw is reached.<br/><br/>You're playing Light, do the winning move.`,
            new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                new SimpleGameStateWithTable<FourStatePiece>([
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, O, _, X, O, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O, O, _, _, X, O, _, _, _, _, _],
                    [_, _, _, _, _, _, _, X, O, O, O, O, X, _, _, _, _, _, _],
                    [_, _, _, _, _, _, X, O, O, O, O, X, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, X, _, X, O, X, X, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, O, X, O, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, X, _, X, _, O, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, X, X, _, X, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                ], 21),
            ),
            [
                ConnectNMove.of([new Coord(7, 12), new Coord(8, 11)]),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
    ];
}

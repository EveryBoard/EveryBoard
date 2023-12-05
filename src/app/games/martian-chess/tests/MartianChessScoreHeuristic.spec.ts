/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessPiece } from '../MartianChessPiece';
import { MartianChessScoreHeuristic } from '../MartianChessScoreHeuristic';
import { MartianChessCapture, MartianChessState } from '../MartianChessState';
import { MartianChessRules } from '../MartianChessRules';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('MartianChessScoreHeuristic', () => {

    let heuristic: MartianChessScoreHeuristic;
    const defaultConfig: MGPOptional<EmptyRulesConfig> = MartianChessRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new MartianChessScoreHeuristic();
    });

    it('should simply prefer higher score', () => {
        const weakState: MartianChessState = MartianChessRules.get().getInitialState();
        const strongBoard: Table<MartianChessPiece> = weakState.getCopiedBoard();
        const captured: MGPMap<Player, MartianChessCapture> = weakState.captured.getCopy();
        const capturedPawn: MartianChessCapture = MartianChessCapture.of([MartianChessPiece.PAWN]);
        captured.replace(Player.ZERO, capturedPawn);
        const strongState: MartianChessState = new MartianChessState(strongBoard,
                                                                     0,
                                                                     MGPOptional.empty(),
                                                                     MGPOptional.empty(),
                                                                     captured);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });
});

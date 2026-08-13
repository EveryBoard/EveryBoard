/* eslint-disable max-lines-per-function */
import { Player } from '@everyboard/games';
import { MGPMap, MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { Table } from '../../../jscaip/TableUtils';
import { MartianChessPiece } from '../MartianChessPiece';
import { MartianChessRules } from '../MartianChessRules';
import { MartianChessScoreHeuristic } from '../MartianChessScoreHeuristic';
import { MartianChessCapture, MartianChessState } from '../MartianChessState';

describe('MartianChessScoreHeuristic', () => {

    let heuristic: MartianChessScoreHeuristic;
    const defaultConfig: EmptyRulesConfig = MartianChessRules.get().getDefaultRulesConfig();

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

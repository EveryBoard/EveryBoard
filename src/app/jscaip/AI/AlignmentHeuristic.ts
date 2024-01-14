import { MGPOptional } from '../../utils/MGPOptional';
import { Coord } from '../Coord';
import { Move } from '../Move';
import { SCORE } from '../SCORE';
import { GameState } from '../GameState';
import { Heuristic } from './Minimax';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { BoardValue } from './BoardValue';

export interface BoardInfo {
    status: SCORE,
    victory: MGPOptional<Coord[]>,
    preVictory: MGPOptional<Coord>,
    sum: number,
}

export abstract class AlignmentHeuristic<M extends Move,
                                         S extends GameState,
                                         V,
                                         C extends RulesConfig = EmptyRulesConfig>
    extends Heuristic<M, S, BoardValue, C>
{

    public calculateBoardValue(move: M, state: S): BoardInfo {
        this.startSearchingVictorySources();
        const boardInfo: BoardInfo = {
            status: SCORE.DEFAULT,
            victory: MGPOptional.empty(),
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
        while (this.hasNextVictorySource()) {
            const victorySource: V = this.getNextVictorySource();
            let newBoardInfo: BoardInfo;
            if (boardInfo.status === SCORE.PRE_VICTORY) {
                newBoardInfo = this.searchVictoryOnly(victorySource, move, state);
            } else {
                newBoardInfo = this.getBoardInfo(victorySource, move, state, boardInfo);
            }
            if (newBoardInfo.status === SCORE.VICTORY) {
                return newBoardInfo;
            }
            boardInfo.status = newBoardInfo.status;
            boardInfo.sum = boardInfo.sum + newBoardInfo.sum;
            if (boardInfo.preVictory.isAbsent()) {
                boardInfo.preVictory = newBoardInfo.preVictory;
            }
        }
        return boardInfo;
    }
    public abstract startSearchingVictorySources(): void;

    public abstract hasNextVictorySource(): boolean;

    public abstract getNextVictorySource(): V;

    public abstract searchVictoryOnly(victorySource: V, move: M, state: S): BoardInfo;

    public abstract getBoardInfo(victorySource: V, move: M, state: S, boardInfo: BoardInfo): BoardInfo;
}

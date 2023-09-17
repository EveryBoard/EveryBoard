import { MGPOptional } from '../utils/MGPOptional';
import { Coord } from './Coord';
import { Minimax } from './Minimax';
import { Move } from './Move';
import { BoardValue } from './BoardValue';
import { SCORE } from './SCORE';
import { GameState } from './GameState';
import { RulesConfig } from './RulesConfigUtil';

export interface BoardInfo {
    status: SCORE,
    victory: MGPOptional<Coord[]>,
    preVictory: MGPOptional<Coord>,
    sum: number,
}
export abstract class AlignementMinimax<M extends Move,
                                        S extends GameState,
                                        L,
                                        V,
                                        C extends RulesConfig = RulesConfig,
                                        B extends BoardValue = BoardValue>
    extends Minimax<M, S, C, L, B>
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

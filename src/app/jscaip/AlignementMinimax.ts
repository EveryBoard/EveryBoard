import { MGPOptional } from '../utils/mgp-optional/MGPOptional';
import { Coord } from './coord/Coord';
import { GamePartSlice } from './GamePartSlice';
import { Move } from './Move';
import { SCORE } from './SCORE';

export interface BoardInfo {
    status: SCORE,
    victory: Coord[],
    preVictory: MGPOptional<Coord>,
    sum: number
}
export abstract class AlignementMinimax<M extends Move, S extends GamePartSlice, V> {

    public getBoardValue(move: M, state: S): number {
        this.startSearchingVictorySources();
        let boardInfo: BoardInfo = {
            status: SCORE.DEFAULT,
            victory: null,
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
        while (this.hasNextVictorySource()) {
            const victorySource: V = this.getNextVictorySource();
            let newBoardInfo: BoardInfo;
            if (boardInfo.status === SCORE.PRE_VICTORY) {
                newBoardInfo = this.searchVictoryOnly(victorySource);
            } else if (boardInfo.preVictory.isPresent()) {
                newBoardInfo = this.searchSecondVictoriousCoord(victorySource);
            } else {
                newBoardInfo = this.getBoardInfo(victorySource);
            }
            if (newBoardInfo.status === SCORE.VICTORY) {
                return state.getCurrentEnnemy().getVictoryValue();
            }
            boardInfo = {
                status: newBoardInfo.status,
                victory: null,
                preVictory: newBoardInfo.preVictory,
                sum: boardInfo.sum + newBoardInfo.sum,
            };
        }
        if (boardInfo.status === SCORE.PRE_VICTORY) {
            return state.getCurrentEnnemy().getPreVictory();
        } else {
            return boardInfo.sum * state.getCurrentEnnemy().getScoreModifier();
        }
    }
    public abstract startSearchingVictorySources(): void;

    public abstract hasNextVictorySource(): boolean;

    public abstract getNextVictorySource(): V;

    public abstract searchVictoryOnly(victorySource: V): BoardInfo;

    public abstract searchSecondVictoriousCoord(victorySource: V): BoardInfo;

    public abstract getBoardInfo(victorySource: V): BoardInfo;
}

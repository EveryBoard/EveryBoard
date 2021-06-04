import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { TablutCase } from './TablutCase';
import { TablutMinimax } from './TablutMinimax';
import { TablutPartSlice } from './TablutPartSlice';
import { TablutNode, TablutRules } from './TablutRules';
import { TablutRulesConfig } from './TablutRulesConfig';

export class TablutPieceAndInfluenceMinimax extends TablutMinimax {

    public getBoardValue(node: TablutNode): NodeUnheritance {
        const gameStatus: GameStatus = TablutRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const state: TablutPartSlice = node.gamePartSlice;
        const board: number[][] = state.getCopiedBoard();
        const WIDTH: number = TablutRulesConfig.WIDTH;
        const EMPTY: number = TablutCase.UNOCCUPIED.value;

        const SCORE_BY_PIECE: number = 20;
        let score: number = 0;
        for (let y: number = 0; y < WIDTH; y++) {
            for (let x: number = 0; x < WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: number = state.getBoardAt(coord);
                if (piece !== EMPTY) {
                    const owner: Player = TablutRules.getAbsoluteOwner(coord, board);
                    if (this.isThreatened(coord, state)) {
                        score += owner.getScoreModifier();
                    } else {
                        score += SCORE_BY_PIECE * owner.getScoreModifier();
                        let influence: number = 0;
                        for (const dir of Orthogonal.ORTHOGONALS) {
                            let testedCoord: Coord = coord.getNext(dir, 1);
                            while (testedCoord.isInRange(WIDTH, WIDTH) && state.getBoardAt(testedCoord) === EMPTY) {
                                influence++;
                                testedCoord = testedCoord.getNext(dir, 1);
                            }
                        }
                        score += influence * owner.getScoreModifier();
                    }
                }
            }
        }
        return new NodeUnheritance(score);
    }
    public isThreatened(coord: Coord, state: TablutPartSlice): boolean { // TODO: same for the king
        const board: number[][] = state.getCopiedBoard();
        const threatenerPlayer: Player = TablutRules.getAbsoluteOwner(coord, board).getOpponent();
        for (const dir of Orthogonal.ORTHOGONALS) {
            const threatener: Coord = coord.getPrevious(dir, 1);
            if (this.isAThreat(threatener, state, threatenerPlayer)) {
                for (const captureDirection of Orthogonal.ORTHOGONALS) {
                    if (captureDirection === dir.getOpposite()) {
                        continue;
                    }
                    let futureCapturer: Coord = coord.getNext(dir, 1);
                    while (futureCapturer.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH) &&
                           state.getBoardAt(futureCapturer) === TablutCase.UNOCCUPIED.value)
                    {
                        futureCapturer = futureCapturer.getNext(captureDirection);
                    }
                    if (futureCapturer.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH) &&
                        TablutRules.getAbsoluteOwner(futureCapturer, board) === threatenerPlayer)
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    public isAThreat(coord: Coord, state: TablutPartSlice, ennemy: Player): boolean {
        if (coord.isNotInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) {
            return false;
        }
        if (TablutRules.getAbsoluteOwner(coord, state.getCopiedBoard()) === ennemy) {
            return true;
        }
        if (TablutRules.isThrone(coord)) {
            if (ennemy === Player.ONE) { // getDefender
                return true;
            } else {
                return state.getBoardAt(coord) === TablutCase.UNOCCUPIED.value;
            }
        }
    }
}

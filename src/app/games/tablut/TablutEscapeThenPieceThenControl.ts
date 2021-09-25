import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { SandwichThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { NumberTable, Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TablutCase } from './TablutCase';
import { TablutState } from './TablutState';
import { TablutPieceAndControlMinimax } from './TablutPieceAndControlMinimax';
import { TablutNode, TablutRules } from './TablutRules';
import { TablutRulesConfig } from './TablutRulesConfig';

export class TablutEscapeThenPieceAndControlMinimax extends TablutPieceAndControlMinimax {

    public static SCORE_BY_THREATENED_PIECE: number = 530;

    public static SCORE_BY_SAFE_PIECE: number = (16 * TablutPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE) + 1;

    public static CONTROL_VALUE: NumberTable = [
        [64, 8, 8, 8, 8, 8, 8, 8, 64],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [64, 8, 8, 8, 8, 8, 8, 8, 64],
    ];
    public getBoardValue(node: TablutNode): NodeUnheritance {
        const gameStatus: GameStatus = TablutRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const state: TablutState = node.gameState;
        const WIDTH: number = TablutRulesConfig.WIDTH;
        const EMPTY: TablutCase = TablutCase.UNOCCUPIED;

        let safeScore: number = 0;
        let threatenedScore: number = 0;
        let controlScore: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of [Player.ZERO, Player.ONE]) {
            const controlleds: MGPSet<Coord> = new MGPSet();
            for (const coord of pieceMap.get(owner).get().getCopy()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    threatenedScore += owner.getScoreModifier();
                } else {
                    safeScore += owner.getScoreModifier();
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(WIDTH, WIDTH) && state.getBoardAt(testedCoord) === EMPTY) {
                            controlleds.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlleds.getCopy()) {
                const controlledValue: number =
                    TablutPieceAndControlMinimax.CONTROL_VALUE[controlled.y][controlled.x];
                controlScore += owner.getScoreModifier() * controlledValue;
            }
        }
        const stepForEscape: number = this.getStepForEscape(state.getCopiedBoard());
        return new NodeUnheritance((stepForEscape * 531 * 17 * 17) +
                                   (safeScore * 531 * 17) +
                                   (threatenedScore * 531) +
                                   controlScore);
    }
    public getStepForEscape(board: Table<TablutCase>): number {
        const king: Coord = TablutRules.getKingCoord(board).get();
        return this._getStepForEscape(board, 1, [king], []);
    }
    public _getStepForEscape(board: Table<TablutCase>,
                             step: number,
                             previousGen: Coord[],
                             handledCoords: Coord[])
    : number
    {
        const nextGen: Coord[] = this.getNextGen(board, previousGen, handledCoords);

        if (nextGen.length === 0) {
            // not found:
            return null;
        }
        if (nextGen.some((coord: Coord) => TablutRules.isExternalThrone(coord))) {
            return step;
        } else {
            step++;
            handledCoords.push(...nextGen);
            return this._getStepForEscape(board, step, nextGen, handledCoords);
        }
    }
    public getNextGen(board: Table<TablutCase>, previousGen: Coord[], handledCoords: Coord[]): Coord[] {
        const newGen: Coord[] = [];
        for (const piece of previousGen) {
            for (const dir of Orthogonal.ORTHOGONALS) {
                let landing: Coord = piece.getNext(dir, 1);
                while (landing.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH) &&
                       board[landing.y][landing.x] === TablutCase.UNOCCUPIED)
                {
                    if (handledCoords.every((coord: Coord) => coord.equals(landing) === false)) {
                        // coord is new
                        newGen.push(landing);
                    }
                    landing = landing.getNext(dir, 1);
                }
            }
        }
        return newGen;
    }
}

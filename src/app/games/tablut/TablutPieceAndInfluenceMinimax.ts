import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { SandwichThreat } from '../../jscaip/PieceThreat';
import { TablutCase } from './TablutCase';
import { TablutMinimax } from './TablutMinimax';
import { TablutState } from './TablutState';
import { TablutNode, TablutRules } from './TablutRules';
import { TablutRulesConfig } from './TablutRulesConfig';

export class TablutPieceAndInfluenceMinimax extends TablutMinimax {

    public static MAX_INFLUENCE: number = 16 * ((TablutRulesConfig.WIDTH * 2) - 2);

    public static SCORE_BY_THREATENED_PIECE: number = (16 * TablutPieceAndInfluenceMinimax.MAX_INFLUENCE) + 1;

    public static SCORE_BY_SAFE_PIECE: number = (16 * TablutPieceAndInfluenceMinimax.SCORE_BY_THREATENED_PIECE) + 1;

    public getBoardValue(node: TablutNode): NodeUnheritance {
        const gameStatus: GameStatus = TablutRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const state: TablutState = node.gameState;
        const WIDTH: number = TablutRulesConfig.WIDTH;
        const EMPTY: TablutCase = TablutCase.UNOCCUPIED;

        let score: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of [Player.ZERO, Player.ONE]) {
            for (const coord of pieceMap.get(owner).get().getCopy()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * TablutPieceAndInfluenceMinimax.SCORE_BY_THREATENED_PIECE;
                } else {
                    score += owner.getScoreModifier() * TablutPieceAndInfluenceMinimax.SCORE_BY_SAFE_PIECE;
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
        return new NodeUnheritance(score);
    }
    public getPiecesMap(state: TablutState): MGPMap<Player, MGPSet<Coord>> {
        const WIDTH: number = TablutRulesConfig.WIDTH;
        const board: Table<TablutCase> = state.getCopiedBoard();
        const EMPTY: TablutCase = TablutCase.UNOCCUPIED;
        const map: MGPMap<Player, MGPSet<Coord>> = new MGPMap();
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (let y: number = 0; y < WIDTH; y++) {
            for (let x: number = 0; x < WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: TablutCase = state.getBoardAt(coord);
                if (piece !== EMPTY) {
                    const owner: Player = TablutRules.getAbsoluteOwner(coord, board);
                    if (owner === Player.ZERO) {
                        zeroPieces.push(coord);
                    } else {
                        onePieces.push(coord);
                    }
                }
            }
        }
        map.set(Player.ZERO, new MGPSet(zeroPieces));
        map.set(Player.ONE, new MGPSet(onePieces));
        return map;
    }
    public getThreatMap(state: TablutState,
                        pieces: MGPMap<Player, MGPSet<Coord>>)
    : MGPMap<Coord, MGPSet<SandwichThreat>>
    {
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
        for (const player of [Player.ZERO, Player.ONE]) {
            for (const piece of pieces.get(player).get().getCopy()) {
                const threats: SandwichThreat[] = this.getThreats(piece, state);
                if (this.isThreatReal(piece, state, threats)) {
                    threatMap.set(piece, new MGPSet(threats));
                }
            }
        }
        return threatMap;
    }
    public getThreats(coord: Coord, state: TablutState): SandwichThreat[] {
        const board: Table<TablutCase> = state.getCopiedBoard();
        const threatenerPlayer: Player = TablutRules.getAbsoluteOwner(coord, board).getOpponent();
        const threats: SandwichThreat[] = [];
        for (const dir of Orthogonal.ORTHOGONALS) {
            const directThreat: Coord = coord.getPrevious(dir, 1);
            if (this.isAThreat(directThreat, state, threatenerPlayer)) {
                const movingThreats: Coord[] = [];
                for (const captureDirection of Orthogonal.ORTHOGONALS) {
                    if (captureDirection === dir.getOpposite()) {
                        continue;
                    }
                    let futureCapturer: Coord = coord.getNext(dir, 1);
                    while (futureCapturer.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH) &&
                           state.getBoardAt(futureCapturer) === TablutCase.UNOCCUPIED)
                    {
                        futureCapturer = futureCapturer.getNext(captureDirection);
                    }
                    if (futureCapturer.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH) &&
                        TablutRules.getAbsoluteOwner(futureCapturer, board) === threatenerPlayer &&
                        coord.getNext(dir, 1).equals(futureCapturer) === false)
                    {
                        movingThreats.push(futureCapturer);
                    }
                }
                threats.push(new SandwichThreat(directThreat, new MGPSet(movingThreats)));
            }
        }
        return threats;
    }
    public isAThreat(coord: Coord, state: TablutState, ennemy: Player): boolean {
        if (coord.isNotInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) {
            return false;
        }
        if (TablutRules.getAbsoluteOwner(coord, state.getCopiedBoard()) === ennemy) {
            return true;
        }
        if (TablutRules.isThrone(coord)) {
            if (ennemy === Player.ONE) { // Defender
                return true;
            } else {
                return state.getBoardAt(coord) === TablutCase.UNOCCUPIED;
            }
        }
    }
    public isThreatReal(coord: Coord, state: TablutState, threats: SandwichThreat[]): boolean {
        if (threats.length === 0) {
            return false;
        }
        if (state.getBoardAt(coord).isKing()) {
            return threats.length === 3;
        } else {
            for (const threat of threats) {
                if (threat.mover.size() > 0) {
                    return true;
                }
            }
            return false;
        }
    }
    public filterThreatMap(threatMap: MGPMap<Coord, MGPSet<SandwichThreat>>,
                           state: TablutState)
    : MGPMap<Coord, MGPSet<SandwichThreat>>
    {
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
        const threateneds: Coord[] = threatMap.listKeys();
        const board: Table<TablutCase> = state.getCopiedBoard();
        const threatenedPlayerPieces: Coord[] = threateneds.filter((coord: Coord) => {
            return TablutRules.getAbsoluteOwner(coord, board) === state.getCurrentPlayer();
        });
        const threatenedEnnemyPieces: MGPSet<Coord> = new MGPSet(threateneds.filter((coord: Coord) => {
            return TablutRules.getAbsoluteOwner(coord, board) === state.getCurrentEnnemy();
        }));
        for (const threatenedPiece of threatenedPlayerPieces) {
            const oldThreatSet: SandwichThreat[] = threatMap.get(threatenedPiece).get().getCopy();
            const newThreatSet: SandwichThreat[] = [];
            for (const threat of oldThreatSet) {
                if (threatenedEnnemyPieces.contains(threat.direct.get(0)) === false) {
                    // if the direct threat of this piece is not a false threat
                    const newMover: Coord[] = [];
                    for (const mover of threat.mover.getCopy()) {
                        if (threatenedEnnemyPieces.contains(mover) === false) {
                            // if the moving threat of this piece is real
                            newMover.push(mover);
                        }
                    }
                    if (newMover.length > 0) {
                        newThreatSet.push(new SandwichThreat(threat.direct.get(0), new MGPSet(newMover)));
                    }
                }
            }
            if (newThreatSet.length > 0) {
                filteredThreatMap.set(threatenedPiece, new MGPSet(newThreatSet));
            }
        }
        for (const threatenedEnnemyPiece of threatenedEnnemyPieces.getCopy()) {
            const threatSet: MGPSet<SandwichThreat> = threatMap.get(threatenedEnnemyPiece).get();
            filteredThreatMap.set(threatenedEnnemyPiece, threatSet);
        }
        return filteredThreatMap;
    }
}

import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TablutCase } from './TablutCase';
import { TablutMinimax } from './TablutMinimax';
import { TablutPartSlice } from './TablutPartSlice';
import { TablutNode, TablutRules } from './TablutRules';
import { TablutRulesConfig } from './TablutRulesConfig';

export class PieceThreat implements ComparableObject {

    public constructor(public readonly direct: Coord,
                       public readonly mover: MGPSet<Coord>) {}

    public equals(o: PieceThreat): boolean {
        return o.direct.equals(this.direct) &&
               o.mover.equals(this.mover);
    }
    public toString(): string {
        throw new Error('Method not implemented.');
    }
    public filter(coord: Coord): PieceThreat {
        if (this.direct.equals(coord)) {
            return null;
        }
        const newMover: Coord[] = this.mover.getCopy().filter((c: Coord) => c.equals(coord) === false);
        if (newMover.length === 0) {
            return null;
        }
        return new PieceThreat(this.direct, new MGPSet(newMover));
    }
}

export class TablutPieceAndInfluenceMinimax extends TablutMinimax {

    public static MAX_INFLUENCE: number = 16 * ((TablutRulesConfig.WIDTH * 2) - 2);

    public static SCORE_BY_THREATENED_PIECE: number = (16 * TablutPieceAndInfluenceMinimax.MAX_INFLUENCE) + 1;

    public static SCORE_BY_SAFE_PIECE: number = (16 * TablutPieceAndInfluenceMinimax.SCORE_BY_THREATENED_PIECE) + 1;

    public getBoardValue(node: TablutNode): NodeUnheritance {
        const gameStatus: GameStatus = TablutRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const state: TablutPartSlice = node.gamePartSlice;
        const WIDTH: number = TablutRulesConfig.WIDTH;
        const EMPTY: number = TablutCase.UNOCCUPIED.value;

        let score: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<PieceThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<PieceThreat>> = this.filterThreatMap(threatMap, state);
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
    public getPiecesMap(state: TablutPartSlice): MGPMap<Player, MGPSet<Coord>> {
        const WIDTH: number = TablutRulesConfig.WIDTH;
        const board: number[][] = state.getCopiedBoard();
        const EMPTY: number = TablutCase.UNOCCUPIED.value;
        const map: MGPMap<Player, MGPSet<Coord>> = new MGPMap();
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (let y: number = 0; y < WIDTH; y++) {
            for (let x: number = 0; x < WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: number = state.getBoardAt(coord);
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
    public getThreatMap(state: TablutPartSlice,
                        pieces: MGPMap<Player, MGPSet<Coord>>)
    : MGPMap<Coord, MGPSet<PieceThreat>>
    {
        const threatMap: MGPMap<Coord, MGPSet<PieceThreat>> = new MGPMap();
        for (const player of [Player.ZERO, Player.ONE]) {
            for (const piece of pieces.get(player).get().getCopy()) {
                const threats: PieceThreat[] = this.getThreats(piece, state);
                if (this.isThreatReal(piece, state, threats)) {
                    threatMap.set(piece, new MGPSet(threats));
                }
            }
        }
        return threatMap;
    }
    public getThreats(coord: Coord, state: TablutPartSlice): PieceThreat[] {
        const board: number[][] = state.getCopiedBoard();
        const threatenerPlayer: Player = TablutRules.getAbsoluteOwner(coord, board).getOpponent();
        const threats: PieceThreat[] = [];
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
                           state.getBoardAt(futureCapturer) === TablutCase.UNOCCUPIED.value)
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
                threats.push(new PieceThreat(directThreat, new MGPSet(movingThreats)));
            }
        }
        return threats;
    }
    public isThreatened(coord: Coord,
                        state: TablutPartSlice,
                        filteredThreatMap: MGPMap<Coord, MGPSet<PieceThreat>>)
    : boolean
    { // TODO: same for the king
        if (state.getBoardAt(coord) === TablutCase.UNOCCUPIED.value) {
            return false;
        }
        const filteredThreats: MGPSet<PieceThreat> = filteredThreatMap.get(coord).getOrNull();
        if (filteredThreats == null) {
            return false;
        }
        return this.isThreatReal(coord, state, filteredThreats.getCopy());
    }
    public isAThreat(coord: Coord, state: TablutPartSlice, ennemy: Player): boolean {
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
                return state.getBoardAt(coord) === TablutCase.UNOCCUPIED.value;
            }
        }
    }
    public isThreatReal(coord: Coord, state: TablutPartSlice, threats: PieceThreat[]): boolean {
        if (threats.length === 0) {
            return false;
        }
        if (TablutRules.isKing(state.getBoardAt(coord))) {
            return threats.length === 3;
        } else {
            for (const threat of threats) {
                if (threat.mover.size() > 0) {
                    return true;
                }
            }
        }
    }
    public filterThreatMap(threatMap: MGPMap<Coord, MGPSet<PieceThreat>>,
                           state: TablutPartSlice)
    : MGPMap<Coord, MGPSet<PieceThreat>>
    {
        const filteredThreatMap: MGPMap<Coord, MGPSet<PieceThreat>> = new MGPMap();
        const threateneds: Coord[] = threatMap.listKeys();
        const board: NumberTable = state.getCopiedBoard();
        const threatenedPlayerPieces: Coord[] = threateneds.filter((coord: Coord) => {
            return TablutRules.getAbsoluteOwner(coord, board) === state.getCurrentPlayer();
        });
        const threatenedEnnemyPieces: MGPSet<Coord> = new MGPSet(threateneds.filter((coord: Coord) => {
            return TablutRules.getAbsoluteOwner(coord, board) === state.getCurrentEnnemy();
        }));
        for (const threatenedPiece of threatenedPlayerPieces) {
            const oldThreatSet: PieceThreat[] = threatMap.get(threatenedPiece).get().getCopy();
            const newThreatSet: PieceThreat[] = [];
            for (const threat of oldThreatSet) {
                if (threatenedEnnemyPieces.contains(threat.direct) === false) {
                    // if the direct threat of this piece is not a false threat
                    const newMover: Coord[] = [];
                    for (const mover of threat.mover.getCopy()) {
                        if (threatenedEnnemyPieces.contains(mover) === false) {
                            // if the moving threat of this piece is real
                            newMover.push(mover);
                        }
                    }
                    if (newMover.length > 0) {
                        newThreatSet.push(new PieceThreat(threat.direct, new MGPSet(newMover)));
                    }
                }
            }
            if (newThreatSet.length > 0) {
                filteredThreatMap.set(threatenedPiece, new MGPSet(newThreatSet));
            }
        }
        for (const threatenedEnnemyPiece of threatenedEnnemyPieces.getCopy()) {
            const threatSet: MGPSet<PieceThreat> = threatMap.get(threatenedEnnemyPiece).get();
            filteredThreatMap.set(threatenedEnnemyPiece, threatSet);
        }
        return filteredThreatMap;
    }
}

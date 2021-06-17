import { Coord } from 'src/app/jscaip/Coord';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { PieceThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { CoerceoMinimax } from './CoerceoMinimax';
import { CoerceoStep } from './CoerceoMove';
import { CoerceoPartSlice, CoerceoPiece } from './CoerceoPartSlice';
import { CoerceoNode, CoerceoRules } from './CoerceoRules';

export class CoerceoPiecesThreatTilesMinimax extends CoerceoMinimax {

    public static readonly SCORE_BY_THREATENED_PIECE: number = 20;

    public static readonly SCORE_BY_SAFE_PIECE: number = 20 * 19;

    public getBoardValue(node: CoerceoNode): NodeUnheritance {
        const status: GameStatus = CoerceoRules.getGameStatus(node);
        if (status.isEndGame) {
            return NodeUnheritance.fromWinner(status.winner);
        }
        const state: CoerceoPartSlice = node.gamePartSlice;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, PieceThreat> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, PieceThreat> = this.filterThreatMap(threatMap, state);
        let score: number = 0;
        for (const owner of [Player.ZERO, Player.ONE]) {
            for (const coord of pieceMap.get(owner).get().getCopy()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * CoerceoPiecesThreatTilesMinimax.SCORE_BY_THREATENED_PIECE;
                } else {
                    score += owner.getScoreModifier() * CoerceoPiecesThreatTilesMinimax.SCORE_BY_SAFE_PIECE;
                }
            }
        }
        score += state.tiles[1] - state.tiles[0];
        return new NodeUnheritance(score);
    }
    public getPiecesMap(state: CoerceoPartSlice): MGPMap<Player, MGPSet<Coord>> {
        const EMPTY: number = CoerceoPiece.EMPTY.value;
        const NONE: number = CoerceoPiece.NONE.value;
        const map: MGPMap<Player, MGPSet<Coord>> = new MGPMap();
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: number = state.getBoardAt(coord);
                if (piece !== EMPTY && piece !== NONE) {
                    if (piece === Player.ZERO.value) {
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
    public getThreatMap(state: CoerceoPartSlice,
                        pieces: MGPMap<Player, MGPSet<Coord>>)
    : MGPMap<Coord, PieceThreat>
    {
        const threatMap: MGPMap<Coord, PieceThreat> = new MGPMap();
        for (const player of [Player.ZERO, Player.ONE]) {
            for (const piece of pieces.get(player).get().getCopy()) {
                const threat: PieceThreat = this.getThreats(piece, state);
                if (threat != null) {
                    threatMap.set(piece, threat);
                }
            }
        }
        return threatMap;
    }
    public getThreats(coord: Coord, state: CoerceoPartSlice): PieceThreat { // TODO: check threat by leaving tile
        const threatenerPlayer: Player = Player.of(state.getBoardAt(coord));
        const ENNEMY: number = threatenerPlayer.getOpponent().value;
        let freedoms: number = 0;
        const directThreats: Coord[] = [];
        const movingThreats: Coord[] = [];
        const neighboors: Coord[] = TriangularCheckerBoard
            .getNeighboors(coord)
            .filter((c: Coord) => c.isInRange(15, 10));
        for (const directThreat of neighboors) {
            const threat: number = state.getBoardAt(directThreat);
            if (threat === CoerceoPiece.EMPTY.value) {
                freedoms += 1;
                for (const step of CoerceoStep.STEPS) {
                    const mover: Coord = directThreat.getNext(step.direction, 1);
                    if (mover.isInRange(15, 10) &&
                        state.getBoardAt(mover) === ENNEMY &&
                        directThreats.every((direct: Coord) => direct.equals(mover) === false))
                    {
                        movingThreats.push(mover);
                    }
                }
            } else if (threat === ENNEMY) {
                directThreats.push(directThreat);
            }
        }
        if (freedoms === 1 && movingThreats.length > 0) {
            return new PieceThreat(new MGPSet(directThreats), new MGPSet(movingThreats));
        } else {
            return null;
        }
    }
    public filterThreatMap(threatMap: MGPMap<Coord, PieceThreat>,
                           state: CoerceoPartSlice)
    : MGPMap<Coord, PieceThreat>
    {
        const filteredThreatMap: MGPMap<Coord, PieceThreat> = new MGPMap();
        const threateneds: Coord[] = threatMap.listKeys();
        const threatenedPlayerPieces: Coord[] = threateneds.filter((coord: Coord) => {
            return state.getBoardAt(coord) === state.getCurrentPlayer().value;
        });
        const threatenedEnnemyPieces: MGPSet<Coord> = new MGPSet(threateneds.filter((coord: Coord) => {
            return state.getBoardAt(coord) === state.getCurrentEnnemy().value;
        }));
        for (const threatenedPiece of threatenedPlayerPieces) {
            const oldThreat: PieceThreat = threatMap.get(threatenedPiece).get();
            let newThreat: PieceThreat;
            if (threatenedEnnemyPieces.contains(oldThreat.direct[0]) === false) {
                // if the direct threat of this piece is not a false threat
                const newMover: Coord[] = [];
                for (const mover of oldThreat.mover.getCopy()) {
                    if (threatenedEnnemyPieces.contains(mover) === false) {
                        // if the moving threat of this piece is real
                        newMover.push(mover);
                    }
                }
                if (newMover.length > 0) {
                    newThreat = new PieceThreat(oldThreat.direct, new MGPSet(newMover));
                }
            }
            if (newThreat != null) {
                filteredThreatMap.set(threatenedPiece, newThreat);
            }
        }
        for (const threatenedEnnemyPiece of threatenedEnnemyPieces.getCopy()) {
            const threatSet: PieceThreat = threatMap.get(threatenedEnnemyPiece).get();
            filteredThreatMap.set(threatenedEnnemyPiece, threatSet);
        }
        return filteredThreatMap;
    }
}

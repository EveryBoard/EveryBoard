import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { PieceThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { CoerceoMinimax } from './CoerceoMinimax';
import { CoerceoStep } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode, CoerceoRules } from './CoerceoRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { Vector } from 'src/app/jscaip/Direction';

export class CoerceoPiecesThreatTilesMinimax extends CoerceoMinimax {

    public static readonly SCORE_BY_THREATENED_PIECE: number = 1000;

    public static readonly SCORE_BY_SAFE_PIECE: number = 1000 * 1000;

    public getBoardValue(node: CoerceoNode): NodeUnheritance {
        const gameStatus: GameStatus = CoerceoRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return NodeUnheritance.fromWinner(gameStatus.winner);
        }
        const state: CoerceoState = node.gameState;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, PieceThreat> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, PieceThreat> = this.filterThreatMap(threatMap, state);
        let score: number = 0;
        for (const owner of [Player.ZERO, Player.ONE]) {
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * CoerceoPiecesThreatTilesMinimax.SCORE_BY_THREATENED_PIECE;
                    console.log(coord.toString(), owner.getScoreModifier(), CoerceoPiecesThreatTilesMinimax.SCORE_BY_THREATENED_PIECE)
                } else {
                    score += owner.getScoreModifier() * CoerceoPiecesThreatTilesMinimax.SCORE_BY_SAFE_PIECE;
                    console.log(coord.toString(), owner.getScoreModifier(), CoerceoPiecesThreatTilesMinimax.SCORE_BY_SAFE_PIECE)
                }
            }
        }
        score += state.tiles[1] - state.tiles[0];
        return new NodeUnheritance(score);
    }
    public getPiecesMap(state: CoerceoState): MGPMap<Player, MGPSet<Coord>> {
        const map: MGPMap<Player, MGPSet<Coord>> = new MGPMap();
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (let y: number = 0; y < 10; y++) {
            for (let x: number = 0; x < 15; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: FourStatePiece = state.getPieceAt(coord);
                if (piece === FourStatePiece.ZERO) {
                    zeroPieces.push(coord);
                } else if (piece === FourStatePiece.ONE) {
                    onePieces.push(coord);
                }
            }
        }
        map.set(Player.ZERO, new CoordSet(zeroPieces));
        map.set(Player.ONE, new CoordSet(onePieces));
        return map;
    }
    public getThreatMap(state: CoerceoState,
                        pieces: MGPMap<Player, MGPSet<Coord>>)
    : MGPMap<Coord, PieceThreat>
    {
        const threatMap: MGPMap<Coord, PieceThreat> = new MGPMap();
        for (const player of [Player.ZERO, Player.ONE]) {
            for (const piece of pieces.get(player).get()) {
                const threat: MGPOptional<PieceThreat> = this.getThreat(piece, state);
                if (threat.isPresent()) {
                    threatMap.set(piece, threat.get());
                }
            }
        }
        return threatMap;
    }
    // TODO: check threat by leaving tile
    public getThreat(coord: Coord, state: CoerceoState): MGPOptional<PieceThreat> {
        const threatenerPlayer: Player = Player.of(state.getPieceAt(coord).value);
        const OPPONENT: Player = threatenerPlayer.getOpponent();
        let uniqueFreedom: MGPOptional<Coord> = MGPOptional.empty();
        const emptyableTiles: Coord[] = [];
        let directThreats: Coord[] = [];
        const neighbors: Coord[] = TriangularCheckerBoard
            .getNeighbors(coord)
            .filter((c: Coord) => c.isInRange(15, 10));
        for (const directThreat of neighbors) {
            const threat: FourStatePiece = state.getPieceAt(directThreat);
            if (threat.is(OPPONENT)) {
                directThreats.push(directThreat);
                if (this.tileCouldBeRemovedThisTurn(directThreat, state, OPPONENT)) {
                    emptyableTiles.push(directThreat);
                }
            } else if (threat === FourStatePiece.EMPTY) {
                if (uniqueFreedom.isPresent()) {
                    // more than one freedom!
                    return MGPOptional.empty();
                } else {
                    uniqueFreedom = MGPOptional.of(directThreat);
                }
            }
        }
        if (uniqueFreedom.isPresent()) {
            const movingThreats: Coord[] = [];
            for (const step of CoerceoStep.STEPS) {
                const movingThreat: Coord = uniqueFreedom.get().getNext(step.direction, 1);
                if (movingThreat.isInRange(15, 10) &&
                    state.getPieceAt(movingThreat).is(OPPONENT) &&
                    directThreats.some((coord: Coord) => coord.equals(movingThreat)) === false)
                {
                    movingThreats.push(movingThreat);
                }
            }
            if (movingThreats.length > 0) {
                return MGPOptional.of(new PieceThreat(new CoordSet(directThreats), new CoordSet(movingThreats)));
            }
        }
        if (emptyableTiles.length > 0) {
            directThreats = directThreats.filter((c: Coord) => c.equals(emptyableTiles[0]));
            return MGPOptional.of(new PieceThreat(new CoordSet(directThreats), new CoordSet([emptyableTiles[0]])));
        }
        return MGPOptional.empty();
    }
    private tileCouldBeRemovedThisTurn(coord: Coord, state: CoerceoState, OPPONENT: Player): boolean {
        const PLAYER: Player = OPPONENT.getOpponent();
        const isStateRemovable: boolean = state.isDeconnectable(coord);
        if (isStateRemovable === false) {
            return false;
        }
        let uniqueThreat: MGPOptional<Coord> = MGPOptional.empty();
        // for all coord of the tiles
        const tileUpperLeft: Coord = CoerceoState.getTilesUpperLeftCoord(coord);
        for (let y: number = 0; y < 2; y++) {
            for (let x: number = 0; x < 3; x++) {
                const tileCoord: Coord = tileUpperLeft.getNext(new Vector(x, y), 1);
                if (state.getPieceAt(tileCoord).is(OPPONENT)) {
                    if (this.pieceCouldLeaveTheTile(tileCoord)) {
                        // then add it to the threat list
                        if (uniqueThreat.isPresent()) {
                            return false;
                        } else {
                            uniqueThreat = MGPOptional.of(tileCoord);
                        }
                    } else {
                        return false;
                    }
                } else if (state.getPieceAt(tileCoord).is(PLAYER)) {
                    return false;
                }
            }
        }
        return uniqueThreat.isPresent();
    }
    public pieceCouldLeaveTheTile(piece: Coord): boolean {
        const startingTileUpperLeft: Coord = CoerceoState.getTilesUpperLeftCoord(piece);
        for (const dir of CoerceoStep.STEPS) {
            const landing: Coord = piece.getNext(dir.direction, 1);
            const landingTileUpperLeft: Coord = CoerceoState.getTilesUpperLeftCoord(landing);
            if (startingTileUpperLeft.equals(landingTileUpperLeft) === false) {
                return true;
            }
        }
        return false;
    }
    public filterThreatMap(threatMap: MGPMap<Coord, PieceThreat>,
                           state: CoerceoState)
    : MGPMap<Coord, PieceThreat>
    {
        const filteredThreatMap: MGPMap<Coord, PieceThreat> = new MGPMap();
        const threateneds: Coord[] = threatMap.listKeys();
        const threatenedPlayerPieces: Coord[] = threateneds.filter((coord: Coord) => {
            return state.getPieceAt(coord).is(state.getCurrentPlayer());
        });
        const threatenedOpponentPieces: MGPSet<Coord> = new CoordSet(threateneds.filter((coord: Coord) => {
            return state.getPieceAt(coord).is(state.getCurrentOpponent());
        }));
        for (const threatenedPiece of threatenedPlayerPieces) {
            const oldThreat: PieceThreat = threatMap.get(threatenedPiece).get();
            let newThreat: MGPOptional<PieceThreat> = MGPOptional.empty();
            for (const directOldThreat of oldThreat.directThreats) {
                if (threatenedOpponentPieces.contains(directOldThreat) === false) {
                    // if the direct threat of this piece is not a false threat
                    const newMover: Coord[] = [];
                    for (const mover of oldThreat.mover) {
                        if (threatenedOpponentPieces.contains(mover) === false) {
                            // if the moving threat of this piece is real
                            newMover.push(mover);
                        }
                    }
                    if (newMover.length > 0) {
                        newThreat = MGPOptional.of(new PieceThreat(oldThreat.directThreats, new CoordSet(newMover)));
                    }
                }
            }
            if (newThreat.isPresent()) {
                filteredThreatMap.set(threatenedPiece, newThreat.get());
            }
        }
        for (const threatenedOpponentPiece of threatenedOpponentPieces) {
            const threatSet: PieceThreat = threatMap.get(threatenedOpponentPiece).get();
            filteredThreatMap.set(threatenedOpponentPiece, threatSet);
        }
        return filteredThreatMap;
    }
}

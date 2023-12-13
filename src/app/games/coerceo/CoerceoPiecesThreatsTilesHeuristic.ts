import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { PieceThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { CoerceoMove, CoerceoStep } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode } from './CoerceoRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { Vector } from 'src/app/jscaip/Vector';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';

export class CoerceoPiecesThreatsTilesHeuristic extends PlayerMetricHeuristic<CoerceoMove, CoerceoState> {

    public static readonly SCORE_BY_THREATENED_PIECE: number = 1000;

    public static readonly SCORE_BY_SAFE_PIECE: number = 1000 * 1000;

    public getMetrics(node: CoerceoNode): [number, number] {
        const state: CoerceoState = node.gameState;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, PieceThreat> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, PieceThreat> = this.filterThreatMap(threatMap, state);
        const scores: [number, number] = [0, 0];
        for (const owner of Player.PLAYERS) {
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    scores[owner.getValue()] += CoerceoPiecesThreatsTilesHeuristic.SCORE_BY_THREATENED_PIECE;
                } else {
                    scores[owner.getValue()] += CoerceoPiecesThreatsTilesHeuristic.SCORE_BY_SAFE_PIECE;
                }
            }
            scores[owner.getValue()] += state.tiles[owner.getValue()];
        }
        return scores;
    }
    public getPiecesMap(state: CoerceoState): MGPMap<Player, MGPSet<Coord>> {
        const map: MGPMap<Player, MGPSet<Coord>> = new MGPMap();
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const piece: FourStatePiece = state.getPieceAt(coord);
            if (piece === FourStatePiece.ZERO) {
                zeroPieces.push(coord);
            } else if (piece === FourStatePiece.ONE) {
                onePieces.push(coord);
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
        for (const player of Player.PLAYERS) {
            for (const piece of pieces.get(player).get()) {
                const threat: MGPOptional<PieceThreat> = this.getThreat(piece, state);
                if (threat.isPresent()) {
                    threatMap.set(piece, threat.get());
                }
            }
        }
        return threatMap;
    }
    public getThreat(coord: Coord, state: CoerceoState): MGPOptional<PieceThreat> {
        const threatenerPlayer: Player = state.getPieceAt(coord).getPlayer() as Player;
        const opponent: Player = threatenerPlayer.getOpponent();
        let uniqueFreedom: MGPOptional<Coord> = MGPOptional.empty();
        let emptiableNeighborTile: MGPOptional<Coord> = MGPOptional.empty();
        let directThreats: Coord[] = [];
        const neighbors: Coord[] = TriangularCheckerBoard
            .getNeighbors(coord)
            .filter(CoerceoState.isOnBoard);
        for (const directThreat of neighbors) {
            const threat: FourStatePiece = state.getPieceAt(directThreat);
            if (threat.is(opponent)) {
                directThreats.push(directThreat);
                if (this.tileCouldBeRemovedThisTurn(directThreat, state, opponent)) {
                    emptiableNeighborTile = MGPOptional.of(directThreat);
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
                if (CoerceoState.isOnBoard(movingThreat) &&
                    state.getPieceAt(movingThreat).is(opponent) &&
                    directThreats.some((coord: Coord) => coord.equals(movingThreat)) === false)
                {
                    movingThreats.push(movingThreat);
                }
            }
            if (movingThreats.length > 0) {
                return MGPOptional.of(new PieceThreat(new CoordSet(directThreats), new CoordSet(movingThreats)));
            }
        }
        if (emptiableNeighborTile.isPresent()) {
            directThreats = directThreats.filter((c: Coord) => c.equals(emptiableNeighborTile.get()));
            const directThreatsSet: CoordSet = new CoordSet(directThreats);
            return MGPOptional.of(new PieceThreat(directThreatsSet, new CoordSet([emptiableNeighborTile.get()])));
        }
        return MGPOptional.empty();
    }
    private tileCouldBeRemovedThisTurn(coord: Coord, state: CoerceoState, OPPONENT: Player): boolean {
        const player: Player = OPPONENT.getOpponent();
        const isTileRemovable: boolean = state.isDeconnectable(coord);
        if (isTileRemovable === false) {
            return false;
        }
        let uniqueThreat: MGPOptional<Coord> = MGPOptional.empty();
        // for all coord of the tiles
        const tileUpperLeft: Coord = CoerceoState.getTilesUpperLeftCoord(coord);
        for (let tileY: number = 0; tileY < 2; tileY++) {
            for (let tileX: number = 0; tileX < 3; tileX++) {
                const tileCoord: Coord = tileUpperLeft.getNext(new Vector(tileX, tileY), 1);
                if (state.getPieceAt(tileCoord).is(OPPONENT)) {
                    if (this.pieceCouldLeaveTheTile(tileCoord, state)) {
                        // Then add it to the threat list
                        uniqueThreat = MGPOptional.of(tileCoord);
                    } else {
                        return false;
                    }
                } else if (state.getPieceAt(tileCoord).is(player)) {
                    return false;
                }
            }
        }
        return uniqueThreat.isPresent();
    }
    public pieceCouldLeaveTheTile(piece: Coord, state: CoerceoState): boolean {
        const startingTileUpperLeft: Coord = CoerceoState.getTilesUpperLeftCoord(piece);
        for (const dir of CoerceoStep.STEPS) {
            const landing: Coord = piece.getNext(dir.direction, 1);
            const landingTileUpperLeft: Coord = CoerceoState.getTilesUpperLeftCoord(landing);
            if (startingTileUpperLeft.equals(landingTileUpperLeft) === false &&
                CoerceoState.isOnBoard(landing) &&
                state.getPieceAt(landing) === FourStatePiece.EMPTY)
            {
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

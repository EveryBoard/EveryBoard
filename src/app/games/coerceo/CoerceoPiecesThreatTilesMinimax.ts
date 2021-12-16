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
        map.set(Player.ZERO, new MGPSet(zeroPieces));
        map.set(Player.ONE, new MGPSet(onePieces));
        return map;
    }
    public getThreatMap(state: CoerceoState,
                        pieces: MGPMap<Player, MGPSet<Coord>>)
    : MGPMap<Coord, PieceThreat>
    {
        const threatMap: MGPMap<Coord, PieceThreat> = new MGPMap();
        for (const player of [Player.ZERO, Player.ONE]) {
            for (const piece of pieces.get(player).get().getCopy()) {
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
        const directThreats: Coord[] = [];
        const neighboors: Coord[] = TriangularCheckerBoard
            .getNeighbors(coord)
            .filter((c: Coord) => c.isInRange(15, 10));
        for (const directThreat of neighboors) {
            const threat: FourStatePiece = state.getPieceAt(directThreat);
            if (threat.is(OPPONENT)) {
                directThreats.push(directThreat);
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
                    directThreats.every((coord: Coord) => coord.equals(movingThreat) === false))
                {
                    movingThreats.push(movingThreat);
                }
            }
            if (movingThreats.length > 0) {
                return MGPOptional.of(new PieceThreat(new MGPSet(directThreats), new MGPSet(movingThreats)));
            }
        }
        return MGPOptional.empty();
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
        const threatenedOpponentPieces: MGPSet<Coord> = new MGPSet(threateneds.filter((coord: Coord) => {
            return state.getPieceAt(coord).is(state.getCurrentOpponent());
        }));
        for (const threatenedPiece of threatenedPlayerPieces) {
            const oldThreat: PieceThreat = threatMap.get(threatenedPiece).get();
            let newThreat: MGPOptional<PieceThreat> = MGPOptional.empty();
            if (threatenedOpponentPieces.contains(oldThreat.direct.get(0)) === false) {
                // if the direct threat of this piece is not a false threat
                const newMover: Coord[] = [];
                for (const mover of oldThreat.mover.getCopy()) {
                    if (threatenedOpponentPieces.contains(mover) === false) {
                        // if the moving threat of this piece is real
                        newMover.push(mover);
                    }
                }
                if (newMover.length > 0) {
                    newThreat = MGPOptional.of(new PieceThreat(oldThreat.direct, new MGPSet(newMover)));
                }
            }
            if (newThreat.isPresent()) {
                filteredThreatMap.set(threatenedPiece, newThreat.get());
            }
        }
        for (const threatenedOpponentPiece of threatenedOpponentPieces.getCopy()) {
            const threatSet: PieceThreat = threatMap.get(threatenedOpponentPiece).get();
            filteredThreatMap.set(threatenedOpponentPiece, threatSet);
        }
        return filteredThreatMap;
    }
}

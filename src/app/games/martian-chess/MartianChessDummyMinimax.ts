import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessMoveResult, MartianChessNode, MartianChessRules } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';
import { MartianChessPiece } from './MartianChessPiece';
import { MGPSet } from 'src/app/utils/MGPSet';

export class MartianChessDummyMinimax extends Minimax<MartianChessMove, MartianChessState, MartianChessMoveResult> {

    public constructor(public ruler: MartianChessRules, name: string) {
        super(ruler, name);
    }
    public getListMoves(node: MartianChessNode): MartianChessMove[] {
        const state: MartianChessState = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerTerritory: MGPSet<number> = state.getPlayerTerritory(currentPlayer);
        let moves: MartianChessMove[] = [];
        for (const y of playerTerritory) {
            for (let x: number = 0; x < 4; x++) {
                const piece: MartianChessPiece = state.getPieceAtXY(x, y);
                switch (piece) {
                    case MartianChessPiece.PAWN:
                        moves = moves.concat(this.getMovesForPawnAt(state, x, y));
                        break;
                    case MartianChessPiece.DRONE:
                        moves = moves.concat(this.getMovesForDroneAt(state, x, y));
                        break;
                    case MartianChessPiece.QUEEN:
                        moves = moves.concat(this.getMovesForQueenAt(state, x, y));
                        break;
                    default:
                        break;
                }
            }
        }
        return moves;
    }
    public getMovesForPawnAt(state: MartianChessState, x: number, y: number): MartianChessMove[] {
        const coord: Coord = new Coord(x, y);
        const landingCoords: Coord[] = [];
        for (const dir of Direction.DIRECTIONS.filter((d: Direction) => d.isDiagonal())) {
            const landingCoord: Coord = coord.getNext(dir);
            if (landingCoord.isInRange(4, 8)) {
                landingCoords.push(landingCoord);
            }
        }
        return this.addLegalMoves(state, coord, landingCoords);
    }
    private addLegalMoves(state: MartianChessState,
                          startingCoord: Coord,
                          validLandingCoords: Coord[])
    {
        const moves: MartianChessMove[] = [];
        const firstPiece: MartianChessPiece = state.getPieceAt(startingCoord);
        const canPromoteDrone: boolean = state.isTherePieceOnPlayerSide(MartianChessPiece.DRONE) === false;
        const canPromoteQueen: boolean = state.isTherePieceOnPlayerSide(MartianChessPiece.QUEEN) === false;
        const last: MGPOptional<MartianChessMove> = state.lastMove;
        for (const landingCoord of validLandingCoords) {
            const landedPiece: MartianChessPiece = state.getPieceAt(landingCoord);
            if (landedPiece === MartianChessPiece.EMPTY) {
                // Moves
                this.add(moves, MartianChessMove.from(startingCoord, landingCoord).get(), last);
            } else if (state.isInPlayerTerritory(landingCoord)) {
                // Promotions
                const promotion: MGPOptional<MartianChessPiece> = MartianChessPiece.tryMerge(landedPiece, firstPiece);
                if (promotion.isPresent()) {
                    const promoted: MartianChessPiece = promotion.get();
                    const move: MartianChessMove = MartianChessMove.from(startingCoord, landingCoord).get();
                    if (promoted === MartianChessPiece.DRONE && canPromoteDrone) {
                        this.add(moves, move, last);
                    } else if (promoted === MartianChessPiece.QUEEN && canPromoteQueen) {
                        this.add(moves, move, last);
                    }
                }
            } else {
                // Capture
                this.add(moves, MartianChessMove.from(startingCoord, landingCoord).get(), last);
            }
        }
        return moves;
    }
    private add(moves: MartianChessMove[],
                move: MartianChessMove,
                last: MGPOptional<MartianChessMove>)
    : void
    {
        const isCancellingLastMove: boolean = move.isUndoneBy(last);
        if (isCancellingLastMove === false) {
            moves.push(move);
        }
    }
    public getMovesForDroneAt(state: MartianChessState, x: number, y: number): MartianChessMove[] {
        const coord: Coord = new Coord(x, y);
        const landingCoords: Coord[] = this.getLandingCoordsForLinearMove(coord, state, 2);
        return this.addLegalMoves(state, coord, landingCoords);
    }
    private getLandingCoordsForLinearMove(startingCoord: Coord, state: MartianChessState, maxDist: number): Coord[] {
        const landingCoords: Coord[] = [];
        for (const dir of Direction.DIRECTIONS) {
            let dist: number = 1;
            let landingCoord: Coord = startingCoord.getNext(dir, dist);
            let landingContent: MGPOptional<MartianChessPiece> = state.tryToGetPieceAt(landingCoord);
            let possible: boolean = landingContent.equalsValue(MartianChessPiece.EMPTY);
            while (possible) {
                landingCoords.push(landingCoord);
                dist++;
                landingCoord = startingCoord.getNext(dir, dist);
                landingContent = state.tryToGetPieceAt(landingCoord);
                possible = landingContent.equalsValue(MartianChessPiece.EMPTY) && (dist < maxDist);
            }
            if (landingContent.isPresent()) {
                landingCoords.push(landingCoord);
            }
        }
        return landingCoords;
    }
    public getMovesForQueenAt(state: MartianChessState, x: number, y: number): MartianChessMove[] {
        const startingCoord: Coord = new Coord(x, y);
        const landingCoords: Coord[] = this.getLandingCoordsForQueen(startingCoord, state);
        return this.addLegalMoves(state, startingCoord, landingCoords);
    }
    private getLandingCoordsForQueen(startingCoord: Coord, state: MartianChessState): Coord[] {
        return this.getLandingCoordsForLinearMove(startingCoord, state, 8);
    }
    public getBoardValue(node: MartianChessNode): NodeUnheritance {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        let score: number;
        if (gameStatus.isEndGame) {
            score = gameStatus.toBoardValue();
        } else {
            const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
            const oneScore: number = node.gameState.getScoreOf(Player.ONE);
            score = oneScore - zeroScore;
        }
        return new NodeUnheritance(score);
    }
}

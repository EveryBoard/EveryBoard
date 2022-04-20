import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessMoveResult, MartianChessNode, MartianChessRules } from './MartianChessRules';
import { MartianChessPiece, MartianChessState } from './MartianChessState';

export class MartianChessDummyMinimax extends Minimax<MartianChessMove, MartianChessState, MartianChessMoveResult> {

    public constructor(public ruler: MartianChessRules, name: string) {
        super(ruler, name);
    }
    public getListMoves(node: MartianChessNode): MartianChessMove[] {
        const state: MartianChessState = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        const yRange: [number, number] = state.getPlayerTerritory(currentPlayer);
        const moves: MartianChessMove[] = [];
        for (let y: number = yRange[0]; y <= yRange[1]; y++) {
            for (let x: number = 0; x < 4; x++) {
                const piece: MartianChessPiece = state.getPieceAtXY(x, y);
                switch (piece) {
                    case MartianChessPiece.PAWN:
                        moves.push(...this.getMoveForPawn(x, y, state));
                        break;
                    case MartianChessPiece.DRONE:
                        moves.push(...this.getMoveForDrone(x, y, state));
                        break;
                    case MartianChessPiece.QUEEN:
                        moves.push(...this.getMoveForQueen(x, y, state));
                        break;
                    default:
                        break;
                }
            }
        }
        return moves;
    }
    public getMoveForPawn(x: number, y: number, state: MartianChessState): MartianChessMove[] {
        const coord: Coord = new Coord(x, y);
        const currentPlayer: Player = state.getCurrentPlayer();
        const yRange: [number, number] = state.getPlayerTerritory(currentPlayer);
        const landingCoords: Coord[] = [];
        for (const dir of Direction.DIRECTIONS.filter((d: Direction) => d.isDiagonal())) {
            const landingCoord: Coord = coord.getNext(dir);
            if (landingCoord.isInRange(4, 8)) {
                landingCoords.push(landingCoord);
            }
        }
        return this.addMoves(state, coord, landingCoords, yRange);
    }
    private addMoves(state: MartianChessState,
                     coord: Coord,
                     landingCoords: Coord[],
                     yRange: [number, number])
    {
        const moves: MartianChessMove[] = [];
        const firstPiece: MartianChessPiece = state.getPieceAt(coord);
        const canCallTheClock: boolean = state.countDown.isAbsent();
        const canPromoteDrone: boolean = state.isTherePieceOnPlayerSide(MartianChessPiece.DRONE) === false;
        const canPromoteQueen: boolean = state.isTherePieceOnPlayerSide(MartianChessPiece.QUEEN) === false;
        const last: MGPOptional<MartianChessMove> = state.lastMove;
        for (const landingCoord of landingCoords) {
            const landedPiece: MartianChessPiece = state.getPieceAt(landingCoord);
            if (landedPiece === MartianChessPiece.EMPTY) {
                // Moves
                this.add(moves, MartianChessMove.from(coord, landingCoord).get(), canCallTheClock, last);
            } else if (yRange[0] <= landingCoord.y && landingCoord.y <= yRange[1]) {
                // Promotions
                const promotion: MGPOptional<MartianChessPiece> = MartianChessPiece.tryMerge(landedPiece, firstPiece);
                if (promotion.isPresent()) {
                    const promoted: MartianChessPiece = promotion.get();
                    if (promoted === MartianChessPiece.DRONE && canPromoteDrone) {
                        this.add(moves, MartianChessMove.from(coord, landingCoord).get(), canCallTheClock, last);
                    } else if (promoted === MartianChessPiece.QUEEN && canPromoteQueen) {
                        this.add(moves, MartianChessMove.from(coord, landingCoord).get(), canCallTheClock, last);
                    }
                }
            } else {
                // Capture
                this.add(moves, MartianChessMove.from(coord, landingCoord).get(), canCallTheClock, last);
            }
        }
        return moves;
    }
    private add(moves: MartianChessMove[],
                move: MartianChessMove,
                canCallTheClock: boolean,
                optLast: MGPOptional<MartianChessMove> = MGPOptional.empty())
    : void
    {
        const isCancellingLastMove: boolean = move.isUndoneBy(optLast);
        if (isCancellingLastMove === false) {
            moves.push(move);
            if (canCallTheClock) {
                const clockCalledMove: MartianChessMove = MartianChessMove.from(move.coord, move.end, true).get();
                moves.push(clockCalledMove);
            }
        }
    }
    public getMoveForDrone(x: number, y: number, state: MartianChessState): MartianChessMove[] {
        const coord: Coord = new Coord(x, y);
        const currentPlayer: Player = state.getCurrentPlayer();
        const yRange: [number, number] = state.getPlayerTerritory(currentPlayer);
        const diagonalLandingCoords: Coord[] = this.getValidDiagonalCoordForDrone(coord, state);
        const verticalLandingCoords: Coord[] = this.getValidVerticalCoordForDrone(coord, state);
        const landingCoords: Coord[] = diagonalLandingCoords.concat(verticalLandingCoords);
        return this.addMoves(state, coord, landingCoords, yRange);
    }
    private getValidDiagonalCoordForDrone(startingCoord: Coord, state: MartianChessState) {
        const diagonalLandingCoords: Coord[] = [];
        for (const dir of Direction.DIRECTIONS.filter((d: Direction) => d.isDiagonal())) {
            const landingCoord: Coord = startingCoord.getNext(dir);
            if (landingCoord.isInRange(4, 8)) {
                const diagonalIsLegalForDrone: boolean = this.ruler.isDiagonalLegalForDrone(state, dir, startingCoord);
                if (diagonalIsLegalForDrone) {
                    diagonalLandingCoords.push(landingCoord);
                }
            }
        }
        return diagonalLandingCoords;
    }
    private getValidVerticalCoordForDrone(coord: Coord, state: MartianChessState) {
        const verticalLandingCoords: Coord[] = [];
        for (const dir of Direction.DIRECTIONS.filter((d: Direction) => d.isVertical())) {
            const landingCoord: Coord = coord.getNext(dir, 2);
            if (landingCoord.isInRange(4, 8)) {
                const intermediaryStep: Coord = coord.getNext(dir, 1);
                if (state.getPieceAt(intermediaryStep) === MartianChessPiece.EMPTY) {
                    verticalLandingCoords.push(landingCoord);
                }
            }
        }
        return verticalLandingCoords;
    }
    public getMoveForQueen(x: number, y: number, state: MartianChessState): MartianChessMove[] {
        const startingCoord: Coord = new Coord(x, y);
        const landingCoords: Coord[] = this.getLandingCoordForQueen(startingCoord, state);
        const currentPlayer: Player = state.getCurrentPlayer();
        const yRange: [number, number] = state.getPlayerTerritory(currentPlayer);
        return this.addMoves(state, startingCoord, landingCoords, yRange);
    }
    private getLandingCoordForQueen(startingCoord: Coord, state: MartianChessState): Coord[] {
        const landingCoords: Coord[] = [];
        for (const dir of Direction.DIRECTIONS) {
            let dist: number = 1;
            let landingCoord: Coord = startingCoord.getNext(dir, dist);
            let possible: boolean = state.getPieceAtOrNull(landingCoord) === MartianChessPiece.EMPTY;
            while (possible) {
                landingCoords.push(landingCoord);
                dist++;
                landingCoord = startingCoord.getNext(dir, dist);
                possible = state.getPieceAtOrNull(landingCoord) === MartianChessPiece.EMPTY;
            }
        }
        return landingCoords;
    }
    public getBoardValue(node: MartianChessNode): NodeUnheritance {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        let score: number;
        if (gameStatus.isEndGame) {
            score = gameStatus.toBoardValue();
        } else {
            const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
            const oneScore: number = node.gameState.getScoreOf(Player.ONE);
            score = oneScore - zeroScore; // TODOTODO test that he prefer higher score, its only job
        }
        return new NodeUnheritance(score);
    }
}

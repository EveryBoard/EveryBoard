import { Rules } from 'src/app/jscaip/Rules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from './SaharaMove';
import { SaharaPawn } from './SaharaPawn';
import { SaharaPartSlice } from './SaharaPartSlice';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { TriangularGameState } from 'src/app/jscaip/TriangularGameState';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';

export class SaharaNode extends MGPNode<SaharaRules, SaharaMove, SaharaPartSlice> {}

export class SaharaMinimax extends Minimax<SaharaMove, SaharaPartSlice> {

    public getListMoves(node: SaharaNode): SaharaMove[] {
        const moves: SaharaMove[] = [];
        const board: SaharaPawn[][] = node.gamePartSlice.getCopiedBoard();
        const player: Player = node.gamePartSlice.getCurrentPlayer();
        const startingCoords: Coord[] = SaharaRules.getStartingCoords(board, player);
        for (const start of startingCoords) {
            const neighboors: Coord[] = TriangularGameState.getEmptyNeighboors(board, start, SaharaPawn.EMPTY);
            for (const neighboor of neighboors) {
                const newMove: SaharaMove = new SaharaMove(start, neighboor);
                board[neighboor.y][neighboor.x] = board[start.y][start.x];
                board[start.y][start.x] = SaharaPawn.EMPTY;
                moves.push(newMove);

                const upwardTriangle: boolean = (neighboor.y + neighboor.x)%2 === 0;
                if (upwardTriangle) {
                    const farNeighboors: Coord[] =
                        TriangularGameState.getEmptyNeighboors(board, neighboor, SaharaPawn.EMPTY);
                    for (const farNeighboor of farNeighboors) {
                        if (!farNeighboor.equals(start)) {
                            const farMove: SaharaMove = new SaharaMove(start, farNeighboor);
                            board[farNeighboor.y][farNeighboor.x] = board[neighboor.y][neighboor.x];
                            board[neighboor.y][neighboor.x] = SaharaPawn.EMPTY;
                            moves.push(farMove);

                            board[neighboor.y][neighboor.x] = board[farNeighboor.y][farNeighboor.x];
                            board[farNeighboor.y][farNeighboor.x] = SaharaPawn.EMPTY;
                        }
                    }
                }
                board[start.y][start.x] = board[neighboor.y][neighboor.x];
                board[neighboor.y][neighboor.x] = SaharaPawn.EMPTY;
            }
        }
        return moves;
    }
    public getBoardValue(move: SaharaMove, slice: SaharaPartSlice): NodeUnheritance {
        const board: SaharaPawn[][] = slice.getCopiedBoard();
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ONE);
        if (zeroFreedoms[0] === 0) {
            return new NodeUnheritance(Number.MAX_SAFE_INTEGER); // TODO: redo with Player.blbl
        } else if (oneFreedoms[0] === 0) {
            return new NodeUnheritance(Number.MIN_SAFE_INTEGER); // TODO: same
        }
        let i: number = 0;
        while (i<6 && zeroFreedoms[i] === oneFreedoms[i]) {
            i++;
        }
        return new NodeUnheritance(oneFreedoms[i % 6] - zeroFreedoms[i % 6]);
    }
}

export class SaharaRules extends Rules<SaharaMove, SaharaPartSlice> {

    public static VERBOSE: boolean = false;

    public static getStartingCoords(board: SaharaPawn[][], player: Player): Coord[] {
        const startingCoords: Coord[] = [];
        for (let y: number = 0; y<SaharaPartSlice.HEIGHT; y++) {
            for (let x: number = 0; x<SaharaPartSlice.WIDTH; x++) {
                if (board[y][x] === player.value) {
                    startingCoords.push(new Coord(x, y));
                }
            }
        }
        return startingCoords;
    }
    public static getBoardValuesFor(board: SaharaPawn[][], player: Player): number[] {
        const playersPiece: Coord[] = SaharaRules.getStartingCoords(board, player);
        const playerFreedoms: number[] = [];
        for (const piece of playersPiece) {
            const freedoms: number = TriangularGameState.getEmptyNeighboors(board, piece, SaharaPawn.EMPTY).length;
            if (freedoms === 0) {
                console.log('VEKTORUUUU')
                return [0];
            }
            playerFreedoms.push(freedoms);
        }
        return playerFreedoms.sort((a: number, b: number) => a - b);
    }
    public applyLegalMove(move: SaharaMove,
                          slice: SaharaPartSlice,
                          status: LegalityStatus)
    : SaharaPartSlice
    {
        display(SaharaRules.VERBOSE, 'Legal move ' + move.toString() + ' applied');
        const board: SaharaPawn[][] = slice.getCopiedBoard();
        board[move.end.y][move.end.x] = board[move.coord.y][move.coord.x];
        board[move.coord.y][move.coord.x] = SaharaPawn.EMPTY;
        const resultingSlice: SaharaPartSlice = new SaharaPartSlice(board, slice.turn + 1);
        return resultingSlice;
    }
    public isLegal(move: SaharaMove, slice: SaharaPartSlice): LegalityStatus {
        const movedPawn: SaharaPawn = slice.getBoardAt(move.coord);
        if (movedPawn !== slice.getCurrentPlayer().value) {
            display(SaharaRules.VERBOSE, 'This move is illegal because it is not the current player\'s turn.');
            return { legal: MGPValidation.failure('move pawned not owned by current player') };
        }
        const landingCase: SaharaPawn = slice.getBoardAt(move.end);
        if (landingCase !== SaharaPawn.EMPTY) {
            return { legal: MGPValidation.failure('Vous devez arriver sur une case vide.') };
        }
        const commonNeighboor: MGPOptional<Coord> = TriangularCheckerBoard.getCommonNeighboor(move.coord, move.end);
        if (commonNeighboor.isPresent()) {
            if (slice.getBoardAt(commonNeighboor.get()) === SaharaPawn.EMPTY) {
                return { legal: MGPValidation.SUCCESS };
            } else {
                return { legal: MGPValidation.failure('Vous ne pouvez rebondir que sur les cases rouges!') };
            }
        } else {
            return { legal: MGPValidation.SUCCESS };
        }
    }
    public isGameOver(state: SaharaPartSlice): boolean {
        const board: SaharaPawn[][] = state.getCopiedBoard();
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ONE);
        return zeroFreedoms[0] === 0 ||
               oneFreedoms[0] === 0;
    }
}

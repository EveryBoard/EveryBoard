import { Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { EncapsulePartSlice, EncapsuleCase } from './EncapsulePartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { Sets } from 'src/app/utils/collection-lib/sets/Sets';
import { EncapsuleLegalityStatus } from './EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { display } from 'src/app/utils/utils/utils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';

export class EncapsuleNode
    extends MGPNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {}

export class EncapsuleFailure {
    public static WRONG_COLOR: string = `Veuillez utiliser une pièce à votre couleur.`;
    public static NOT_REMAINING_PIECE: string = 'Veuillez utiliser une des pièces restantes.'
    public static INVALID_PLACEMENT: string =
        'Vous devez placer votre pièce sur une case vide ou sur une pièce plus petite.'
}

export class EncapsuleRules extends Rules<EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {
    public static readonly LINES: Coord[][] = [
        [new Coord(0, 0), new Coord(0, 1), new Coord(0, 2)],
        [new Coord(1, 0), new Coord(1, 1), new Coord(1, 2)],
        [new Coord(2, 0), new Coord(2, 1), new Coord(2, 2)],
        [new Coord(0, 0), new Coord(1, 0), new Coord(2, 0)],
        [new Coord(0, 1), new Coord(1, 1), new Coord(2, 1)],
        [new Coord(0, 2), new Coord(1, 2), new Coord(2, 2)],
        [new Coord(0, 0), new Coord(1, 1), new Coord(2, 2)],
        [new Coord(0, 2), new Coord(1, 1), new Coord(2, 0)],
    ];
    public static isVictory(slice: EncapsulePartSlice): boolean {
        const board: EncapsuleCase[][] = ArrayUtils.copyBiArray(slice.toCaseBoard());
        let victory: boolean = false;
        let i: number = 0;
        let line: Coord[];
        while (!victory && i<8) {
            line = EncapsuleRules.LINES[i++];
            const cases: EncapsuleCase[] = [board[line[0].y][line[0].x],
                board[line[1].y][line[1].x],
                board[line[2].y][line[2].x]];
            victory = EncapsuleRules.isVictoriousLine(cases);
        }
        return victory;
    }
    public static isVictoriousLine(cases: EncapsuleCase[]): boolean {
        const pieces: EncapsulePiece[] = cases.map((c: EncapsuleCase) => c.getBiggest());
        const owner: Player[] = pieces.map((piece: EncapsulePiece) => piece.getPlayer());
        if (owner[0] === Player.NONE) return false;
        return (owner[0] === owner[1]) && (owner[1] === owner[2]);
    }
    public isLegal(move: EncapsuleMove, slice: EncapsulePartSlice): EncapsuleLegalityStatus {
        // TODO: rename, not returning boolean anymore
        const LOCAL_VERBOSE: boolean = false;
        const boardCopy: number[][] = slice.getCopiedBoard();
        display(LOCAL_VERBOSE, move.toString());
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            if (slice.pieceBelongsToCurrentPlayer(movingPiece) === false) {
                return EncapsuleLegalityStatus.failure(EncapsuleFailure.WRONG_COLOR);
            }
            if (slice.isInRemainingPieces(movingPiece) === false) {
                return EncapsuleLegalityStatus.failure(EncapsuleFailure.NOT_REMAINING_PIECE);
            }
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const startingCase: EncapsuleCase = EncapsuleCase.decode(boardCopy[startingCoord.y][startingCoord.x]);
            movingPiece = startingCase.getBiggest();
            if (!slice.pieceBelongsToCurrentPlayer(movingPiece)) {
                return EncapsuleLegalityStatus.failure(EncapsuleFailure.WRONG_COLOR);
            }
        }
        const landingNumber: number = boardCopy[move.landingCoord.y][move.landingCoord.x];
        const landingCase: EncapsuleCase = EncapsuleCase.decode(landingNumber);
        const superpositionResult: MGPOptional<EncapsuleCase> = landingCase.tryToSuperposePiece(movingPiece);
        if (superpositionResult.isPresent()) {
            return { legal: MGPValidation.SUCCESS, newLandingCase: superpositionResult.get() };
        }
        return EncapsuleLegalityStatus.failure(EncapsuleFailure.INVALID_PLACEMENT);
    }
    public applyLegalMove(move: EncapsuleMove,
                          slice: EncapsulePartSlice,
                          legality: EncapsuleLegalityStatus)
    : EncapsulePartSlice
    {
        const newBoard: EncapsuleCase[][] = ArrayUtils.copyBiArray(slice.toCaseBoard());

        const newLandingCase: EncapsuleCase = legality.newLandingCase;
        let newRemainingPiece: EncapsulePiece[] = slice.getRemainingPieces();
        const newTurn: number = slice.turn + 1;
        newBoard[move.landingCoord.y][move.landingCoord.x] = EncapsuleCase.decode(newLandingCase.encode());
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            const indexBiggest: number = newRemainingPiece.indexOf(movingPiece);
            newRemainingPiece = newRemainingPiece.slice(0, indexBiggest)
                .concat(newRemainingPiece.slice(indexBiggest + 1));
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const oldStartingNumber: number = newBoard[startingCoord.y][startingCoord.x].encode();
            const oldStartingCase: EncapsuleCase = EncapsuleCase.decode(oldStartingNumber);
            const removalResult: {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} =
                oldStartingCase.removeBiggest();
            newBoard[startingCoord.y][startingCoord.x] = EncapsuleCase.decode(removalResult.removedCase.encode());
            movingPiece = removalResult.removedPiece;
        }
        const demapper: (p: EncapsuleCase) => number = (p: EncapsuleCase) => p.encode();
        const newNumberBoard: number[][] = ArrayUtils.mapBiArray<EncapsuleCase, number>(newBoard, demapper);
        const resultingSlice: EncapsulePartSlice = new EncapsulePartSlice(newNumberBoard, newTurn, newRemainingPiece);
        return resultingSlice;
    }
    public getBoardValue(move: EncapsuleMove, slice: EncapsulePartSlice): number {
        let boardValue: number;
        if (EncapsuleRules.isVictory(slice)) {
            boardValue = slice.turn%2 === 0 ?
                Number.MAX_SAFE_INTEGER :
                Number.MIN_SAFE_INTEGER;
        } else {
            boardValue = 0;
        }
        return boardValue;
    }
    public getListMoves(n: EncapsuleNode): MGPMap<EncapsuleMove, EncapsulePartSlice> {
        const moves: MGPMap<EncapsuleMove, EncapsulePartSlice> = new MGPMap<EncapsuleMove, EncapsulePartSlice>();
        const slice: EncapsulePartSlice = n.gamePartSlice;
        const board: Table<EncapsuleCase> = slice.toCaseBoard();
        const currentPlayer: Player = slice.getCurrentPlayer();
        const puttablePieces: EncapsulePiece[] = Sets.toComparableObjectSet(slice.getPlayerRemainingPieces());
        for (let y: number = 0; y < 3; y++) {
            for (let x: number = 0; x < 3; x++) {
                const coord: Coord = new Coord(x, y);
                // each drop
                for (const piece of puttablePieces) {
                    const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
                    const status: EncapsuleLegalityStatus = this.isLegal(move, slice);
                    if (status.legal.isSuccess()) {
                        const resultingSlice: EncapsulePartSlice = this.applyLegalMove(move, slice, status);
                        moves.set(move, resultingSlice);
                    }
                }
                if (board[y][x].belongsTo(currentPlayer)) {
                    for (let ly: number = 0; ly < 3; ly++) {
                        for (let lx: number = 0; lx < 3; lx++) {
                            const landingCoord: Coord = new Coord(lx, ly);
                            if (!landingCoord.equals(coord)) {
                                const newMove: EncapsuleMove = EncapsuleMove.fromMove(coord, landingCoord);
                                const status: EncapsuleLegalityStatus = this.isLegal(newMove, slice);
                                if (status.legal.isSuccess()) {
                                    const resultingSlice: EncapsulePartSlice =
                                        this.applyLegalMove(newMove, slice, status);
                                    moves.set(newMove, resultingSlice);
                                }
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
}

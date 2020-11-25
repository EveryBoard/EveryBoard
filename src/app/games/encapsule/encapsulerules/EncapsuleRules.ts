import { Rules } from '../../../jscaip/Rules';
import { MNode } from 'src/app/jscaip/MNode';
import { EncapsulePartSlice, EncapsuleCase } from '../EncapsulePartSlice';
import { EncapsuleMove } from '../encapsulemove/EncapsuleMove';
import { EncapsulePiece, EncapsuleMapper } from '../EncapsuleEnums';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { Sets } from 'src/app/collectionlib/sets/Sets';
import { EncapsuleLegalityStatus } from '../EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';

abstract class EncapsuleNode extends MNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {}

export class EncapsuleRules extends Rules<EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {

    static readonly LINES: Coord[][] = [
        [ new Coord(0, 0), new Coord(0, 1), new Coord(0, 2)],
        [ new Coord(1, 0), new Coord(1, 1), new Coord(1, 2)],
        [ new Coord(2, 0), new Coord(2, 1), new Coord(2, 2)],
        [ new Coord(0, 0), new Coord(1, 0), new Coord(2, 0)],
        [ new Coord(0, 1), new Coord(1, 1), new Coord(2, 1)],
        [ new Coord(0, 2), new Coord(1, 2), new Coord(2, 2)],
        [ new Coord(0, 0), new Coord(1, 1), new Coord(2, 2)],
        [ new Coord(0, 2), new Coord(1, 1), new Coord(2, 0)]
    ];
    public static isVictory(slice: EncapsulePartSlice): boolean {
        let board: EncapsuleCase[][] = slice.toCase();
        let victory: boolean = false;
        let i: number = 0;
        let line: Coord[];
        while (!victory && i<8) {
            line = EncapsuleRules.LINES[i++];
            let cases: EncapsuleCase[] = [board[line[0].y][line[0].x],
                                          board[line[1].y][line[1].x],
                                          board[line[2].y][line[2].x]];
            victory = EncapsuleRules.isVictoriousLine(cases);
        }
        return victory;
    }
    public static isVictoriousLine(cases: EncapsuleCase[]): boolean {
        let pieces: EncapsulePiece[] = cases.map(c => c.getBiggest());
        let owner: Player[] = pieces.map(piece => EncapsuleMapper.toPlayer(piece));
        if (owner[0] === Player.NONE) return false;
        return (owner[0] === owner[1]) && (owner[1] === owner[2]);
    }
    constructor() {
        super();
        this.node = MNode.getFirstNode(
            EncapsulePartSlice.getStartingSlice(),
            this);
    }
    public setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                EncapsulePartSlice.getStartingSlice(),
                this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
    public isLegal(move: EncapsuleMove, slice: EncapsulePartSlice): EncapsuleLegalityStatus {
        const LOCAL_VERBOSE: boolean = false;
        const FAILURE: EncapsuleLegalityStatus = {legal: false, newLandingCase: null};
        let boardCopy: number[][] = slice.getCopiedBoard();
        Rules.display(LOCAL_VERBOSE, move.toString());
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            if (!slice.isDropable(movingPiece)) {
                Rules.display(LOCAL_VERBOSE, "move illegal because: this piece is missing form the remaining pieces or do not belong to the current player");
                return FAILURE;
            }
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const startingCase: EncapsuleCase = EncapsuleCase.decode(boardCopy[startingCoord.y][startingCoord.x]);
            movingPiece = startingCase.getBiggest();
            Rules.display(LOCAL_VERBOSE,
                "at " + startingCoord.toString() + "\n" +
                "there is " + startingCase.toString() + "\n" +
                "whose bigger is " + EncapsuleMapper.getNameFromPiece(movingPiece) + "\n" +
                "move illegal because: piece does not belong to current player");
            if (!EncapsulePartSlice.pieceBelongToCurrentPlayer(movingPiece, slice.turn)) {
                return FAILURE;
            }
        }
        let landingNumber: number = boardCopy[move.landingCoord.y][move.landingCoord.x];
        let landingCase: EncapsuleCase = EncapsuleCase.decode(landingNumber);
        let superpositionResult: {success: boolean, result: EncapsuleCase} = landingCase.tryToSuperposePiece(movingPiece);
        if (superpositionResult.success === true) {
            return {legal: true, newLandingCase: superpositionResult.result};
        }
        Rules.display(LOCAL_VERBOSE, "move illegal because: Impossible Superposition ("+ EncapsuleMapper.getNameFromPiece(movingPiece) + " on " + landingCase.toString() + ")");
        return FAILURE;
    }
    public applyLegalMove(move: EncapsuleMove, slice: EncapsulePartSlice, legality: EncapsuleLegalityStatus): { resultingMove: EncapsuleMove; resultingSlice: EncapsulePartSlice; } {

        let numberBoard: number[][] = slice.getCopiedBoard(); // TODO: make board EncapsuleCase[][] and no longer number[][] ??
        let mapper: (n: number) => EncapsuleCase = EncapsuleCase.decode;
        let newBoard: EncapsuleCase[][] = ArrayUtils.mapBiArray<number, EncapsuleCase>(numberBoard, mapper);

        let newLandingCase: EncapsuleCase = legality.newLandingCase;
        let newRemainingPiece: EncapsulePiece[] = slice.getRemainingPiecesCopy();
        let newTurn: number = slice.turn + 1;
        newBoard[move.landingCoord.y][move.landingCoord.x] = EncapsuleCase.decode(newLandingCase.encode());
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            let indexBiggest: number = newRemainingPiece.indexOf(movingPiece);
            newRemainingPiece = newRemainingPiece.slice(0, indexBiggest).concat(newRemainingPiece.slice(indexBiggest + 1));
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            let oldStartingNumber: number = newBoard[startingCoord.y][startingCoord.x].encode();
            let oldStartingCase: EncapsuleCase = EncapsuleCase.decode(oldStartingNumber);
            let removalResult: {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} =
                oldStartingCase.removeBiggest();
            newBoard[startingCoord.y][startingCoord.x] = EncapsuleCase.decode(removalResult.removedCase.encode());
            movingPiece = removalResult.removedPiece;
        }
        let demapper: (p: EncapsuleCase) => number = (p: EncapsuleCase) => p.encode();
        let newNumberBoard: number[][] = ArrayUtils.mapBiArray<EncapsuleCase, number>(newBoard, demapper);
        const resultingSlice: EncapsulePartSlice = new EncapsulePartSlice(newNumberBoard, newTurn, newRemainingPiece);
        return {resultingSlice, resultingMove: move};
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
        if (EncapsuleRules.isVictory(slice)) {
            return moves;
        }
        const newBoard: EncapsuleCase[][] = slice.toCase();
        const currentPlayer: Player = slice.getCurrentPlayer();
        const puttablePieces: EncapsulePiece[] = Sets.toImmutableSet(slice.getPlayerRemainingPieces(currentPlayer));
        for (let y=0; y<3; y++) {
            for (let x=0; x<3; x++) {
                let coord: Coord = new Coord(x, y);
                // each drop
                for (let piece of puttablePieces) {
                    const newMove: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
                    let status: EncapsuleLegalityStatus = this.isLegal(newMove, slice);
                    if (status.legal) {
                        const result = this.applyLegalMove(newMove, slice, status);
                        moves.set(result.resultingMove, result.resultingSlice);
                    }
                }
                if (newBoard[y][x].belongToCurrentPlayer(currentPlayer)) {
                    for (let ly=0; ly<3; ly++) {
                        for (let lx=0; lx<3; lx++) {
                            let landingCoord: Coord = new Coord(lx, ly);
                            if (!landingCoord.equals(coord)) {
                                const newMove: EncapsuleMove = EncapsuleMove.fromMove(coord, landingCoord);
                                let status: EncapsuleLegalityStatus = this.isLegal(newMove, slice);
                                if (status.legal) {
                                    const result = this.applyLegalMove(newMove, slice, status);
                                    moves.set(result.resultingMove, result.resultingSlice);
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
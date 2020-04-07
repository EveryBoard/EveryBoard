import { Rules } from '../../jscaip/Rules';
import { MNode } from 'src/app/jscaip/MNode';
import { EncapsulePartSlice, EncapsuleCase } from './EncapsulePartSlice';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece, EncapsuleMapper } from './EncapsuleEnums';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { Sets } from 'src/app/collectionlib/Sets';
import { EncapsuleLegalityStatus } from './EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';

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
        if (LOCAL_VERBOSE) console.log(move.toString());
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece;
            if (!slice.isDropable(movingPiece)) {
                if (LOCAL_VERBOSE) console.log("move illegal because: this piece is missing form the remaining pieces or do not belong to the current player");
                return FAILURE;
            }
        } else {
            const startingCase: EncapsuleCase = EncapsuleCase.decode(boardCopy[move.startingCoord.y][move.startingCoord.x]);
            movingPiece = startingCase.getBiggest();
            if (LOCAL_VERBOSE) {
                console.log("at " + move.startingCoord);
                console.log("there is " + startingCase.toString());
                console.log("whose bigger is " + EncapsuleMapper.getNameFromPiece(movingPiece));
                console.log("move illegal because: piece does not belong to current player");
            }
            if (!EncapsulePartSlice.pieceBelongToCurrentPlayer(movingPiece, slice.turn)) {
                return FAILURE;
            }
        }
        if (movingPiece == EncapsulePiece.NONE) {
            if (LOCAL_VERBOSE) console.log("move illegal because: no selected piece!");
            return FAILURE;
        }
        let landingNumber: number = boardCopy[move.landingCoord.y][move.landingCoord.x];
        let landingCase: EncapsuleCase = EncapsuleCase.decode(landingNumber);
        let superpositionResult: {success: boolean, result: EncapsuleCase} = landingCase.tryToSuperposePiece(movingPiece);
        if (superpositionResult.success === true) {
            return {legal: true, newLandingCase: superpositionResult.result};
        }
        if (LOCAL_VERBOSE)
            console.log("move illegal because: Impossible Superposition ("+ EncapsuleMapper.getNameFromPiece(movingPiece) + " on " + landingCase.toString() + ")");
        return FAILURE;
    }
    public applyLegalMove(move: EncapsuleMove, slice: EncapsulePartSlice, legality: EncapsuleLegalityStatus): { resultingMove: EncapsuleMove; resultingSlice: EncapsulePartSlice; } {
        let newBoard: EncapsulePiece[][] = slice.getCopiedBoard();
        let newLandingCase: EncapsuleCase = legality.newLandingCase;
        let newRemainingPiece: EncapsulePiece[] = slice.getRemainingPiecesCopy();
        let newTurn: number = slice.turn + 1;
        newBoard[move.landingCoord.y][move.landingCoord.x] = newLandingCase.encode();
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece;
            let indexBiggest: number = newRemainingPiece.indexOf(movingPiece);
            newRemainingPiece = newRemainingPiece.slice(0, indexBiggest).concat(newRemainingPiece.slice(indexBiggest + 1));
        } else {
            let oldStartingNumber: number = newBoard[move.startingCoord.y][move.startingCoord.x];
            let oldStartingCase: EncapsuleCase = EncapsuleCase.decode(oldStartingNumber);
            let removalResult: {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} =
                oldStartingCase.removeBiggest();
            newBoard[move.startingCoord.y][move.startingCoord.x] = removalResult.removedCase.encode();
            movingPiece = removalResult.removedPiece;
        }
        const resultingSlice: EncapsulePartSlice = new EncapsulePartSlice(newBoard, newTurn, newRemainingPiece);
        return {resultingSlice, resultingMove: move};
    }
    public getBoardValue(n: MNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus>): number {
        let slice: EncapsulePartSlice = n.gamePartSlice;
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
    static isVictory(slice: EncapsulePartSlice): boolean {
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
    static isVictoriousLine(cases: EncapsuleCase[]): boolean {
        let pieces: EncapsulePiece[] = cases.map(c => c.getBiggest());
        let owner: Player[] = pieces.map(piece => EncapsuleMapper.toPlayer(piece));
        if (owner[0] === Player.NONE) return false;
        return (owner[0] === owner[1]) && (owner[1] === owner[2]);
    }
    public getListMoves(n: MNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus>): MGPMap<EncapsuleMove, EncapsulePartSlice> {
        const moves: MGPMap<EncapsuleMove, EncapsulePartSlice> = new MGPMap<EncapsuleMove, EncapsulePartSlice>();
        const slice: EncapsulePartSlice = n.gamePartSlice;
        if (EncapsuleRules.isVictory(slice)) {
            return moves;
        }
        const newBoard: EncapsuleCase[][] = slice.toCase();
        const currentPlayer: Player = slice.getCurrentPlayer();
        const puttablePieces: EncapsulePiece[] = Sets.toNumberSet(slice.getPlayerRemainingPieces(currentPlayer));
        for (let y=0; y<3; y++) {
            for (let x=0; x<3; x++) {
                let coord: Coord = new Coord(x, y);
                // each drop
                let currentCase: EncapsuleCase = newBoard[y][x];
                for (let piece of puttablePieces) {
                    const newMove: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
                    let status: EncapsuleLegalityStatus = this.isLegal(newMove, slice);
                    if (status.legal) {
                        const result = this.applyLegalMove(newMove, slice, status);
                        moves.put(result.resultingMove, result.resultingSlice);
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
                                    moves.put(result.resultingMove, result.resultingSlice);
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
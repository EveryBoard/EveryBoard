import {Rules} from '../../jscaip/Rules';
import { MNode } from 'src/app/jscaip/MNode';
import { Move } from 'src/app/jscaip/Move';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { EncapsulePartSlice, EncapsuleCase, Player } from './EncapsulePartSlice';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { Coord } from 'src/app/jscaip/Coord';

export class EncapsuleRules extends Rules {

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

    setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                EncapsulePartSlice.getStartingSlice(),
                this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
    isLegal(move: EncapsuleMove): boolean {
        return EncapsuleRules.isLegal(this.node.gamePartSlice as EncapsulePartSlice, move).legal;
    }
    static isLegal(slice: EncapsulePartSlice, move: EncapsuleMove): LegalityStatus {
        const FAILURE: LegalityStatus = {legal: false, newLandingCase: null};
        let boardCopy: number[][] = slice.getCopiedBoard();
        let movingPiece: EncapsulePiece;
        if (move.landingCoord.equals(move.startingCoord)) {
            return FAILURE;
        }
        if (move.isDropping()) {
            movingPiece = move.piece;
        } else {
            movingPiece = EncapsuleCase.decode(boardCopy[move.startingCoord.y][move.startingCoord.y]).getBiggest()
        }
        if (movingPiece == EncapsulePiece.NONE) {
            return FAILURE;
        }
        if (!slice.isGivable(movingPiece)) {
            return FAILURE;
        }
        if (!EncapsulePartSlice.pieceBelongToCurrentPlayer(movingPiece, slice.turn)) {
            return FAILURE;
        }
        let landingNumber: number = boardCopy[move.landingCoord.y][move.landingCoord.x];
        let landingCase: EncapsuleCase = EncapsuleCase.decode(landingNumber);
        let superpositionResult: {success: boolean, result: EncapsuleCase} = landingCase.tryToSuperposePiece(movingPiece);
        if (superpositionResult.success === true) {
            return {legal: true, newLandingCase: superpositionResult.result};
        }
        return FAILURE;
    }

    choose(move: EncapsuleMove): boolean {
        let slice: EncapsulePartSlice = this.node.gamePartSlice as EncapsulePartSlice;
        let legality: LegalityStatus = EncapsuleRules.isLegal(slice, move);
        if (!legality.legal) {
            return false;
        }
        const newPartSlice: EncapsulePartSlice = EncapsuleRules.applyLegalMove(slice, move, legality);
        const choice: MNode<EncapsuleRules> = new MNode<EncapsuleRules>(this.node, move, newPartSlice);
        this.node = choice;
        return true;
    }

    static applyLegalMove(slice: EncapsulePartSlice, move: EncapsuleMove, legality: LegalityStatus): EncapsulePartSlice {
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
        newBoard[move.landingCoord.y][move.landingCoord.x] = newLandingCase.put(movingPiece).encode();
        return new EncapsulePartSlice(newBoard, newTurn, newRemainingPiece);
    }

    getBoardValue(n: MNode<EncapsuleRules>): number {
        let slice: EncapsulePartSlice = 
            this.node.gamePartSlice as EncapsulePartSlice;
        if (EncapsuleRules.isVictory(slice)) {
            return this.node.gamePartSlice.turn%2 === 0 ?
                Number.MIN_SAFE_INTEGER :
                Number.MAX_SAFE_INTEGER;
        }
        return 0;
    }

    static isVictory(slice: EncapsulePartSlice): boolean {
        let board: EncapsuleCase[][] = slice.getCopiedBoard()
                                            .map(caseLine => caseLine.map(caseNumber => EncapsuleCase.decode(caseNumber)));
        let victory: boolean = false;
        let i: number = 0; let j: number;
        let line: Coord[];
        while (!victory && i<8) {
            line = EncapsuleRules.LINES[i++];
            j = 0;
            let cases: EncapsuleCase[] = [board[line[0].y][line[0].x],
                                          board[line[1].y][line[1].x],
                                          board[line[2].y][line[2].x]];
            victory = EncapsuleRules.isVictoriousLine(cases);
        }
        return victory;
    }

    static isVictoriousLine(cases: EncapsuleCase[]): boolean {
        let pieces: EncapsulePiece[] = cases.map(c => c.getBiggest());
        let owner: Player[] = pieces.map(piece => EncapsuleCase.toPlayer(piece));
        if (owner[0] === Player.NONE) return false;
        return (owner[0] === owner[1]) && (owner[1] === owner[2]);
    }

    getListMoves<R extends Rules>(n: MNode<R>): { key: EncapsuleMove; value: EncapsulePartSlice; }[] {
        const result: { key: EncapsuleMove; value: EncapsulePartSlice; }[] = []
        const slice: EncapsulePartSlice = this.node.gamePartSlice as EncapsulePartSlice;
        const newTurn: number = slice.turn + 1;
        const newBoard: EncapsuleCase[][] = slice.toCase();
        const currentPlayer: Player = slice.turn % 2;
        const puttablePieces: EncapsulePiece[] = slice.getPlayerRemainingPieces(currentPlayer);
        for (let y=0; y<3; y++) {
            for (let x=0; x<3; x++) {
                let coord: Coord = new Coord(x, y);
                // each drop
                let currentCase: EncapsuleCase = newBoard[y][x];
                for (let piece of puttablePieces) {
                    const newMove: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
                    let status: LegalityStatus = EncapsuleRules.isLegal(slice, newMove);
                    if (status.legal) {
                        const newSlice: EncapsulePartSlice = EncapsuleRules.applyLegalMove(slice, newMove, status);
                        result.push({key: newMove, value: newSlice});
                    }
                }
                if (newBoard[y][x].belongToCurrentPlayer(currentPlayer)) {
                    for (let ly=0; ly<3; ly++) {
                        for (let lx=0; lx<3; lx++) {
                            let landingCoord: Coord = new Coord(lx, ly);
                            const newMove: EncapsuleMove = EncapsuleMove.fromMove(coord, landingCoord);
                            let status: LegalityStatus = EncapsuleRules.isLegal(slice, newMove);
                            if (status.legal) {
                                // console.log("found legal move : " + newMove);
                                const newSlice: EncapsulePartSlice = EncapsuleRules.applyLegalMove(slice, newMove, status);
                                result.push({key: newMove, value: newSlice});
                            }
                        }
                    }
                }
            }
        }
        console.log(result.length + " choices at turn " + slice.turn);
        return result;
    }
}

interface LegalityStatus {

    legal: boolean;

    newLandingCase: EncapsuleCase;
}
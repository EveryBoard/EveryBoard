import {Rules} from '../../jscaip/Rules';
import { MNode } from 'src/app/jscaip/MNode';
import { Move } from 'src/app/jscaip/Move';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { EncapsulePartSlice, EncapsuleCase } from './EncapsulePartSlice';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece, Player, EncapsuleMapper } from './EncapsuleEnums';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { Sets } from 'src/app/collectionlib/Sets';

export class EncapsuleRules extends Rules<EncapsuleMove, EncapsulePartSlice> {

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
        return EncapsuleRules.isLegal(this.node.gamePartSlice, move).legal;
    }

    static isLegal(slice: EncapsulePartSlice, move: EncapsuleMove): LegalityStatus {
        const LOCAL_VERBOSE: boolean = false;
        const FAILURE: LegalityStatus = {legal: false, newLandingCase: null};
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

    choose(move: EncapsuleMove): boolean {
        console.log("choose");
        let slice: EncapsulePartSlice = this.node.gamePartSlice;
        let legality: LegalityStatus = EncapsuleRules.isLegal(slice, move);
        if (!legality.legal) {
            return false;
        }
        const newPartSlice: EncapsulePartSlice = EncapsuleRules.applyLegalMove(slice, move, legality);
        const choice: MNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice> = new MNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice>(this.node, move, newPartSlice);
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
        //newBoard[move.landingCoord.y][move.landingCoord.x] = newLandingCase.put(movingPiece).encode();
        return new EncapsulePartSlice(newBoard, newTurn, newRemainingPiece);
    }

    getBoardValue(n: MNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice>): number {
        let slice: EncapsulePartSlice = n.gamePartSlice;
        let boardValue: number;
        if (EncapsuleRules.isVictory(slice)) {
            console.log("this would be a victory");
            console.log(slice);
            boardValue = slice.turn%2 === 0 ?
                Number.MAX_SAFE_INTEGER :
                Number.MIN_SAFE_INTEGER;
        } else {
            boardValue = 0;
        }
        console.log("getBoardValue of " + n.gamePartSlice.toString() + " + " + n.move + " = " + boardValue);
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
        if (victory) console.log("victory at " + slice.turn + " on : " + JSON.stringify(slice.getCopiedBoard()));
        return victory;
    }

    static isVictoriousLine(cases: EncapsuleCase[]): boolean {
        let pieces: EncapsulePiece[] = cases.map(c => c.getBiggest());
        let owner: Player[] = pieces.map(piece => EncapsuleMapper.toPlayer(piece));
        if (owner[0] === Player.NONE) return false;
        return (owner[0] === owner[1]) && (owner[1] === owner[2]);
    }

    getListMoves(n: MNode<EncapsuleRules, EncapsuleMove, EncapsulePartSlice>): MGPMap<EncapsuleMove, EncapsulePartSlice> {
        const result: MGPMap<EncapsuleMove, EncapsulePartSlice> = new MGPMap<EncapsuleMove, EncapsulePartSlice>();
        const slice: EncapsulePartSlice = n.gamePartSlice;
        if (EncapsuleRules.isVictory(slice)) {
            return result;
        }
        const newTurn: number = slice.turn + 1;
        const newBoard: EncapsuleCase[][] = slice.toCase();
        const currentPlayer: Player = slice.turn % 2;
        const puttablePieces: EncapsulePiece[] = Sets.toNumberSet(slice.getPlayerRemainingPieces(currentPlayer));
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
                        result.put(newMove, newSlice);
                    }
                }
                if (newBoard[y][x].belongToCurrentPlayer(currentPlayer)) {
                    for (let ly=0; ly<3; ly++) {
                        for (let lx=0; lx<3; lx++) {
                            let landingCoord: Coord = new Coord(lx, ly);
                            if (!landingCoord.equals(coord)) {
                                const newMove: EncapsuleMove = EncapsuleMove.fromMove(coord, landingCoord);
                                let status: LegalityStatus = EncapsuleRules.isLegal(slice, newMove);
                                if (status.legal) {
                                    const newSlice: EncapsulePartSlice = EncapsuleRules.applyLegalMove(slice, newMove, status);
                                    result.put(newMove, newSlice);
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
}

interface LegalityStatus {

    legal: boolean;

    newLandingCase: EncapsuleCase;
}
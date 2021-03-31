import { Component } from '@angular/core';
import { Move } from '../../../jscaip/Move';
import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { EncapsuleRules } from 'src/app/games/encapsule/encapsule-rules/EncapsuleRules';
import { EncapsulePartSlice, EncapsuleCase } from 'src/app/games/encapsule/EncapsulePartSlice';
import { EncapsuleMove } from 'src/app/games/encapsule/encapsule-move/EncapsuleMove';
import { EncapsulePiece, Size } from 'src/app/games/encapsule/encapsule-piece/EncapsulePiece';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { EncapsuleLegalityStatus } from 'src/app/games/encapsule/EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

export class EncapsuleComponentFailure {
    public static NOT_DROPPABLE: string =`Veuillez choisir une de vos pièces parmi les pièces restantes.`;
    public static INVALID_PIECE_SELECTED: string =
        `Veuillez sélectionner une de vos pièces ou une case où vous avez la pièce la plus grande.`;
    public static SAME_DEST_AS_ORIGIN: string =
        `Veuillez sélectionner une case différente de la case d'origine du mouvement.`;
    public static END_YOUR_MOVE: string =
        `Vous effectuez un déplacement, choisissez votre case de destination.`;
}

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html',
})
export class EncapsuleComponent extends AbstractGameComponent<EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {
    public CASE_SIZE: number = 100;
    public STROKE_WIDTH: number = 5;
    public CIRCLE_STROKE_WIDTH: number = 10;

    public rules: EncapsuleRules = new EncapsuleRules(EncapsulePartSlice);
    private lastLandingCoord: Coord;
    private lastStartingCoord: MGPOptional<Coord> = MGPOptional.empty();
    private chosenCoord: Coord;
    private chosenPiece: EncapsulePiece;
    private chosenPieceIndex: number;

    public updateBoard(): void {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        const move: EncapsuleMove = this.rules.node.move;
        this.cancelMoveAttempt();

        if (move != null) {
            this.lastLandingCoord = move.landingCoord;
            this.lastStartingCoord = move.startingCoord;
        } else {
            this.lastLandingCoord = null;
            this.lastStartingCoord = MGPOptional.empty();
        }
    }
    public decodeMove(encodedMove: number): Move {
        return EncapsuleMove.decode(encodedMove);
    }
    public encodeMove(move: EncapsuleMove): number {
        return EncapsuleMove.encode(move);
    }
    public getListPieces(content: number): EncapsulePiece[] {
        return EncapsuleCase.decode(content).toList();
    }
    public getRemainingPieces(player: number): EncapsulePiece[] {
        return this.rules.node.gamePartSlice.getRemainingPiecesOfPlayer(Player.of(player));
    }
    public async onBoardClick(x: number, y: number): Promise<MGPValidation> {
        console.log({x, y});
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const clickedCoord: Coord = new Coord(x, y);
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        if (this.chosenCoord == null) {
            this.chosenCoord = clickedCoord;
            if (this.chosenPiece != null) {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromDrop(this.chosenPiece, clickedCoord);
                console.log('calling chooseMove');
                return this.tryMove(chosenMove);
            } else if (slice.getAt(clickedCoord).belongsTo(slice.getCurrentPlayer()) === false) {
                return this.cancelMove(EncapsuleComponentFailure.INVALID_PIECE_SELECTED);
            }
        } else {
            if (this.chosenCoord.equals(clickedCoord)) {
                return this.cancelMove(EncapsuleComponentFailure.SAME_DEST_AS_ORIGIN);
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromMove(this.chosenCoord, clickedCoord);
                return this.tryMove(chosenMove);

            }
        }
    }
    public async tryMove(move: EncapsuleMove): Promise<MGPValidation> {
        // TODO: shouldn't this be checked already by chooseMove? Tests
        // complain that chooseMove is called if we do not check it.
        const result = this.rules.isLegal(move, this.rules.node.gamePartSlice);
        if (result.legal.isFailure()) {
            return this.cancelMove(result.legal.getReason());
        } else {
            return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        }
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = null;
        this.chosenPiece = null;
        this.chosenPieceIndex = -1;
    }
    public async onPieceClick(player: number, piece: EncapsulePiece, index: number): Promise<MGPValidation> {
        console.log({player, piece, index});
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + player + '_' + piece.toString());
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        if (slice.isDroppable(piece) === false) {
            return this.cancelMove(EncapsuleComponentFailure.NOT_DROPPABLE);
        } else if (this.chosenCoord == null) {
            this.chosenPiece = piece;
            this.chosenPieceIndex = index;
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(EncapsuleComponentFailure.END_YOUR_MOVE);
        }
    }
    public getRectFill(x: number, y: number): string {
        if (this.isMoved(x, y)) {
            return this.MOVED_FILL;
        } else {
            return this.NORMAL_FILL;
        }
    }
    public getRectStyle(x: number, y: number): {[key:string]: string} {
        if (this.isSelected(x, y)) {
            return this.CLICKABLE_STYLE;
        }
        return {};
    }
    private isMoved(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        const lastStartingCoord: Coord = this.lastStartingCoord.getOrNull();
        return coord.equals(this.lastLandingCoord) ||
               coord.equals(lastStartingCoord) ||
               coord.equals(this.chosenCoord);
    }
    private isSelected(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        if (this.lastStartingCoord.isPresent()) {
            if (this.lastStartingCoord.get().equals(coord)) {
                return true;
            }
        }
        if (this.lastLandingCoord != null && this.lastLandingCoord.equals(coord)) {
            return true;
        }
        return false;
    }
    public getPieceRadius(piece: EncapsulePiece): number {
        switch (piece.getSize()) {
            case Size.BIG:
                return 45;
            case Size.MEDIUM:
                return 35;
            case Size.SMALL:
                return 20;
        }
    }
    public getPieceStroke(piece: EncapsulePiece): string {
        const player: Player = piece.getPlayer();
        return this.getPlayerColor(player);
    }
    public getSidePieceStyle(piece: EncapsulePiece, index: number): {[key:string]: string} {
        if (this.isSelectedPiece(piece) && this.chosenPieceIndex === index) {
            return this.CLICKABLE_STYLE;
        }
        return {};
    }
    private isSelectedPiece(piece: EncapsulePiece): boolean {
        if (this.chosenPiece === null) {
            return false;
        }
        return piece === this.chosenPiece;
    }
}

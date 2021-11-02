import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { EncapsuleRules } from 'src/app/games/encapsule/EncapsuleRules';
import { EncapsuleMinimax } from 'src/app/games/encapsule/EncapsuleMinimax';
import { EncapsuleState, EncapsuleCase } from 'src/app/games/encapsule/EncapsuleState';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { EncapsulePiece, Size } from 'src/app/games/encapsule/EncapsulePiece';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleLegalityStatus } from 'src/app/games/encapsule/EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { EncapsuleFailure } from './EncapsuleFailure';
import { EncapsuleTutorial } from './EncapsuleTutorial';

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class EncapsuleComponent extends RectangularGameComponent<EncapsuleRules,
                                                                 EncapsuleMove,
                                                                 EncapsuleState,
                                                                 EncapsuleCase,
                                                                 EncapsuleLegalityStatus>
{
    private lastLandingCoord: Coord;
    private lastStartingCoord: MGPOptional<Coord> = MGPOptional.empty();
    private chosenCoord: Coord;
    private chosenPiece: EncapsulePiece;
    private chosenPieceIndex: number;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new EncapsuleRules(EncapsuleState);
        this.availableMinimaxes = [
            new EncapsuleMinimax(this.rules, 'EncapsuleMinimax'),
        ];
        this.encoder = EncapsuleMove.encoder;
        this.tutorial = new EncapsuleTutorial().tutorial;
        this.updateBoard();
    }
    public updateBoard(): void {
        const state: EncapsuleState = this.rules.node.gameState;
        this.board = state.getCopiedBoard();
        const move: EncapsuleMove = this.rules.node.move;

        if (move != null) {
            this.lastLandingCoord = move.landingCoord;
            this.lastStartingCoord = move.startingCoord;
        } else {
            this.lastLandingCoord = null;
            this.lastStartingCoord = MGPOptional.empty();
        }
    }
    public getListPieces(content: EncapsuleCase): EncapsulePiece[] {
        return content.toList();
    }
    public getRemainingPieces(player: number): EncapsulePiece[] {
        return this.rules.node.gameState.getRemainingPiecesOfPlayer(Player.of(player));
    }
    public async onBoardClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const clickedCoord: Coord = new Coord(x, y);
        const state: EncapsuleState = this.rules.node.gameState;
        if (this.chosenCoord == null) {
            this.chosenCoord = clickedCoord;
            if (this.chosenPiece != null) {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromDrop(this.chosenPiece, clickedCoord);
                return this.chooseMove(chosenMove, this.rules.node.gameState, null, null);
            } else if (state.getPieceAt(clickedCoord).belongsTo(state.getCurrentPlayer()) === false) {
                return this.cancelMove(EncapsuleFailure.INVALID_PIECE_SELECTED());
            }
        } else {
            if (this.chosenCoord.equals(clickedCoord)) {
                return this.cancelMove(EncapsuleFailure.SAME_DEST_AS_ORIGIN());
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromMove(this.chosenCoord, clickedCoord);
                return this.chooseMove(chosenMove, this.rules.node.gameState, null, null);
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = null;
        this.chosenPiece = null;
        this.chosenPieceIndex = -1;
    }
    public async onPieceClick(player: number, piece: EncapsulePiece, index: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + player + '_' + piece.toString());
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const state: EncapsuleState = this.rules.node.gameState;
        if (state.isDroppable(piece) === false) {
            return this.cancelMove(EncapsuleFailure.NOT_DROPPABLE());
        } else if (this.chosenCoord == null) {
            this.chosenPiece = piece;
            this.chosenPieceIndex = index;
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(EncapsuleFailure.END_YOUR_MOVE());
        }
    }
    public getRectClasses(x: number, y: number): string {
        if (this.isSelected(x, y)) {
            return 'moved';
        }
        return '';
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
    public getPieceClasses(piece: EncapsulePiece): string[] {
        return [this.getPieceStrokeClass(piece)];
    }
    public getPieceStrokeClass(piece: EncapsulePiece): string {
        const player: Player = piece.getPlayer();
        return 'player' + player.value + '-stroke';
    }
    public getPieceRadius(piece: EncapsulePiece): number {
        switch (piece.getSize()) {
            case Size.BIG:
                return 40;
            case Size.MEDIUM:
                return 30;
            case Size.SMALL:
                return 20;
        }
    }
    public getHighlightedCases(): Coord[] {
        const coords: Coord[] = [];
        if (this.chosenCoord != null) {
            coords.push(this.chosenCoord);
        }
        return coords;
    }
    public getSidePieceClasses(piece: EncapsulePiece, index: number): string[] {
        const pieceClasses: string[] = this.getPieceClasses(piece);
        if (this.isSelectedPiece(piece) && this.chosenPieceIndex === index) {
            pieceClasses.push('clickable ');
        }
        return pieceClasses;
    }
    private isSelectedPiece(piece: EncapsulePiece): boolean {
        if (this.chosenPiece === null) {
            return false;
        }
        return piece === this.chosenPiece;
    }
}

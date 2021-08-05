import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { EncapsuleRules } from 'src/app/games/encapsule/EncapsuleRules';
import { EncapsuleMinimax } from 'src/app/games/encapsule/EncapsuleMinimax';
import { EncapsulePartSlice, EncapsuleCase } from 'src/app/games/encapsule/EncapsulePartSlice';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { EncapsulePiece, Size } from 'src/app/games/encapsule/EncapsulePiece';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleLegalityStatus } from 'src/app/games/encapsule/EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { EncapsuleFailure } from './EncapsuleFailure';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { encapsuleTutorial } from './EncapsuleTutorial';

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class EncapsuleComponent extends AbstractGameComponent<EncapsuleMove,
                                                              EncapsulePartSlice,
                                                              EncapsuleLegalityStatus> {

    public CASE_SIZE: number = 100;

    private lastLandingCoord: Coord;
    private lastStartingCoord: MGPOptional<Coord> = MGPOptional.empty();
    private chosenCoord: Coord;
    private chosenPiece: EncapsulePiece;
    private chosenPieceIndex: number;

    public encoder: MoveEncoder<EncapsuleMove> = EncapsuleMove.encoder;

    public tutorial: TutorialStep[] = encapsuleTutorial;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new EncapsuleRules(EncapsulePartSlice);
        this.availableMinimaxes = [
            new EncapsuleMinimax(this.rules, 'EncapsuleMinimax'),
        ];
    }
    public updateBoard(): void {
        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        const move: EncapsuleMove = this.rules.node.move;

        if (move != null) {
            this.lastLandingCoord = move.landingCoord;
            this.lastStartingCoord = move.startingCoord;
        } else {
            this.lastLandingCoord = null;
            this.lastStartingCoord = MGPOptional.empty();
        }
    }
    public getListPieces(content: number): EncapsulePiece[] {
        return EncapsuleCase.decode(content).toList();
    }
    public getRemainingPieces(player: number): EncapsulePiece[] {
        return this.rules.node.gamePartSlice.getRemainingPiecesOfPlayer(Player.of(player));
    }
    public async onBoardClick(x: number, y: number): Promise<MGPValidation> {
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
                return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
            } else if (slice.getAt(clickedCoord).belongsTo(slice.getCurrentPlayer()) === false) {
                return this.cancelMove(EncapsuleFailure.INVALID_PIECE_SELECTED);
            }
        } else {
            if (this.chosenCoord.equals(clickedCoord)) {
                return this.cancelMove(EncapsuleFailure.SAME_DEST_AS_ORIGIN);
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromMove(this.chosenCoord, clickedCoord);
                return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
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

        const slice: EncapsulePartSlice = this.rules.node.gamePartSlice;
        if (slice.isDroppable(piece) === false) {
            return this.cancelMove(EncapsuleFailure.NOT_DROPPABLE);
        } else if (this.chosenCoord == null) {
            this.chosenPiece = piece;
            this.chosenPieceIndex = index;
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(EncapsuleFailure.END_YOUR_MOVE);
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

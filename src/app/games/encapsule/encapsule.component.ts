import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { EncapsuleLegalityInformation, EncapsuleRules } from 'src/app/games/encapsule/EncapsuleRules';
import { EncapsuleMinimax } from 'src/app/games/encapsule/EncapsuleMinimax';
import { EncapsuleState, EncapsuleSpace } from 'src/app/games/encapsule/EncapsuleState';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { EncapsulePiece, Size } from 'src/app/games/encapsule/EncapsulePiece';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { EncapsuleFailure } from './EncapsuleFailure';
import { EncapsuleTutorial } from './EncapsuleTutorial';
import { Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class EncapsuleComponent extends RectangularGameComponent<EncapsuleRules,
                                                                 EncapsuleMove,
                                                                 EncapsuleState,
                                                                 EncapsuleSpace,
                                                                 EncapsuleLegalityInformation>
{
    private readonly INTER_PIECE_SPACE: number = 20;
    private lastLandingCoord: MGPOptional<Coord> = MGPOptional.empty();
    private lastStartingCoord: MGPOptional<Coord> = MGPOptional.empty();
    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    private chosenPiece: MGPOptional<EncapsulePiece> = MGPOptional.empty();
    private chosenPieceIndex: MGPOptional<number>;
    public remainingPieceLeftX: number[][] = [];

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
        const state: EncapsuleState = this.getState();
        this.board = state.getCopiedBoard();
        const move: MGPOptional<EncapsuleMove> = this.rules.node.move;
        this.calculateLeftX();

        if (move.isPresent()) {
            this.lastLandingCoord = MGPOptional.of(move.get().landingCoord);
            this.lastStartingCoord = move.get().startingCoord;
        } else {
            this.lastLandingCoord = MGPOptional.empty();
            this.lastStartingCoord = MGPOptional.empty();
        }
    }
    public getListPieces(content: EncapsuleSpace): EncapsulePiece[] {
        return content.toList();
    }
    public getRemainingPieces(player: number): EncapsulePiece[] {
        return this.getState().getRemainingPiecesOfPlayer(Player.of(player));
    }
    public async onBoardClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const clickedCoord: Coord = new Coord(x, y);
        const state: EncapsuleState = this.getState();
        if (this.chosenCoord.isAbsent()) {
            this.chosenCoord = MGPOptional.of(clickedCoord);
            if (this.chosenPiece.isPresent()) {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromDrop(this.chosenPiece.get(), clickedCoord);
                return this.chooseMove(chosenMove, this.getState());
            } else if (state.getPieceAt(clickedCoord).belongsTo(state.getCurrentPlayer()) === false) {
                return this.cancelMove(EncapsuleFailure.INVALID_PIECE_SELECTED());
            } else {
                // A coord has been selected for a future move
                return MGPValidation.SUCCESS;
            }
        } else {
            if (this.chosenCoord.equalsValue(clickedCoord)) {
                this.cancelMoveAttempt();
                return MGPValidation.SUCCESS;
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.fromMove(this.chosenCoord.get(), clickedCoord);
                return this.chooseMove(chosenMove, this.getState());
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = MGPOptional.empty();
        this.chosenPiece = MGPOptional.empty();
        this.chosenPieceIndex = MGPOptional.empty();
    }
    public async onPieceClick(player: number, piece: EncapsulePiece, index: number): Promise<MGPValidation> {
        const clickedId: string = '#piece_' + player + '_' + piece.toString() + '_' + index;
        const clickValidity: MGPValidation = this.canUserPlay(clickedId);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const state: EncapsuleState = this.getState();
        if (state.isDroppable(piece) === false) {
            return this.cancelMove(EncapsuleFailure.NOT_DROPPABLE());
        } else if (this.chosenCoord.isAbsent()) {
            if (this.chosenPiece.equalsValue(piece) && this.chosenPieceIndex.equalsValue(index)) {
                this.chosenPiece = MGPOptional.empty();
                this.chosenPieceIndex = MGPOptional.empty();
            } else {
                this.chosenPiece = MGPOptional.of(piece);
                this.chosenPieceIndex = MGPOptional.of(index);
            }
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(EncapsuleFailure.END_YOUR_MOVE());
        }
    }
    public getRectClasses(x: number, y: number): string {
        if (this.isSelected(x, y)) {
            return 'moved-fill';
        }
        return '';
    }
    private isSelected(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        if (this.lastStartingCoord.equalsValue(coord)) {
            return true;
        }
        if (this.lastLandingCoord.equalsValue(coord)) {
            return true;
        }
        return false;
    }
    public getPieceClasses(piece: EncapsulePiece): string[] {
        return [this.getPieceStrokeClass(piece)];
    }
    private getPieceStrokeClass(piece: EncapsulePiece): string {
        const player: PlayerOrNone = piece.getPlayer();
        assert(player.isPlayer(), 'EncapsuleComponent.getPieceStrokeClass should only be called with actual pieces!');
        return 'player' + player.value + '-stroke';
    }
    public getPieceRadius(piece: EncapsulePiece): number {
        switch (piece.getSize()) {
            case Size.BIG:
                return (this.SPACE_SIZE / 2) - (1 * this.STROKE_WIDTH);
            case Size.MEDIUM:
                return (this.SPACE_SIZE / 2) - (2 * this.STROKE_WIDTH) - 3;
            default:
                Utils.expectToBe(piece.getSize(), Size.SMALL);
                return (this.SPACE_SIZE / 2) - (3 * this.STROKE_WIDTH) - 6;
        }
    }
    public getSidePieceClasses(piece: EncapsulePiece, index: number): string[] {
        const pieceClasses: string[] = this.getPieceClasses(piece);
        if (this.isSelectedPiece(piece) && this.chosenPieceIndex.equalsValue(index)) {
            pieceClasses.push('selected-stroke');
        }
        return pieceClasses;
    }
    private isSelectedPiece(piece: EncapsulePiece): boolean {
        return this.chosenPiece.equalsValue(piece);
    }
    private calculateLeftX(): void {
        this.remainingPieceLeftX = [];
        for (let player: number = 0; player <= 1; player++) {
            this.remainingPieceLeftX.push([]);
            const pieces: EncapsulePiece[] = this.getRemainingPieces(player);
            for (let indexX: number = 0; indexX < pieces.length; indexX++) {
                if (indexX === 0) {
                    this.remainingPieceLeftX[player].push(0);
                } else {
                    const previousPieceLeftX: number = this.remainingPieceLeftX[player][indexX - 1];
                    const previousPieceWidth: number = 2 * this.getPieceRadius(pieces[indexX - 1]);
                    const previousPieceEndX: number = previousPieceLeftX + previousPieceWidth;
                    this.remainingPieceLeftX[player].push(previousPieceEndX + this.INTER_PIECE_SPACE);
                }
            }
        }
    }
    public getPieceLeftX(player: number, pieceIdx: number): number {
        return this.remainingPieceLeftX[player][pieceIdx];
    }
}

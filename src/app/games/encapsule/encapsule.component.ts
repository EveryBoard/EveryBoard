import { ChangeDetectorRef, Component } from '@angular/core';

import { MGPMap, MGPOptional, MGPValidation, Utils, Set } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { MCTS } from '../../jscaip/AI/MCTS';
import { Coord } from '../../jscaip/Coord';
import { Orthogonal } from '../../jscaip/Orthogonal';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { MessageDisplayer } from '../../services/MessageDisplayer';

import { EncapsuleDummyMinimax } from './EncapsuleDummyMinimax';
import { EncapsuleFailure } from './EncapsuleFailure';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsuleMoveGenerator } from './EncapsuleMoveGenerator';
import { EncapsulePiece } from './EncapsulePiece';
import { EncapsuleConfig, EncapsuleLegalityInformation, EncapsuleRules } from './EncapsuleRules';
import { EncapsuleState, EncapsuleSpace, EncapsuleSizeToNumberMap } from './EncapsuleState';

type SquareData = {
    coordClasses: string[] | string;
    piecesData: PieceData[];
}

type PieceData = {
    radius: number;
    classes: string[];
    translate: string;
}

@Component({
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class EncapsuleComponent extends RectangularGameComponent<EncapsuleRules,
                                                                 EncapsuleMove,
                                                                 EncapsuleState,
                                                                 EncapsuleSpace,
                                                                 EncapsuleConfig,
                                                                 EncapsuleLegalityInformation>
{
    private lastLandingCoord: MGPOptional<Coord> = MGPOptional.empty();
    private lastStartingCoord: MGPOptional<Coord> = MGPOptional.empty();
    protected pieceStrokeWidth: number = this.STROKE_WIDTH;
    protected chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    private chosenPiece: MGPOptional<EncapsulePiece> = MGPOptional.empty();
    private remainingPieceCenterCoords: MGPMap<Player, Coord[]> = new MGPMap();
    protected victoryCoords: Coord[] = [];
    protected boardPieces: SquareData[][] = [];

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Encapsule');
        this.availableAIs = [
            new EncapsuleDummyMinimax(),
            new MCTS($localize`MCTS`, new EncapsuleMoveGenerator(), this.rules),
        ];
        this.encoder = EncapsuleMove.encoder;
    }

    public override getViewBox(): ViewBox {
        const boardViewBox: ViewBox = super.getViewBox();
        return boardViewBox
            .expandAll((4 / 3) * this.SPACE_SIZE);
    }

    public override async showLastMove(move: EncapsuleMove): Promise<void> {
        this.lastLandingCoord = MGPOptional.of(move.landingCoord);
        this.lastStartingCoord = move.startingCoord;
    }

    public override hideLastMove(): void {
        this.lastLandingCoord = MGPOptional.empty();
        this.lastStartingCoord = MGPOptional.empty();
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.state = this.getState();
        const config: MGPOptional<EncapsuleConfig> = this.getConfig();
        this.board = this.state.getCopiedBoard();
        this.boardPieces = this.board.map(
            (line: EncapsuleSpace[], y: number) => {
                return line.map((space: EncapsuleSpace, x: number) => {
                    const piecesData: PieceData[] = this
                        .getListPieces(space)
                        .map(
                            (piece: EncapsulePiece) => {
                                const radius: number = this.getPieceRadius(piece);
                                return {
                                    radius,
                                    classes: this.getPieceClasses(piece),
                                    translate: this.getPieceTranslate(x, y),
                                };
                            },
                        );
                    return {
                        piecesData,
                        coordClasses: this.getRectClasses(x, y),
                    };
                });
            },
        );
        this.calculateLeftPieceCoords();
        this.victoryCoords = EncapsuleRules.get().getVictoriousCoords(this.state, config.get());
        this.setPieceStrokeWidth();
    }

    private setPieceStrokeWidth(): void {
        const configSize: number = this.state.nbOfPieceSize;
        const innerRadius: number = this.SPACE_SIZE - (this.STROKE_WIDTH / 2);
        this.pieceStrokeWidth = innerRadius / (configSize * 3);
    }

    private getListPieces(content: EncapsuleSpace): EncapsulePiece[] {
        return content.toList();
    }

    protected getRemainingPiecesTypeOfPlayer(player: Player): Set<EncapsulePiece> {
        const pieceMap: EncapsuleSizeToNumberMap = this.getState().getRemainingPiecesOfPlayer(player);
        const remainingSizeToNumber: MGPMap<number, number> =
            pieceMap.filter((_key: number, value: number) => value > 0);
        const remainingPieceSet: Set<number> = remainingSizeToNumber.getKeySet();
        return remainingPieceSet.map((size: number) => EncapsulePiece.ofSizeAndPlayer(size, player));
    } // TODO: make private or see how TrackBy work

    protected async onBoardClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + x + '-' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const clickedCoord: Coord = new Coord(x, y);
        const state: EncapsuleState = this.getState();
        if (this.chosenCoord.isAbsent()) {
            this.chosenCoord = MGPOptional.of(clickedCoord);
            if (this.chosenPiece.isPresent()) {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.ofDrop(this.chosenPiece.get(), clickedCoord);
                return this.chooseMove(chosenMove);
            } else if (state.getPieceAt(clickedCoord).belongsTo(state.getCurrentPlayer()) === false) {
                return this.cancelMove(EncapsuleFailure.INVALID_PIECE_SELECTED());
            } else {
                // A coord has been selected for a future move
                return MGPValidation.SUCCESS;
            }
        } else {
            if (this.chosenCoord.equalsValue(clickedCoord)) {
                return this.cancelMove();
            } else {
                const chosenMove: EncapsuleMove =
                    EncapsuleMove.ofMove(this.chosenCoord.get(), clickedCoord);
                return this.chooseMove(chosenMove);
            }
        }
    }

    public override cancelMoveAttempt(): void {
        this.chosenCoord = MGPOptional.empty();
        this.chosenPiece = MGPOptional.empty();
    }

    protected async onPieceClick(piece: EncapsulePiece): Promise<MGPValidation> {
        const clickedId: string = '#remaining-piece-' + piece.toString();
        const clickValidity: MGPValidation = await this.canUserPlay(clickedId);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const state: EncapsuleState = this.getState();
        if (state.isDroppable(piece) === false) {
            return this.cancelMove(EncapsuleFailure.NOT_DROPPABLE());
        } else if (this.chosenCoord.isAbsent()) {
            if (this.chosenPiece.equalsValue(piece)) {
                return this.cancelMove();
            } else {
                this.chosenPiece = MGPOptional.of(piece);
                return MGPValidation.SUCCESS;
            }
        } else {
            return this.cancelMove(EncapsuleFailure.END_YOUR_MOVE());
        }
    }

    private getRectClasses(x: number, y: number): string {
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

    private getPieceClasses(piece: EncapsulePiece): string[] {
        return [
            this.getPieceStrokeClass(piece),
        ];
    }

    private getPieceCenter(xOrY: number): number {
        return (this.SPACE_SIZE * xOrY) + (this.SPACE_SIZE / 2);
    }

    private getPieceStrokeClass(piece: EncapsulePiece): string {
        const player: PlayerOrNone = piece.getPlayer();
        Utils.assert(player.isPlayer(), 'EncapsuleComponent.getPieceStrokeClass should only be called with actual pieces!');
        return this.getPlayerClass(player, 'stroke');
    }

    protected getPieceRadius(piece: EncapsulePiece): number {
        const size: number = piece.getSize();
        // We want a stroke such that:
        //     - the stroke of the biggest piece still fits within a space of (SPACE_SIZE - HALF_STROKE)
        //     - the spacing between concentric circles is half as big as their stroke
        return ((3 * size) - 1) * this.pieceStrokeWidth * 0.5;
    } // TODO: make private or not ?

    public trackByPlayer(_idx: number, player: Player): number {
        return player.getValue();
    }

    public trackByIndex(idx: number): number {
        return idx;
    }

    public trackByPiece(_idx: number, piece: EncapsulePiece): string {
        return piece.toString();
    }

    protected getSidePieceClasses(piece: EncapsulePiece): string[] {
        const pieceClasses: string[] = this.getPieceClasses(piece);
        if (this.isSelectedPiece(piece)) {
            pieceClasses.push('selected-stroke');
        }
        return pieceClasses;
    } // TODO: make private

    private isSelectedPiece(piece: EncapsulePiece): boolean {
        return this.chosenPiece.equalsValue(piece);
    }

    private calculateLeftPieceCoords(): void {
        /**
         * Must have the maximum of piece below the board (for current player)
         * And the rest of them on the left of the board (for current player)
         * Aimed pattern (for current player):
         * 1 . . .
         * 2 . . .
         * 3 . . .
         *   4 5 6
         */
        this.remainingPieceCenterCoords = new MGPMap();
        const height: number = this.state.getHeight();
        const maxX: number = this.state.getWidth() - 1;
        const maxY: number = height - 1;
        for (const player of Player.PLAYERS) {
            const playersRemainingPieceLeftPieceCoords: Coord[] = [];
            const remainingPiecesSet: Set<EncapsulePiece> = this.getRemainingPiecesTypeOfPlayer(player);
            let abstractCoord: Coord = new Coord(-1, -1);
            for (let index: number = 0; index < remainingPiecesSet.size(); index++) {
                if (index < height + 1) {
                    abstractCoord = abstractCoord.getNext(Orthogonal.DOWN);
                } else {
                    abstractCoord = abstractCoord.getNext(Orthogonal.RIGHT);
                }
                let rotatedAbstractCoord: Coord;
                if (player.equals(Player.ZERO)) {
                    rotatedAbstractCoord = abstractCoord;
                } else {
                    rotatedAbstractCoord = new Coord(maxX - abstractCoord.x, maxY - abstractCoord.y);
                }
                const realX: number = this.getPieceCenter(rotatedAbstractCoord.x);
                const realY: number = this.getPieceCenter(rotatedAbstractCoord.y);
                playersRemainingPieceLeftPieceCoords.push(new Coord(realX, realY));
            }
            this.remainingPieceCenterCoords.set(player, playersRemainingPieceLeftPieceCoords);
        }
    }

    protected getRemainingPieceTranslate(player: Player, pieceIdX: number): string {
        const coord: Coord = this.remainingPieceCenterCoords.get(player).get()[pieceIdX];
        return this.getSVGTranslationAt(coord);
    } // TODO: make private

    private getPieceTranslate(x: number, y: number): string {
        const xCenter: number = this.getPieceCenter(x);
        const yCenter: number = this.getPieceCenter(y);
        const translation: string = this.getSVGTranslation(xCenter, yCenter);
        return translation;
    }

    protected getRemainingPieceQuantity(piece: EncapsulePiece): number {
        const player: Player = piece.getPlayer() as Player;
        return this.state.remainingPieces
            .get(player)
            .get(piece.getSize())
            .getOrElse(-1);
    } // TODO: make private

    protected getRemainingPieceQuantityTransform(piece: EncapsulePiece, pieceIdx: number): string {
        const offsetX: number = 0.7 * this.SPACE_SIZE;
        let cx: number = - offsetX;
        let cy: number = 0;
        if (pieceIdx > this.getState().getHeight()) {
            cx = 0;
            cy = offsetX;
        }
        if (piece.owner === PlayerOrNone.ONE) {
            cx = -cx;
            cy = -cy;
        }
        return 'translate(' + cx + ', ' + cy + ')';
    } // TODO: make private

}

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MGPMap, MGPOptional, MGPValidation, Utils, Set } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { DummyHeuristic } from '../../jscaip/AI/DummyHeuristic';
import { Coord } from '../../jscaip/Coord';
import { Orthogonal } from '../../jscaip/Orthogonal';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { RingComponent } from '../common/ring/ring.component';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-encapsule',
    templateUrl: './encapsule.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass, RingComponent],
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
    protected ringStrokeWidth: number = this.STROKE_WIDTH;
    protected chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    private chosenPiece: MGPOptional<EncapsulePiece> = MGPOptional.empty();
    private remainingPieceCenterCoords: MGPMap<Player, Coord[]> = new MGPMap();
    protected victoryCoords: Coord[] = [];
    protected boardPieces: SquareData[][] = [];
    protected pieceSizeToRadius: MGPMap<EncapsulePiece, number> = new MGPMap();

    public constructor() {
        super('Encapsule');
        this.aiConfig = {
            minimax: [{
                id: 'Dummy',
                name: $localize`Dummy`,
                heuristic: (): DummyHeuristic<EncapsuleMove, EncapsuleState, EncapsuleConfig> => new DummyHeuristic(),
                moveGenerator: (): EncapsuleMoveGenerator => new EncapsuleMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): EncapsuleMoveGenerator => new EncapsuleMoveGenerator(),
            }],
        };
        this.encoder = EncapsuleMove.encoder;
    }

    protected override computeViewBox(): ViewBox {
        const boardViewBox: ViewBox = super.computeViewBox();
        return boardViewBox
            .expandAll((4 / 3) * this.SPACE_SIZE);
    }

    protected override async showLastMove(move: EncapsuleMove): Promise<void> {
        this.lastLandingCoord = MGPOptional.of(move.landingCoord);
        this.lastStartingCoord = move.startingCoord;
        this.renderBoardPiece();
    }

    public override hideLastMove(): void {
        this.lastLandingCoord = MGPOptional.empty();
        this.lastStartingCoord = MGPOptional.empty();
        if (this.board) {
            this.renderBoardPiece();
        }
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.state = this.getState();
        const config: EncapsuleConfig = this.getConfig();
        this.board = this.state.getCopiedBoard();
        this.renderBoardPiece();
        this.calculateLeftPieceCoords();
        this.victoryCoords = EncapsuleRules.get().getVictoriousCoords(this.state, config);
        this.setRingStrokeWidth();
    }

    private renderBoardPiece(): void {
        this.boardPieces = this.board.map(
            (line: EncapsuleSpace[], y: number) => {
                return line.map((space: EncapsuleSpace, x: number) => {
                    const piecesData: PieceData[] = this
                        .getListPieces(space)
                        .map(
                            (piece: EncapsulePiece) => {
                                const radius: number = this.getPieceRadius(piece.getSize());
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
    }

    private setRingStrokeWidth(): void {
        const configSize: number = this.state.nbOfPieceSize;
        const innerRadius: number = (this.SPACE_SIZE - this.STROKE_WIDTH) / 2;
        // This below is the stroke of the ring + 1 inter-ring-space
        this.ringStrokeWidth = innerRadius / configSize;
        // This is only the stroke of the ring (2 stroke + width)
        this.ringStrokeWidth = 2 * this.ringStrokeWidth / 3;
        this.calculatePieceSizeToRadius();
    }

    private calculatePieceSizeToRadius(): void {
        this.pieceSizeToRadius = new MGPMap();
        for (const player of Player.PLAYERS) {
            for (let size: number = 1; size <= this.state.nbOfPieceSize; size++) {
                const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(size, player);
                this.pieceSizeToRadius.set(piece, this.getPieceRadius(size));
            }
        }
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
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    protected async onBoardClick(x: number, y: number): Promise<MGPValidation> {
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

    @ClickHandler((piece: EncapsulePiece) => '#remaining-piece-' + piece.toString())
    protected async onPieceClick(piece: EncapsulePiece): Promise<MGPValidation> {
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

    private getPieceRadius(size: number): number {
        // We want a stroke such that:
        //     - the stroke of the biggest piece still fits within a space of (SPACE_SIZE - HALF_STROKE)
        //     - the spacing between concentric circles is half as big as their stroke
        return 1.5 * size * this.ringStrokeWidth;
    }

    protected getSidePieceClasses(piece: EncapsulePiece): string[] {
        const pieceClasses: string[] = this.getPieceClasses(piece);
        if (this.isSelectedPiece(piece)) {
            pieceClasses.push('selected-stroke');
        }
        return pieceClasses;
    }

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
    }

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
    }

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
    }

}

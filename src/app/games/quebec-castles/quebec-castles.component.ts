import { ChangeDetectorRef, Component } from '@angular/core';
import { MGPOptional, MGPValidation, Set, Utils } from '@everyboard/lib';

import { QuebecCastlesConfig, QuebecCastlesRules } from './QuebecCastlesRules';
import { QuebecCastlesDrop, QuebecCastlesMove, QuebecCastlesTranslation } from './QuebecCastlesMove';
import { QuebecCastlesState } from './QuebecCastlesState';
import { MessageDisplayer } from '../../services/MessageDisplayer';
import { MCTS } from '../../jscaip/AI/MCTS';
import { QuebecCastlesMoveGenerator } from './QuebecCastlesMoveGenerator';
import { QuebecCastlesMinimax } from './QuebecCastlesMinimax';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from '../../jscaip/Coord';
import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { RulesFailure } from '../../jscaip/RulesFailure';

@Component({
    selector: 'app-quebec-castles',
    templateUrl: './quebec-castles.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class QuebecCastlesComponent extends RectangularGameComponent<QuebecCastlesRules,
                                                                     QuebecCastlesMove,
                                                                     QuebecCastlesState,
                                                                     PlayerOrNone,
                                                                     QuebecCastlesConfig>
{

    // Last Move
    private leftSquare: MGPOptional<Coord> = MGPOptional.empty();
    private landingSquare: MGPOptional<Coord> = MGPOptional.empty();
    private isCaptured: boolean = false;
    private lastDropped: Coord[] = [];

    // Current Move Attempt
    private dropped: Set<Coord> = new Set();
    public possibleLanding: Set<Coord> = new Set();
    private selected: MGPOptional<Coord> = MGPOptional.empty();

    // Board
    public constructedState: QuebecCastlesState;
    public missingPieces: PlayerNumberMap;
    public isDroppingGroup: boolean = false;
    public unextendedHeight: number = 0;
    private lowerCorner: Coord;
    private upperCorner: Coord;
    private minX: number = 0;
    private maxX: number = 0;
    private minY: number = 0;

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('QuebecCastles');
        this.availableAIs = [
            new QuebecCastlesMinimax(),
            new MCTS($localize`MCTS`, new QuebecCastlesMoveGenerator(), this.rules),
        ];
        this.encoder = QuebecCastlesMove.encoder;
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    public override getViewBox(): ViewBox {
        let viewBox: ViewBox = this.getBasicViewBox();
        if (this.isPlayerDropping()) {
            viewBox = viewBox.expandAbove(this.SPACE_SIZE);
            viewBox = viewBox.expandBelow(this.SPACE_SIZE);
        }
        return viewBox.expandAll(this.STROKE_WIDTH);
    }

    private getBasicViewBox(): ViewBox {
        const state: QuebecCastlesState = this.constructedState;
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        if (this.getConfig().get().isRhombic) {
            const rotationInRadius: number = -45 * Math.PI / 180;
            const upperCoord: Coord = new Coord(0, 0);
            const leftCoord: Coord = upperCoord.getNext(new Coord(0, height), this.SPACE_SIZE);
            const rightCoord: Coord = upperCoord.getNext(new Coord(width, 0), this.SPACE_SIZE);
            const lowerCoord: Coord = upperCoord.getNext(new Coord(width, height), this.SPACE_SIZE);
            const rotationCenter: Coord = new Coord(
                width * 0.5 * this.SPACE_SIZE,
                height * 0.5 * this.SPACE_SIZE,
            );
            this.upperCorner = this.getRotated(upperCoord, rotationCenter, rotationInRadius);
            const minY: number = this.upperCorner.y;
            const minX: number = this.getRotated(leftCoord, rotationCenter, rotationInRadius).x;
            const maxX: number = this.getRotated(rightCoord, rotationCenter, rotationInRadius).x;
            this.lowerCorner = this.getRotated(lowerCoord, rotationCenter, rotationInRadius);
            const maxY: number = this.lowerCorner.y;
            const viewBox: ViewBox = ViewBox.fromLimits(minX, maxX, minY, maxY);
            this.unextendedHeight = maxY;
            this.maxX = maxX;
            this.minX = minX;
            this.minY = minY;
            return viewBox;
        } else {
            this.unextendedHeight = height * this.SPACE_SIZE;
            this.minX = 0;
            this.maxX = width * this.SPACE_SIZE;
            this.minY = 0;
            return super.getViewBox();
        }
    }

    public isPlayerDropping(): boolean {
        return this.isInteractive() && this.isDroppingGroup;
    }

    private getRotated(coord: Coord, center: Coord, rotationInRadius: number): Coord {
        let x: number = center.x;
        x += Math.cos(rotationInRadius) * (coord.x - center.x);
        x += Math.sin(rotationInRadius) * (coord.y - center.y);
        let y: number = center.y;
        y -= Math.sin(rotationInRadius) * (coord.x - center.x);
        y += Math.cos(rotationInRadius) * (coord.y - center.y);
        return new Coord(x, y);
    }

    private updateMissingPieces(): void {
        const config: QuebecCastlesConfig = this.getConfig().get();
        const nbDefender: number = this.constructedState.countPieceOnBoard(Player.ZERO);
        const nbInvader: number = this.constructedState.countPieceOnBoard(Player.ONE);
        this.missingPieces = PlayerNumberMap.of(
            config.defenders - nbDefender,
            config.invaders - nbInvader,
        );
        this.isDroppingGroup = this.rules.isDropPhase(this.constructedState, config);
    }

    public async onClick(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + coord.x + '-' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const config: QuebecCastlesConfig = this.getConfig().get();
        if (this.isPlayerDropping() && this.getNumberOfAwaitedDrop() === 0) {
            if (this.dropped.contains(coord)) {
                return this.onDrop(coord, config);
            } else {
                return MGPValidation.SUCCESS;
            }
        }
        if (this.rules.isDropPhase(this.constructedState, config)) {
            return this.onDrop(coord, config);
        } else {
            return this.onMove(coord);
        }
    }

    private async onDrop(coord: Coord, config: QuebecCastlesConfig): Promise<MGPValidation> {
        Utils.assert(config.dropMode !== 'AUTO' || config.playersPlaceCastle, 'enterred "onDrop" on a non-dropping-config');
        const expectedDropThisTurn: number =
            this.rules.getExpectedDropsThisTurn(this.getState(), this.getConfig().get());
        if (expectedDropThisTurn === 1) {
            const chosenMove: QuebecCastlesDrop = QuebecCastlesDrop.of([coord]);
            return await this.chooseMove(chosenMove);
        } else {
            const currentPlayer: Player = this.constructedState.getCurrentPlayer();
            if (this.dropped.contains(coord)) {
                this.constructedState = this.constructedState.setPieceAt(coord, PlayerOrNone.NONE);
                this.dropped = this.dropped.removeElement(coord);
            } else {
                if (0 < this.getNumberOfAwaitedDrop()) {
                    const dropValidity: boolean = this.rules.isValidDrop(this.getState(), coord, currentPlayer, config);
                    if (dropValidity) {
                        this.constructedState = this.constructedState.setPieceAt(coord, currentPlayer);
                        this.dropped = this.dropped.addElement(coord);
                    }
                }
            }
            return MGPValidation.SUCCESS;
        }
    }

    public isPlayerCastle(player: Player, coord: Coord): boolean {
        const castle: MGPOptional<Coord> = this.getState().castles.get(player);
        return castle.equalsValue(coord);
    }

    private async onMove(coord: Coord): Promise<MGPValidation> {
        const state: QuebecCastlesState = this.constructedState;
        if (this.selected.isPresent()) {
            const currentPlayer: Player = state.getCurrentPlayer();
            if (this.selected.equalsValue(coord)) {
                return this.cancelMove();
            } else if (state.getPieceAt(coord).equals(currentPlayer)) {
                this.cancelMoveAttempt();
                this.selectedCoord(coord);
                return MGPValidation.SUCCESS;
            } else {
                return this.chooseMove(QuebecCastlesTranslation.of(this.selected.get(), coord));
            }
        } else {
            const opponent: Player = state.getCurrentOpponent();
            const clickedPiece: PlayerOrNone = state.getPieceAt(coord);
            if (clickedPiece === opponent) {
                return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
            } else if (clickedPiece === PlayerOrNone.NONE) {
                return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
            } else {
                this.selectedCoord(coord);
                return MGPValidation.SUCCESS;
            }
        }
    }

    private selectedCoord(coord: Coord): void {
        this.selected = MGPOptional.of(coord);
        const possibleLanding: Coord[] = this.rules
            .getPossibleMovesFor(coord, this.getState())
            .map((move: QuebecCastlesTranslation) => move.getEnd());
        this.possibleLanding = new Set(possibleLanding);
    }

    public async validateGroupDrop(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#drop-validator');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const move: QuebecCastlesDrop = QuebecCastlesDrop.of(this.dropped.toList());
        return this.chooseMove(move);
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: QuebecCastlesState = this.getState();
        this.constructedState = state;
        this.board = state.getCopiedBoard();
        this.updateMissingPieces();
    }

    public override async showLastMove(move: QuebecCastlesMove): Promise<void> {
        if (move instanceof QuebecCastlesTranslation) {
            this.leftSquare = MGPOptional.of(move.getStart());
            this.landingSquare = MGPOptional.of(move.getEnd());
            this.isCaptured = this.getPreviousState().getPieceAt(move.getEnd()).isPlayer();
        } else {
            this.lastDropped = move.coords.toList();
            this.isCaptured = false;
        }
    }

    public override hideLastMove(): void {
        this.leftSquare = MGPOptional.empty();
        this.landingSquare = MGPOptional.empty();
        this.lastDropped = [];
        this.isCaptured = false;
    }

    public override cancelMoveAttempt(): void {
        this.dropped = new Set();
        this.possibleLanding = new Set();
        this.selected = MGPOptional.empty();
    }

    public getSquareClasses(coord: Coord): string[] {
        const classes: string[] = [];
        const config: QuebecCastlesConfig = this.getConfig().get();
        if (this.rules.isDropPhase(this.constructedState, config)) {
            if (this.rules.isDropInPlayerTerritory(coord, Player.ZERO, config)) {
                classes.push(Player.ZERO.getHTMLClass('-fill'), 'territory-opacity');
            } else if (this.rules.isDropInPlayerTerritory(coord, Player.ONE, config)) {
                classes.push(Player.ONE.getHTMLClass('-fill'), 'territory-opacity');
            }
        } else {
            if (this.leftSquare.equalsValue(coord) ||
                this.lastDropped.some((c: Coord) => coord.equals(c)))
            {
                classes.push('moved-fill');
            }
            if (this.landingSquare.equalsValue(coord)) {
                if (this.isCaptured) {
                    classes.push('captured-fill');
                } else {
                    classes.push('moved-fill');
                }
            }
        }
        return classes;
    }

    public getPieceClasses(coord: Coord): string[] {
        const classes: string[] = [
            this.getPlayerClass(this.constructedState.getPieceAt(coord)),
        ];
        const config: QuebecCastlesConfig = this.getConfig().get();
        if (this.selected.equalsValue(coord) || this.dropped.contains(coord)) {
            classes.push('selected-stroke');
        }
        if (this.rules.isDropPhase(this.constructedState, config)) {
            if (this.leftSquare.equalsValue(coord) ||
                this.lastDropped.some((c: Coord) => coord.equals(c)))
            {
                classes.push('moved-stroke');
            }
        }
        return classes;
    }

    public getBoardTransform(): string {
        const state: QuebecCastlesState = this.constructedState;
        const cx: number = (state.getWidth() / 2) * this.SPACE_SIZE;
        const cy: number = (state.getHeight() / 2) * this.SPACE_SIZE;
        let angle: number = this.getPointOfView().getValue() * 180;
        if (this.getConfig().get().isRhombic) {
            angle += 45;
        }
        return `rotate(${ angle }, ${ cx }, ${ cy })`;
    }

    public getGroupDropValidationButtonClasses(): string[] {
        return ['capturable-fill'];
    }

    private getTotalPieceToDrop(): number {
        const player: Player = this.constructedState.getCurrentPlayer();
        if (player === Player.ZERO) {
            return this.getConfig().get().defenders;
        } else {
            return this.getConfig().get().invaders;
        }
    }

    public getNumberOfAwaitedDrop(): number {
        const player: Player = this.constructedState.getCurrentPlayer();
        const totalPieceToDrop: number = this.getTotalPieceToDrop();
        return totalPieceToDrop - this.constructedState.countPieceOnBoard(player);
    }

    public getRemainingCx(i: number): number {
        const remainingPieceToDrop: number = this.getNumberOfAwaitedDrop();
        const availableSpace: number = (this.maxX - this.minX);
        if (remainingPieceToDrop === 1) {
            return this.minX + (availableSpace / 2);
        } else {
            const interSpace: number = (availableSpace - this.SPACE_SIZE) / (remainingPieceToDrop - 1);
            return this.minX + (this.SPACE_SIZE / 2) + (i * interSpace);
        }
    }

    public getRemaininPieceClasses(): string[] {
        return [
            this.constructedState.getCurrentPlayer().getHTMLClass('-fill'),
        ];
    }

    public getGroupValidatorTransform(): string {
        let x: number;
        let y: number;
        const halfRadius: number = this.SPACE_SIZE / 2;
        if (this.getConfig().get().isRhombic) {
            if (this.getCurrentPlayer() === Player.ZERO) {
                x = this.lowerCorner.x;
                y = this.lowerCorner.y + halfRadius;
            } else {
                x = this.upperCorner.x;
                y = this.upperCorner.y - halfRadius;
            }
        } else {
            x = this.getState().getWidth() * 0.5 * this.SPACE_SIZE;
            if (this.getCurrentPlayer() === Player.ZERO) {
                y = -halfRadius;
            } else {
                y = (this.getState().getHeight() + 0.5) * this.SPACE_SIZE;
            }
        }
        return 'translate(' + x + ', ' + y + ')';
    }

    public getRemainingCy(): number {
        if (this.getCurrentPlayer() === Player.ZERO) {
            return this.unextendedHeight + (this.SPACE_SIZE * 0.5);
        } else {
            return this.minY - (this.SPACE_SIZE * 0.5);
        }
    }

}

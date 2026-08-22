import { NgClass } from '@angular/common';
import { Component, computed, signal, Signal, WritableSignal } from '@angular/core';

import { ArrayUtils, MGPOptional, MGPValidation } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { GameComponent } from '../../components/game-components/game-component/GameComponent';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerMap } from '../../jscaip/PlayerMap';

import { ApagosFailure } from './ApagosFailure';
import { ApagosFullBoardHeuristic } from './ApagosFullBoardHeuristic';
import { ApagosMove } from './ApagosMove';
import { ApagosMoveGenerator } from './ApagosMoveGenerator';
import { ApagosRightmostHeuristic } from './ApagosRightmostHeuristic';
import { ApagosConfig, ApagosRules } from './ApagosRules';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';

interface PieceInfo {
    transform: string;
    classes: string[];
}

interface SquareInfo {
    square: ApagosSquare;
    blockTransform: string;
    canDisplayArrow: PlayerMap<boolean>;
    arrowClasses: PlayerMap<string[]>;
    classes: string[];
    pieceInfos: PieceInfo[];
}

interface PieceLocation {

    square: number;

    piece: number;
}

interface DropArrow {

    x: number;

    player: Player;
}

@Component({
    selector: 'app-apagos',
    templateUrl: './apagos.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class ApagosComponent extends GameComponent<ApagosRules, ApagosMove, ApagosState, ApagosConfig> {

    protected readonly svgTransformZero: string = this.getSVGTranslation(this.SPACE_SIZE / 2, - this.SPACE_SIZE / 2);

    protected readonly svgTransformOne: string = this.getSVGTranslation(0, - this.SPACE_SIZE / 2);

    private readonly apagosState: WritableSignal<ApagosState> = signal(this.getState());
    private readonly board: Signal<ReadonlyArray<ApagosSquare>> = computed(() => this.apagosState().board);
    private readonly width: Signal<number> = computed(() => this.board().length);
    private readonly remaining: Signal<PlayerMap<number>> = computed(() => {
        return this.apagosState().remaining;
    });

    protected readonly ARROW_COORD: string = ApagosComponent.getArrowCoord();

    protected readonly pieceRadius: Signal<number> = computed(() => {
        const nPieces: number = this.apagosState().getMaxPiecesPerPlayer();
        return ((this.width() - 1) * this.SPACE_SIZE) / (nPieces + 1);
    });

    protected readonly boardWidth: Signal<number> = computed(() => this.width() * this.SPACE_SIZE);

    protected readonly boardHeight: Signal<number> = computed(() => (this.width() + 0.5) * this.SPACE_SIZE);

    private readonly lastMoveSquares: WritableSignal<number[]> = signal([]);

    private readonly lastMoveDrop: WritableSignal<MGPOptional<PieceLocation>> = signal(MGPOptional.empty());

    private readonly selectedPiece: WritableSignal<MGPOptional<PieceLocation>> = signal(MGPOptional.empty());

    private readonly leftPiece: WritableSignal<MGPOptional<PieceLocation>> = signal(MGPOptional.empty());

    private readonly displayableArrow: WritableSignal<DropArrow[]> = signal([]);

    protected readonly viewInfos: Signal<ReadonlyArray<SquareInfo>> = computed(() => {
        return this.board().map((square: ApagosSquare, index: number) => {
            return {
                square,
                blockTransform: this.getBlockTransform(index),
                canDisplayArrow: PlayerMap.ofValues(
                    this.canDisplayArrow(index, Player.ZERO),
                    this.canDisplayArrow(index, Player.ONE),
                ),
                arrowClasses: PlayerMap.ofValues(
                    this.getArrowClasses(Player.ZERO),
                    this.getArrowClasses(Player.ONE),
                ),
                pieceInfos: ArrayUtils.range(square.count(PlayerOrNone.NONE)).map((i: number) => {
                    return {
                        transform: this.getCircleTransform(i, square),
                        classes: this.getPieceClasses(index, i, square),
                    };
                }),
                classes: this.getSquareClasses(index),

            };
        });
    });

    protected readonly remainingPieceZeroCxList: Signal<ReadonlyArray<number>> = computed(() => {
        return ArrayUtils.range(this.remaining().get(Player.ZERO)).map((x: number) => {
            return this.boardWidth() - this.getRemainingPieceCx(x);
        });
    });

    protected readonly remainingPieceOneCxList: Signal<ReadonlyArray<number>> = computed(() => {
        return ArrayUtils.range(this.remaining().get(Player.ONE)).map((x: number) => {
            return this.boardWidth() - this.getRemainingPieceCx(x);
        });
    });

    private static getArrowCoord(): string {
        // Coordinates calculated to match with a SPACE_SIZE = 100
        const upLeft: string = 12.5 + ',' + 0;
        const upRight: string = 37.5 + ',' + 0;
        const middleMiddleRight: string = 37.5 + ',' + 25;
        const middleExtremeRight: string = 50 + ',' + 25;
        const lowCenter: string = 25 + ',' + 50;
        const middleExtremeLeft: string = 0 + ',' + 25;
        const middleMiddleLeft: string = 12.5 + ',' + 25;
        return upLeft + ' ' + upRight + ' ' + middleMiddleRight + ' ' + middleExtremeRight + ' ' +
               lowCenter + ' ' + middleExtremeLeft + ' ' + middleMiddleLeft;
    }

    public constructor() {
        super();
        this.setRulesAndNode('Apagos');
        this.aiConfig = {
            minimax: [
                {
                    id: 'Rightmost Focus',
                    name: $localize`Rightmost Focus`,
                    heuristic: (): ApagosRightmostHeuristic => new ApagosRightmostHeuristic(),
                    moveGenerator: (): ApagosMoveGenerator => new ApagosMoveGenerator(),
                },
                {
                    id: 'Full Board',
                    name: $localize`Full Board`,
                    heuristic: (): ApagosFullBoardHeuristic => new ApagosFullBoardHeuristic(),
                    moveGenerator: (): ApagosMoveGenerator => new ApagosMoveGenerator(),
                },
            ],
            mcts: [{
                id: 'default',
                name: $localize`Default`,
                moveGenerator: (): ApagosMoveGenerator => new ApagosMoveGenerator(),
            }],
        };
        this.encoder = ApagosMove.encoder;
        this.hasAsymmetricBoard = true;
    }

    protected override computeViewBox(): ViewBox {
        return new ViewBox(0, 0, this.boardWidth(), this.boardHeight()).expandAll(this.STROKE_WIDTH / 2);
    }

    public override cancelMoveAttempt(): void {
        this.selectedPiece.set(MGPOptional.empty());
        this.showPossibleDrops();
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.apagosState.set(this.getState());
        this.showPossibleDrops();
    }

    public override hideLastMove(): void {
        this.lastMoveSquares.set([]);
        this.lastMoveDrop.set(MGPOptional.empty());
        this.leftPiece.set(MGPOptional.empty());
    }

    public override async showLastMove(move: ApagosMove): Promise<void> {
        if (move.isDrop()) {
            this.showLastDrop(move);
        } else {
            this.showLastTransfer(move);
        }
    }

    private showLastDrop(lastMove: ApagosMove): void {
        const width: number = this.getConfig().width;
        const piece: Player = lastMove.piece.get();
        let higherIndex: number = lastMove.landing;
        const lastMoveSquares: number[] = [higherIndex];
        if (lastMove.landing !== width - 1) {
            higherIndex += 1;
            lastMoveSquares.push(higherIndex);
        }
        this.lastMoveSquares.set(lastMoveSquares);
        const climbingSquare: ApagosSquare = this.board[higherIndex];
        const landingIndex: number = this.getLowestPlayerPiece(climbingSquare, piece);
        this.lastMoveDrop.set(MGPOptional.of({
            square: higherIndex,
            piece: landingIndex,
        }));
    }

    private getLowestPlayerPiece(square: ApagosSquare, player: Player): number {
        const nbPiecePlayer: number = square.count(player);
        if (player === Player.ZERO) {
            return nbPiecePlayer - 1;
        } else {
            const totalPieces: number = square.count(PlayerOrNone.NONE);
            return totalPieces - nbPiecePlayer;
        }
    }

    private showLastTransfer(lastMove: ApagosMove): void {
        const previousState: ApagosState = this.getPreviousState();
        const previousPlayer: Player = previousState.getCurrentPlayer();
        const leftSquare: number = lastMove.starting.get();
        const previousSquare: ApagosSquare = previousState.board[leftSquare];
        const leftPieceIndex: number = this.getLowestPlayerPiece(previousSquare, previousPlayer);
        this.leftPiece.set(MGPOptional.of({
            square: leftSquare,
            piece: leftPieceIndex,
        }));

        const landingCoord: number = lastMove.landing;
        const landedSquare: ApagosSquare = this.board[landingCoord];
        const landedPieceIndex: number = this.getLowestPlayerPiece(landedSquare, previousPlayer);
        this.lastMoveDrop.set(MGPOptional.of({
            square: landingCoord,
            piece: landedPieceIndex,
        }));
    }

    private showPossibleDrops(): void {
        const displayableArrow: DropArrow[] = [];
        const state: ApagosState = this.getState();
        for (let x: number = 0; x < state.board.length; x++) {
            if (state.board[x].isFull() === false) {
                if (state.remaining.get(Player.ZERO) > 0) {
                    displayableArrow.push({ x, player: Player.ZERO });
                }
                if (state.remaining.get(Player.ONE) > 0) {
                    displayableArrow.push({ x, player: Player.ONE });
                }
            }
        }
        this.displayableArrow.set(displayableArrow);
    }

    private getCircleTransform(i: number, square: ApagosSquare): string {
        const x: number = this.SPACE_SIZE / 2;
        const y: number = this.SPACE_SIZE / 2;
        if (square.count(PlayerOrNone.NONE) === 1) {
            return this.getSVGTranslation(x, y);
        }
        const nbCircle: number = square.count(PlayerOrNone.NONE);
        const angle: number = (i * 2 * Math.PI / nbCircle) - (Math.PI / 2);
        const radius: number = this.SPACE_SIZE * 0.30;
        const deltaX: number = radius * Math.cos(angle);
        const deltaY: number = radius * Math.sin(angle);
        return this.getSVGTranslation(x + deltaX, y + deltaY);
    }

    private canDisplayArrow(x: number, player: Player): boolean {
        return this.displayableArrow().some((a: DropArrow) => a.x === x && a.player.equals(player));
    }

    private getArrowClasses(player: Player): string[] {
        const classes: string[] = [this.getPlayerClass(player)];
        return classes;
    }

    private getBlockTransform(x: number): string {
        const yOffset: number = ((this.board.length - 1 - x) * this.SPACE_SIZE) + (0.5 * this.SPACE_SIZE);
        const xOffset: number = x * this.SPACE_SIZE;
        return this.getSVGTranslation(xOffset, yOffset);
    }

    private getSquareClasses(x: number): string[] {
        const classes: string[] = ['base'];
        if (this.selectedPiece().isPresent() && this.selectedPiece().get().square === x) {
            classes.push('selected-stroke');
        } else if (this.lastMoveSquares().includes(x)) {
            classes.push('last-move-stroke');
        }
        return classes;
    }

    @ClickHandler((x: number, player: Player) => `#drop-arrow-${ player === Player.ZERO ? 'zero' : 'one' }-${ x }`)
    protected async onArrowClick(x: number, player: Player): Promise<MGPValidation> {
        if (this.selectedPiece().isPresent()) {
            const square: number = this.selectedPiece().get().square;
            const move: ApagosMove = ApagosMove.transfer(square, x).get();
            return this.chooseMove(move);
        } else {
            const move: ApagosMove = ApagosMove.drop(x, player);
            return this.chooseMove(move);
        }
    }

    private getPieceClasses(x: number, i: number, square: ApagosSquare): string[] {
        const pieceLocation: PieceLocation = { square: x, piece: i };
        const classes: string[] = [];
        let zero: number = square.count(Player.ZERO);
        let one: number = square.count(Player.ONE);
        if (this.selectedPiece().equalsValue(pieceLocation)) {
            classes.push('selected-stroke');
        } else if (this.lastMoveDrop().equalsValue(pieceLocation)) {
            classes.push('last-move-stroke');
        } else if (this.leftPiece().isPresent() && this.leftPiece().get().square === x) {
            if (this.leftPiece().get().piece === i) {
                classes.push('captured-stroke');
                return classes;
            } else {
                const opponent: Player = this.getState().getCurrentOpponent();
                if (opponent === Player.ZERO) zero++;
                else one++;
            }
        }
        const neutral: number = square.count(PlayerOrNone.NONE) - (one + zero);
        const pieceColor: string = this.getPieceColor(i, zero, neutral);
        if (pieceColor !== '') {
            classes.push(pieceColor);
        }
        return classes;
    }

    private getPieceColor(i: number, zero: number, neutral: number): string {
        if (i < zero) {
            return 'player0-fill';
        } else if (i < (zero + neutral)) {
            return '';
        } else {
            return 'player1-fill';
        }

    }

    @ClickHandler((x: number) => `#square-${ x }`)
    protected async onSquareClick(x: number): Promise<MGPValidation> {
        if (this.selectedPiece().isPresent() && this.selectedPiece().get().square === x) {
            return this.cancelMove();
        }
        const currentPlayer: Player = this.getState().getCurrentPlayer();
        const square: ApagosSquare = this.board[x];
        const nbPiecePresent: number = square.count(currentPlayer);
        if (nbPiecePresent <= 0) {
            return this.cancelMove(ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE());
        }
        this.selectedPiece.set(MGPOptional.of({
            square: x,
            piece: this.getLowestPlayerPiece(square, currentPlayer),
        }));
        if (this.showAndGetPossibleTranfers().length === 0) {
            return this.cancelMove(ApagosFailure.NO_POSSIBLE_TRANSFER_REMAINS());
        }
        return MGPValidation.SUCCESS;
    }

    private showAndGetPossibleTranfers(): DropArrow[] {
        const displayableArrow: DropArrow[] = [];
        let landingX: number = this.selectedPiece().get().square - 1;
        const currentPlayer: Player = this.getState().getCurrentPlayer();
        while (0 <= landingX) {
            if (this.board[landingX].isFull() === false) {
                displayableArrow.push({
                    x: landingX,
                    player: currentPlayer,
                });
            }
            landingX--;
        }
        this.displayableArrow.set(displayableArrow);
        return this.displayableArrow();
    }

    private getRemainingPieceCx(x: number): number {
        return (1 + x) * this.pieceRadius();
    }

}

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { Coord } from '@everyboard/games';
import { Line } from '@everyboard/games';
import { Player } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';
import { RulesFailure } from '@everyboard/games';
import { DiaballikDistanceHeuristic } from '@everyboard/games/diaballik';
import { DiaballikFailure } from '@everyboard/games/diaballik';
import { DiaballikFilteredMoveGenerator } from '@everyboard/games/diaballik';
import { DiaballikMove, DiaballikBallPass, DiaballikSubMove, DiaballikTranslation } from '@everyboard/games/diaballik';
import { DiaballikMoveGenerator } from '@everyboard/games/diaballik';
import { DefeatCoords, DiaballikRules, VictoryCoord, VictoryOrDefeatCoords } from '@everyboard/games/diaballik';
import { DiaballikPiece, DiaballikState } from '@everyboard/games/diaballik';
import { MGPFallible, MGPOptional, MGPValidation, Set, Utils } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-diaballik',
    templateUrl: './diaballik.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})

export class DiaballikComponent extends RectangularGameComponent<DiaballikRules,
                                                                 DiaballikMove,
                                                                 DiaballikState,
                                                                 DiaballikPiece,
                                                                 EmptyRulesConfig,
                                                                 DiaballikState>
{

    public stateInConstruction: DiaballikState;

    public WIDTH: number;
    public HEIGHT: number;
    protected readonly INDICATOR_SIZE: number = 20;

    private readonly victoryCoord: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());
    private readonly loserCoords: WritableSignal<Set<Coord>> = signal(new Set());
    protected readonly blockedLines: WritableSignal<ReadonlyArray<Line>> = signal([]);

    protected readonly indicators: WritableSignal<Set<Coord>> = signal(new Set());

    private readonly currentSelection: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());
    protected readonly hasMadePass: WritableSignal<boolean> = signal(false);
    protected readonly translationsMade: WritableSignal<number> = signal(0);
    private readonly subMoves: WritableSignal<ReadonlyArray<DiaballikSubMove>> = signal([]);

    private readonly lastMovedBalls: WritableSignal<Set<Coord>> = signal(new Set());
    private readonly lastMovedPieces: WritableSignal<Set<Coord>> = signal(new Set());
    private readonly currentlyMovedBalls: WritableSignal<Set<Coord>> = signal(new Set());
    private readonly currentlyMovedPieces: WritableSignal<Set<Coord>> = signal(new Set());

    private readonly moveGenerator: DiaballikMoveGenerator = new DiaballikMoveGenerator(false);

    public constructor() {
        super('Diaballik');
        this.hasAsymmetricBoard = true;
        this.encoder = DiaballikMove.encoder;
        this.aiConfig = {
            minimax: [
                {
                    id: 'AllMoves',
                    name: $localize`AllMoves`,
                    heuristic: (): DiaballikDistanceHeuristic => new DiaballikDistanceHeuristic(),
                    moveGenerator: (): DiaballikMoveGenerator => new DiaballikMoveGenerator(true),
                },
                {
                    id: 'Distance (1)',
                    name: $localize`Distance (1)`,
                    heuristic: (): DiaballikDistanceHeuristic => new DiaballikDistanceHeuristic(),
                    moveGenerator: (): DiaballikFilteredMoveGenerator => new DiaballikFilteredMoveGenerator(1),
                },
                {
                    id: 'Distance (2)',
                    name: $localize`Distance (2)`,
                    heuristic: (): DiaballikDistanceHeuristic => new DiaballikDistanceHeuristic(),
                    moveGenerator: (): DiaballikFilteredMoveGenerator => new DiaballikFilteredMoveGenerator(2),
                },
                {
                    id: 'Distance (3)',
                    name: $localize`Distance (3)`,
                    heuristic: (): DiaballikDistanceHeuristic => new DiaballikDistanceHeuristic(),
                    moveGenerator: (): DiaballikFilteredMoveGenerator => new DiaballikFilteredMoveGenerator(3),
                },
            ],
            mcts: [
                {
                    id: 'default',
                    name: $localize`MCTS`,
                    moveGenerator: (): DiaballikMoveGenerator => this.moveGenerator,
                },
                {
                    id: '3-only',
                    name: $localize`MCTS (3 only)`,
                    moveGenerator: (): DiaballikFilteredMoveGenerator => new DiaballikFilteredMoveGenerator(3, false),
                },
                {
                    id: 'without-dups',
                    name: $localize`MCTS (without dups)`,
                    moveGenerator: (): DiaballikMoveGenerator => new DiaballikMoveGenerator(true),
                },
                {
                    id: '3-no-dups',
                    name: $localize`MCTS (3, no dups)`,
                    moveGenerator: (): DiaballikFilteredMoveGenerator => new DiaballikFilteredMoveGenerator(3, false),
                },
            ],
        };
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: DiaballikState = this.node().gameState;
        this.board = state.board; // Needed by RectangularGameComponent
        this.stateInConstruction = state;
        const possibleVictory: MGPOptional<VictoryOrDefeatCoords> = this.rules.getVictoryOrDefeatCoords(state);
        this.victoryCoord.set(MGPOptional.empty());
        const blockedLines: Line[] = [];
        this.loserCoords.set(new Set());
        if (possibleVictory.isPresent()) {
            const victory: VictoryOrDefeatCoords = possibleVictory.get();
            if (victory instanceof VictoryCoord) {
                this.victoryCoord.set(MGPOptional.of(victory.coord));
            } else if (victory instanceof DefeatCoords) {
                this.loserCoords.set(new Set(victory.allLoserPieces));
                // If Player.ZERO won, the line will be placed in front of their piece directly.
                // If Player.ONE won, we need to shift them by one space size so that they appear in front of the piece
                const shift: number = victory.winner === Player.ZERO ? 0 : this.SPACE_SIZE;
                for (const blockedPiece of victory.opponentPiecesInContact) {
                    const x: number = blockedPiece.x * this.SPACE_SIZE;
                    const y: number = blockedPiece.y * this.SPACE_SIZE + shift;
                    const line: Line = new Line(x, y, x + this.SPACE_SIZE, y);
                    blockedLines.push(line);
                }
            }
        }
        this.blockedLines.set(blockedLines);
    }

    protected override async showLastMove(move: DiaballikMove): Promise<void> {
        let lastMovedPieces: Set<Coord> = this.lastMovedPieces();
        let lastMovedBalls: Set<Coord> = this.lastMovedBalls();
        for (const subMove of move.getSubMoves()) {
            if (subMove instanceof DiaballikTranslation) {
                lastMovedPieces = lastMovedPieces
                    .addElement(subMove.getStart())
                    .addElement(subMove.getEnd());
            } else {
                Utils.assert(subMove instanceof DiaballikBallPass, 'DiaballikMove can only be a translation or a pass');
                lastMovedBalls = lastMovedBalls
                    .addElement(subMove.getStart())
                    .addElement(subMove.getEnd());
            }
        }
        this.lastMovedPieces.set(lastMovedPieces);
        this.lastMovedBalls.set(lastMovedBalls);
    }

    private showSubMove(subMove: DiaballikSubMove): void {
        if (subMove instanceof DiaballikTranslation) {
            this.currentlyMovedPieces.set(
                this.currentlyMovedPieces()
                    .addElement(subMove.getStart())
                    .addElement(subMove.getEnd()),
            );
        } else {
            Utils.assert(subMove instanceof DiaballikBallPass, 'DiaballikMove can only be a translation or a pass');
            this.currentlyMovedBalls.set(
                this.currentlyMovedBalls()
                    .addElement(subMove.getStart())
                    .addElement(subMove.getEnd()),
            );
        }
    }

    public override hideLastMove(): void {
        this.lastMovedPieces.set(new Set());
        this.lastMovedBalls.set(new Set());
    }

    public override cancelMoveAttempt(): void {
        this.stateInConstruction = this.state();
        this.currentSelection.set(MGPOptional.empty());
        this.hasMadePass.set(false);
        this.translationsMade.set(0);
        this.subMoves.set([]);
        this.indicators.set(new Set());
        this.currentlyMovedBalls.set(new Set());
        this.currentlyMovedPieces.set(new Set());
    }

    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [];
        const moved: Set<Coord> = this.lastMovedBalls()
            .union(this.lastMovedPieces())
            .union(this.currentlyMovedBalls())
            .union(this.currentlyMovedPieces());
        if (moved.contains(coord)) {
            classes.push('moved-fill');
        }
        return classes;
    }

    public getPieceClasses(x: number, y: number, piece: DiaballikPiece): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(piece.owner)];
        if (this.isPieceMoved(coord)) {
            classes.push('last-move-stroke');
        }
        if (piece.holdsBall === false && this.currentSelection().equalsValue(new Coord(x, y))) {
            classes.push('selected-stroke');
        }
        if (this.victoryCoord().equalsValue(coord)) {
            classes.push('victory-stroke');
        }
        if (this.loserCoords().contains(coord)) {
            classes.push('defeat-stroke');
        }
        return classes;
    }

    private isPieceMoved(coord: Coord): boolean {
        return this
            .lastMovedPieces()
            .union(this.currentlyMovedPieces())
            .contains(coord);
    }

    public getBallClasses(x: number, y: number, piece: DiaballikPiece): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(piece.owner)];
        if (this.isBallMoved(coord)) {
            classes.push('last-move-stroke');
        }
        if (this.currentSelection().equalsValue(new Coord(x, y))) {
            classes.push('selected-stroke');
        }
        return classes;
    }

    private isBallMoved(coord: Coord): boolean {
        return this
            .lastMovedBalls()
            .union(this.currentlyMovedBalls())
            .contains(coord);
    }

    private async addSubMove(subMove: DiaballikSubMove, stateAfterSubMove: DiaballikState): Promise<MGPValidation> {
        this.currentSelection.set(MGPOptional.empty());
        this.indicators.set(new Set());
        this.subMoves.set([
            ...this.subMoves(),
            subMove,
        ]);
        this.stateInConstruction = stateAfterSubMove;
        if (this.subMoves().length === 3) {
            const move: DiaballikMove = new DiaballikMove(
                this.subMoves()[0],
                MGPOptional.of(this.subMoves()[1]),
                MGPOptional.of(this.subMoves()[2]),
            );
            return this.chooseMove(move);
        } else {
            this.showSubMove(subMove);
            return MGPValidation.SUCCESS;
        }
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        if (this.currentSelection().isPresent()) {
            return this.onSecondClick(clickedCoord);
        } else {
            // No piece selected, select this one if it is a player piece
            return this.onFirstClick(clickedCoord);
        }
    }

    private async onFirstClick(clickedCoord: Coord): Promise<MGPValidation> {
        const clickedPiece: DiaballikPiece = this.stateInConstruction.getPieceAt(clickedCoord);
        if (clickedPiece.owner === this.getCurrentPlayer()) {
            if (this.hasMadePass() && clickedPiece.holdsBall) {
                // Only one pass is allowed, so we don't allow to select the piece holding the ball anymore
                return this.cancelMove(DiaballikFailure.CAN_ONLY_DO_ONE_PASS());
            } else if (this.translationsMade() === 2 && clickedPiece.holdsBall === false) {
                // At most two translations are allowed
                return this.cancelMove(DiaballikFailure.CAN_ONLY_TRANSLATE_TWICE());
            } else {
                this.currentSelection.set(MGPOptional.of(clickedCoord));
                if (clickedPiece.holdsBall) {
                    this.indicators.set(
                        this.moveGenerator.getPassEnds(this.stateInConstruction, clickedCoord),
                    );
                } else {
                    this.indicators.set(
                        this.moveGenerator.getTranslationEnds(this.stateInConstruction, clickedCoord),
                    );
                }
                return MGPValidation.SUCCESS;
            }
        } else if (clickedPiece.owner.isNone()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
    }

    private async onSecondClick(clickedCoord: Coord): Promise<MGPValidation> {
        const selection: Coord = this.currentSelection().get();
        if (selection.equals(clickedCoord)) {
            // Just deselects
            this.currentSelection.set(MGPOptional.empty());
            this.indicators.set(new Set());
            if (this.subMoves().length === 0) {
                // No sub moves constructed at all, cancel the move to show the last one
                return this.cancelMove();
            }
            return MGPValidation.SUCCESS;
        }
        if (this.stateInConstruction.getPieceAt(selection).holdsBall) {
            return this.performPass(selection, clickedCoord);
        } else {
            return this.performTranslation(selection, clickedCoord);
        }
    }

    private performPass(start: Coord, end: Coord): Promise<MGPValidation> {
        const pass: MGPFallible<DiaballikBallPass> = DiaballikBallPass.from(start, end);
        if (pass.isSuccess()) {
            const passLegality: MGPFallible<DiaballikState> =
                this.rules.isLegalPass(this.stateInConstruction, pass.get());
            if (passLegality.isSuccess()) {
                this.hasMadePass.set(true);
                return this.addSubMove(pass.get(), passLegality.get());
            } else {
                return this.cancelMove(passLegality.getReason());
            }
        } else {
            return this.cancelMove(pass.getReason());
        }
    }

    private performTranslation(start: Coord, end: Coord): Promise<MGPValidation> {
        const translation: MGPFallible<DiaballikTranslation> = DiaballikTranslation.from(start, end);
        if (translation.isSuccess()) {
            const translationLegality: MGPFallible<DiaballikState> =
                this.rules.isLegalTranslation(this.stateInConstruction, translation.get());
            if (translationLegality.isSuccess()) {
                this.translationsMade.update((oldValue: number) => oldValue + 1);
                return this.addSubMove(translation.get(), translationLegality.get());
            } else {
                return this.cancelMove(translationLegality.getReason());
            }
        } else {
            return this.cancelMove(translation.getReason());
        }
    }

    public showDoneButton(): boolean {
        return this.interactive() && this.subMoves().length >= 1;
    }

    @ClickHandler(() => `#done`)
    public async done(): Promise<MGPValidation> {
        let second: MGPOptional<DiaballikSubMove> = MGPOptional.empty();
        if (this.subMoves().length >= 2) {
            second = MGPOptional.of(this.subMoves()[1]);
        }
        // Note: user can't click on done if there are either no sub move (button doesn't appear)
        // or if there are three submoves (as the move would have been performed directly)

        const move: DiaballikMove = new DiaballikMove(this.subMoves()[0], second, MGPOptional.empty());
        return this.chooseMove(move);
    }

    public getBoardRotation(): string {
        const rotation: number = this.getPointOfView().getValue() * 180;
        const boardWidth: number = this.width() * this.SPACE_SIZE + this.STROKE_WIDTH;
        const boardHeight: number = this.height() * this.SPACE_SIZE + this.STROKE_WIDTH;
        const centerX: number = boardWidth / 2;
        const centerY: number = boardHeight / 2;
        return `rotate(${rotation} ${centerX} ${centerY})`;
    }

    protected override computeViewBox(): ViewBox {
        return super.computeViewBox().expand(0, 0, this.SPACE_SIZE, this.SPACE_SIZE);
    }

}

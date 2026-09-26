import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, Signal, WritableSignal } from '@angular/core';

import { MGPOptional, MGPValidation, Set } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { GameComponent } from '../../components/game-components/game-component/GameComponent';
import { ScoreName } from '../../components/game-components/game-component/ScoreName';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { RulesFailure } from '../../jscaip/RulesFailure';

import { PylosCoord } from './PylosCoord';
import { PylosFailure } from './PylosFailure';
import { PylosHeuristic } from './PylosHeuristic';
import { PylosMove, PylosMoveFailure } from './PylosMove';
import { PylosMoveGenerator } from './PylosMoveGenerator';
import { PylosRules } from './PylosRules';
import { PylosState } from './PylosState';

interface PylosSidePieceView {
    readonly id: string;
    readonly cx: number;
    readonly cy: number;
    readonly radius: number;
    readonly playerClass: string;
}

interface PylosRenderedSpace {
    readonly kind: 'piece' | 'landing';
    readonly coord: PylosCoord;
    readonly key: string;
    readonly cx: number;
    readonly cy: number;
    readonly radius: number;
    readonly classes: ReadonlyArray<string>;
}

interface PylosHighCaptureView {
    readonly id: string;
    readonly radius: number;
    readonly x: number;
    readonly y: number;
}

interface PylosCapturableView {
    readonly coord: PylosCoord;
    readonly id: string;
    readonly radius: number;
    readonly transform: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-pylos',
    templateUrl: './pylos.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class PylosComponent extends GameComponent<PylosRules, PylosMove, PylosState> {

    // 4*100 for each pieces at z=0 level + 2*4 for each direction there is stroke
    private readonly boardWidth: number = (4 * this.SPACE_SIZE) + this.STROKE_WIDTH;
    private readonly pieceRowHeight: number = this.SPACE_SIZE / 2;
    private readonly boardHeight: number = this.boardWidth + 2 * this.pieceRowHeight;

    protected readonly boardTranslation: string =
        this.getSVGTranslation(this.STROKE_WIDTH / 2, (this.STROKE_WIDTH / 2) + this.pieceRowHeight);
    protected readonly captureValidationTranslation: string = this.getTranslationAtXY(4, 4);
    private readonly writableBoardRotation: WritableSignal<string> = signal(this.getBoardRotation(Player.ZERO));
    protected readonly boardRotation: Signal<string> = this.writableBoardRotation.asReadonly();

    protected override computeViewBox(): ViewBox {
        return new ViewBox(0, 0, this.boardWidth, this.boardHeight);
    }

    private readonly constructedState: WritableSignal<PylosState> = signal(this.state());

    private readonly displayedLastMove: WritableSignal<MGPOptional<PylosMove>> = signal(MGPOptional.empty());

    private readonly capturables: WritableSignal<Set<PylosCoord>> = signal(new Set());

    private readonly chosenStartingCoord: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly chosenLandingCoord: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly chosenFirstCapture: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly chosenSecondCapture: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());

    private readonly captured: Signal<ReadonlyArray<PylosCoord>> = computed(() => {
        const displayedLastMove: MGPOptional<PylosMove> = this.displayedLastMove();
        if (displayedLastMove.isAbsent()) {
            return [];
        }
        const move: PylosMove = displayedLastMove.get();
        const captures: PylosCoord[] = [];
        if (move.firstCapture.isPresent()) {
            captures.push(move.firstCapture.get());
        }
        if (move.secondCapture.isPresent()) {
            captures.push(move.secondCapture.get());
        }
        return captures;
    });

    private readonly lastMoved: Signal<ReadonlyArray<PylosCoord>> = computed(() => {
        const displayedLastMove: MGPOptional<PylosMove> = this.displayedLastMove();
        if (displayedLastMove.isAbsent()) {
            return [];
        }
        const move: PylosMove = displayedLastMove.get();
        if (move.startingCoord.isPresent()) {
            return [move.landingCoord, move.startingCoord.get()];
        }
        return [move.landingCoord];
    });

    private readonly remainingPieces: WritableSignal<PlayerNumberMap> = signal(PlayerNumberMap.of(15, 15));

    protected readonly sidePieces: Signal<ReadonlyArray<PylosSidePieceView>> = computed(() => {
        const remainingPieces: PlayerNumberMap = this.remainingPieces();
        const pieces: PylosSidePieceView[] = [];
        for (const player of Player.PLAYERS) {
            const numberOfPieces: number = remainingPieces.get(player);
            for (let index: number = 0; index < numberOfPieces; index++) {
                pieces.push({
                    id: `piece-${ player.toString() }-${ index }`,
                    cx: (this.SPACE_SIZE / 4) +
                        ((this.boardWidth - (this.SPACE_SIZE / 4)) * (index / 15)),
                    cy: this.getPiecesCyForPlayer(player),
                    radius: (this.SPACE_SIZE / 4) - this.STROKE_WIDTH,
                    playerClass: this.getPlayerClass(player),
                });
            }
        }
        return pieces;
    });

    protected readonly spaces: Signal<ReadonlyArray<PylosRenderedSpace>> = computed(() => {
        const spaces: PylosRenderedSpace[] = [];
        for (let z: number = 0; z < 3; z++) {
            for (const y of PylosState.getLevelRange(z)) {
                for (const x of PylosState.getLevelRange(z)) {
                    const coord: PylosCoord = new PylosCoord(x, y, z);
                    if (this.mustDraw(coord) === false) {
                        continue;
                    }
                    if (this.isOccupied(coord)) {
                        spaces.push(this.createRenderedSpace(coord, 'piece', this.getPieceClasses(coord)));
                    } else if (this.mustDisplayLandingCoord(coord)) {
                        spaces.push(this.createRenderedSpace(coord, 'landing', this.getSquareClasses(coord)));
                    }
                }
            }
        }
        return spaces;
    });

    protected readonly highCaptureMarker: Signal<MGPOptional<PylosHighCaptureView>> = computed(() => {
        const displayedLastMove: MGPOptional<PylosMove> = this.displayedLastMove();
        if (displayedLastMove.isAbsent()) {
            return MGPOptional.empty();
        }
        const firstCapture: MGPOptional<PylosCoord> = displayedLastMove.get().firstCapture;
        if (firstCapture.isAbsent() || this.mustDrawCapturedCoord(firstCapture.get())) {
            return MGPOptional.empty();
        }
        const coord: PylosCoord = firstCapture.get();
        const radius: number = this.getPieceRadius(coord.z);
        return MGPOptional.of({
            id: `highCapture-${ coord.x }-${ coord.y }-${ coord.z }`,
            radius,
            x: this.getPieceCx(coord.x, coord.z) - radius,
            y: this.getPieceCy(coord.y, coord.z) - radius,
        });
    });

    protected readonly captureValidationVisible: Signal<boolean> =
        computed(() => this.chosenLandingCoord().isPresent());

    protected readonly captureValidationButtonClasses: Signal<string> = computed(() => {
        if (this.chosenFirstCapture().isPresent() || this.chosenSecondCapture().isPresent()) {
            return '';
        }
        return 'semi-transparent';
    });

    protected readonly capturableMarkers: Signal<ReadonlyArray<PylosCapturableView>> = computed(() =>
        this.capturables().toList().map((coord: PylosCoord): PylosCapturableView => {
            const radius: number = this.getPieceRadius(coord.z);
            return {
                coord,
                id: `capturable-${ coord.x }-${ coord.y }-${ coord.z }`,
                radius,
                transform: this.getSVGTranslation(this.getPieceCx(coord.x, coord.z),
                                                  this.getPieceCy(coord.y, coord.z)),
            };
        }),
    );

    public constructor() {
        super('Pylos');
        this.aiConfig = {
            minimax: [{
                id: 'Reserve',
                name: $localize`Reserve`,
                heuristic: (): PylosHeuristic => new PylosHeuristic(),
                moveGenerator: (): PylosMoveGenerator => new PylosMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): PylosMoveGenerator => new PylosMoveGenerator(),
            }],
        };
        this.encoder = PylosMove.encoder;
        this.hasAsymmetricBoard = true;
    }

    public override setPointOfView(pointOfView: Player): void {
        super.setPointOfView(pointOfView);
        this.writableBoardRotation.set(this.getBoardRotation(pointOfView));
    }

    private getBoardRotation(pointOfView: Player): string {
        return `rotate(${ pointOfView.getValue() * 180 } ${ this.boardWidth / 2 } ${ this.boardHeight / 2 })`;
    }

    private getPiecesCyForPlayer(player: Player): number {
        if (player === Player.ONE) {
            return this.pieceRowHeight / 2;
        } else {
            return this.boardWidth + ( 1.5 * this.pieceRowHeight);
        }
    }

    private mustDraw(coord: PylosCoord): boolean {
        if (this.constructedState().getPieceAt(coord).isPlayer()) {
            return true;
        }
        if (this.justClimbed(coord)) {
            return true;
        }
        if (this.isCaptured(coord)) {
            return true;
        }
        return this.chosenLandingCoord().isAbsent() && this.constructedState().isLandable(coord);
    }

    private isCaptured(coord: PylosCoord): boolean {
        return this.chosenFirstCapture().equalsValue(coord) ||
               this.chosenSecondCapture().equalsValue(coord);
    }

    @ClickHandler((x: number, y: number, z: number) => `#piece-${ x }-${ y }-${ z }`)
    protected async onPieceClick(x: number, y: number, z: number): Promise<MGPValidation> {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        const clickedPiece: PlayerOrNone = this.state().getPieceAt(coord);
        const pieceBelongToOpponent: boolean = clickedPiece === this.state().getCurrentOpponent();
        if (pieceBelongToOpponent) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (this.chosenStartingCoord().equalsValue(coord)) {
            return this.cancelMove();
        }
        if (this.chosenLandingCoord().isPresent()) {
            // Starting to select capture
            if (this.isSupporting(coord, this.constructedState())) {
                return this.cancelMove(PylosFailure.CANNOT_MOVE_SUPPORTING_PIECE());
            }
            return this.onCaptureClick(coord);
        } else {
            if (this.isSupporting(coord, this.state())) {
                return this.cancelMove(PylosFailure.CANNOT_MOVE_SUPPORTING_PIECE());
            }
            return this.onClimbClick(coord);
        }
    }

    private isSupporting(clickedCoord: PylosCoord, state: PylosState): boolean {
        return state.isSupporting(clickedCoord);
    }

    private async onClimbClick(clickedCoord: PylosCoord): Promise<MGPValidation> {
        // Starting to describe a climbing move
        this.chosenStartingCoord.set(MGPOptional.of(clickedCoord));
        this.constructedState.set(this.state().removePieceAt(clickedCoord));
        return MGPValidation.SUCCESS;
    }

    private async onCaptureClick(clickedCoord: PylosCoord): Promise<MGPValidation> {
        if (this.chosenFirstCapture().equalsValue(clickedCoord)) {
            this.chosenFirstCapture.set(MGPOptional.empty());
            this.constructedState.set(this.constructedState().dropCurrentPlayersPieceAt(clickedCoord));
            this.updateCapturableList();
            return MGPValidation.SUCCESS;
        }
        if (this.chosenSecondCapture().equalsValue(clickedCoord)) {
            this.chosenSecondCapture.set(MGPOptional.empty());
            this.constructedState.set(this.constructedState().dropCurrentPlayersPieceAt(clickedCoord));
            this.updateCapturableList();
            return MGPValidation.SUCCESS;
        }
        if (this.chosenFirstCapture().isAbsent()) { // First capture
            this.chosenFirstCapture.set(MGPOptional.of(clickedCoord));
            this.constructedState.set(this.constructedState().removePieceAt(clickedCoord));
            this.updateCapturableList();
            return MGPValidation.SUCCESS;
        }
        if (this.chosenSecondCapture().isAbsent()) { // Last capture
            this.chosenSecondCapture.set(MGPOptional.of(clickedCoord));
            this.constructedState.set(this.constructedState().removePieceAt(clickedCoord));
            this.updateCapturableList();
            return MGPValidation.SUCCESS;
        }
        return this.cancelMove(PylosMoveFailure.MUST_CAPTURE_MAXIMUM_TWO_PIECES());
    }

    private updateCapturableList(): void {
        this.capturables.set(this.constructedState().getFreeToMoves());
    }

    @ClickHandler(() => `#capture-validation`)
    protected async validateCapture(): Promise<MGPValidation> {
        if (this.chosenFirstCapture().isAbsent() && this.chosenSecondCapture().isAbsent()) {
            return MGPValidation.SUCCESS;
        }
        if (this.chosenFirstCapture().isPresent() && this.chosenSecondCapture().isAbsent()) {
            return this.concludeMoveWithCapture([this.chosenFirstCapture().get()]);
        }
        if (this.chosenFirstCapture().isAbsent() && this.chosenSecondCapture().isPresent()) {
            return this.concludeMoveWithCapture([this.chosenSecondCapture().get()]);
        }
        return this.concludeMoveWithCapture([this.chosenFirstCapture().get(), this.chosenSecondCapture().get()]);
    }

    private async concludeMoveWithCapture(captures: PylosCoord[]): Promise<MGPValidation> {
        if (this.chosenStartingCoord().isAbsent()) {
            const move: PylosMove = PylosMove.ofDrop(this.chosenLandingCoord().get(), captures);
            return this.chooseMove(move);
        } else {
            const move: PylosMove = PylosMove.ofClimb(this.chosenStartingCoord().get(),
                                                      this.chosenLandingCoord().get(),
                                                      captures);
            return this.chooseMove(move);
        }
    }

    public override cancelMoveAttempt(): void {
        this.constructedState.set(this.state());
        this.chosenStartingCoord.set(MGPOptional.empty());
        this.chosenLandingCoord.set(MGPOptional.empty());
        this.chosenFirstCapture.set(MGPOptional.empty());
        this.chosenSecondCapture.set(MGPOptional.empty());
        this.capturables.set(new Set());
    }

    @ClickHandler((x: number, y: number, z: number) => `#drop-${ x }-${ y }-${ z }`)
    protected async onDrop(x: number, y: number, z: number): Promise<MGPValidation> {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        if (PylosRules.canCapture(this.constructedState(), coord)) {
            this.chosenLandingCoord.set(MGPOptional.of(coord));
            this.constructedState.set(this.constructedState().dropCurrentPlayersPieceAt(coord));
            this.updateCapturableList();
            return MGPValidation.SUCCESS; // now player can click on their captures
        } else {
            this.chosenLandingCoord.set(MGPOptional.of(coord));
            return this.concludeMoveWithCapture([]);
        }
    }

    private getSquareClasses(coord: PylosCoord): string[] {
        if (this.captured().some((c: PylosCoord) => c.equals(coord))) {
            return ['captured-fill'];
        }
        if (this.lastMoved().some((c: PylosCoord) => c.equals(coord))) {
            return ['moved-fill'];
        }
        if (this.justClimbed(coord)) {
            return ['moved-fill'];
        }
        return [];
    }

    private justClimbed(coord: PylosCoord): boolean {
        return this.chosenLandingCoord().isPresent() &&
               this.chosenStartingCoord().equalsValue(coord);
    }

    private getPieceRadius(z: number): number {
        // 0.45 so that the radius take 90% of the place the square had
        // 0.05 so that it become 5% bigger at each level
        return this.SPACE_SIZE * (0.45 + (z * 0.025));
    }

    private getPieceCx(x: number, z: number): number {
        // Level one pieces must look like they are in between level zero pieces
        const levelOffset: number = z * 0.5 * this.SPACE_SIZE;
        const localPieceCenter: number = this.SPACE_SIZE / 2;
        return localPieceCenter + levelOffset + (x * this.SPACE_SIZE);
    }

    private getPieceCy(y: number, z: number): number {
        // Level one pieces must look like they are in between level zero pieces
        const levelOffset: number = z * 0.5 * this.SPACE_SIZE;
        const localPieceCenter: number = this.SPACE_SIZE / 2;
        return localPieceCenter + levelOffset + (y * this.SPACE_SIZE);
    }

    private createRenderedSpace(coord: PylosCoord,
                                kind: 'piece' | 'landing',
                                classes: ReadonlyArray<string>)
    : PylosRenderedSpace
    {
        return {
            kind,
            coord,
            key: `${ coord.x }-${ coord.y }-${ coord.z }`,
            cx: this.getPieceCx(coord.x, coord.z),
            cy: this.getPieceCy(coord.y, coord.z),
            radius: this.getPieceRadius(coord.z),
            classes,
        };
    }

    private isOccupied(coord: PylosCoord): boolean {
        if (this.justClimbed(coord)) {
            return false;
        }
        const reallyOccupied: boolean = this.state().getPieceAt(coord).isPlayer();
        const landingCoord: boolean = this.chosenLandingCoord().equalsValue(coord);
        return reallyOccupied || landingCoord;
    }

    private getPieceClasses(c: PylosCoord): string[] {
        const classes: string[] = [this.getPieceFillClass(c)];
        if (this.lastMoved().some((coord: PylosCoord) => coord.equals(c))) {
            classes.push('last-move-stroke');
        }
        if (this.chosenStartingCoord().equalsValue(c) || this.chosenLandingCoord().equalsValue(c)) {
            classes.push('selected-stroke');
        }
        if (this.isCaptured(c)) {
            classes.push('pre-captured-fill');
        }
        return classes;
    }

    private getPieceFillClass(c: PylosCoord): string {
        if (this.chosenLandingCoord().equalsValue(c)) {
            return this.getPlayerClass(this.state().getCurrentPlayer());
        }
        return this.getPlayerClass(this.state().getPieceAt(c));
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.constructedState.set(this.state());
        const repartition: PlayerNumberMap = this.state().getPiecesRepartition();
        this.remainingPieces.set(PlayerNumberMap.of(
            15 - repartition.get(Player.ZERO),
            15 - repartition.get(Player.ONE),
        ));
        this.updateScores();
    }

    private updateScores(): void {
        this.scores = MGPOptional.of(this.remainingPieces());
    }

    protected override getScoreName(): ScoreName {
        return ScoreName.REMAINING_PIECES;
    }

    protected override async showLastMove(move: PylosMove): Promise<void> {
        this.displayedLastMove.set(MGPOptional.of(move));
    }

    public override hideLastMove(): void {
        this.displayedLastMove.set(MGPOptional.empty());
    }

    private mustDrawCapturedCoord(coord: PylosCoord): boolean {
        const state: PylosState = this.state();
        return state.getPieceAt(coord).isPlayer() || state.isLandable(coord);
    }

    private mustDisplayLandingCoord(coord: PylosCoord): boolean {
        if (this.chosenStartingCoord().isPresent()) {
            if (this.chosenStartingCoord().equalsValue(coord)) {
                return true;
            }
            const startingZ: number = this.chosenStartingCoord().get().z;
            return startingZ < coord.z;
        } else {
            return true;
        }
    }

}

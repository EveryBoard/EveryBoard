import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

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

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-pylos',
    templateUrl: './pylos.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class PylosComponent extends GameComponent<PylosRules, PylosMove, PylosState> {

    // 4*100 for each pieces at z=0 level + 2*4 for each direction there is stroke
    protected readonly boardWidth: number = (4 * this.SPACE_SIZE) + this.STROKE_WIDTH;
    protected readonly pieceRowHeight: number = this.SPACE_SIZE / 2;
    protected readonly boardHeight: number = this.boardWidth + 2 * this.pieceRowHeight;

    protected override computeViewBox(): ViewBox {
        return new ViewBox(0, 0, this.boardWidth, this.boardHeight);
    }

    private readonly constructedState: WritableSignal<PylosState> = signal(this.state());

    private readonly lastLandingCoord: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly lastStartingCoord: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly lastFirstCapture: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly lastSecondCapture: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    protected readonly highCapture: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());

    protected readonly capturables: WritableSignal<Set<PylosCoord>> = signal(new Set());

    private readonly chosenStartingCoord: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    protected readonly chosenLandingCoord: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly chosenFirstCapture: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());
    private readonly chosenSecondCapture: WritableSignal<MGPOptional<PylosCoord>> = signal(MGPOptional.empty());

    private readonly captured: WritableSignal<ReadonlyArray<PylosCoord>> = signal([]);
    private readonly lastMoved: WritableSignal<ReadonlyArray<PylosCoord>> = signal([]);

    private readonly remainingPieces: WritableSignal<PlayerNumberMap> = signal(PlayerNumberMap.of(15, 15));

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

    protected getPiecesCyForPlayer(player: Player): number {
        if (player === Player.ONE) {
            return this.pieceRowHeight / 2;
        } else {
            return this.boardWidth + ( 1.5 * this.pieceRowHeight);
        }
    }

    protected getLevelRange(z: number): number[] {
        return PylosState.getLevelRange(z);
    }

    protected mustDraw(x: number, y: number, z: number): boolean {
        const coord: PylosCoord = new PylosCoord(x, y, z);
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
        // Starting do describe a climbing move
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

    protected getCaptureValidationButtonClasses(): string {
        if (this.chosenFirstCapture().isPresent() || this.chosenSecondCapture().isPresent()) {
            return '';
        } else {
            return 'semi-transparent';
        }
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

    protected getSquareClasses(x: number, y: number, z: number): string[] {
        const coord: PylosCoord = new PylosCoord(x, y, z);
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

    protected getPieceRadius(z: number): number {
        // 0.45 so that the radius take 90% of the place the square had
        // 0.05 so that it become 5% bigger at each level
        return this.SPACE_SIZE * (0.45 + (z * 0.025));
    }

    protected getPieceCx(x: number, _y: number, z: number): number {
        // Level one pieces must look like they are in between level zero pieces
        const levelOffset: number = z * 0.5 * this.SPACE_SIZE;
        const localPieceCenter: number = this.SPACE_SIZE / 2;
        return localPieceCenter + levelOffset + (x * this.SPACE_SIZE);
    }

    protected getPieceCy(_x: number, y: number, z: number): number {
        // Level one pieces must look like they are in between level zero pieces
        const levelOffset: number = z * 0.5 * this.SPACE_SIZE;
        const localPieceCenter: number = this.SPACE_SIZE / 2;
        return localPieceCenter + levelOffset + (y * this.SPACE_SIZE);
    }

    protected getPieceCxByCoord(coord: PylosCoord): number {
        return this.getPieceCx(coord.x, coord.y, coord.z);
    }

    protected getPieceCyByCoord(coord: PylosCoord): number {
        return this.getPieceCy(coord.x, coord.y, coord.z);
    }

    protected isOccupied(x: number, y: number, z: number): boolean {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        if (this.justClimbed(coord)) {
            return false;
        }
        const reallyOccupied: boolean = this.state().getPieceAt(coord).isPlayer();
        const landingCoord: boolean = this.chosenLandingCoord().equalsValue(coord);
        return reallyOccupied || landingCoord;
    }

    protected getPieceClasses(x: number, y: number, z: number): string[] {
        const c: PylosCoord = new PylosCoord(x, y, z);
        const classes: string[] = [this.getPieceFillClass(c)];
        if (this.lastLandingCoord().equalsValue(c) || this.lastStartingCoord().equalsValue(c)) {
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

    protected getPlayerSidePieces(player: Player): number[] {
        const nPieces: number = this.remainingPieces().get(player);
        const pieces: number[] = [];
        for (let i: number = 0; i < nPieces; i++) {
            pieces.push(i);
        }
        return pieces;
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
        this.lastStartingCoord.set(move.startingCoord);
        this.lastLandingCoord.set(MGPOptional.of(move.landingCoord));
        this.lastFirstCapture.set(move.firstCapture);
        this.lastSecondCapture.set(move.secondCapture);
        if (this.lastFirstCapture().isPresent() &&
            this.mustDrawCoord(this.lastFirstCapture().get()) === false)
        {
            this.highCapture.set(this.lastFirstCapture());
        }
        const captured: PylosCoord[] = [];
        if (move.firstCapture.isPresent()) {
            captured.push(move.firstCapture.get());
        }
        if (move.secondCapture.isPresent()) {
            captured.push(move.secondCapture.get());
        }
        this.captured.set(captured);
        const lastMoved: PylosCoord[] = [move.landingCoord];
        if (move.startingCoord.isPresent()) {
            lastMoved.push(move.startingCoord.get());
        }
        this.lastMoved.set(lastMoved);
    }

    public override hideLastMove(): void {
        this.lastStartingCoord.set(MGPOptional.empty());
        this.lastLandingCoord.set(MGPOptional.empty());
        this.lastFirstCapture.set(MGPOptional.empty());
        this.lastSecondCapture.set(MGPOptional.empty());
        this.highCapture.set(MGPOptional.empty());
        this.lastMoved.set([]);
        this.captured.set([]);
    }

    private mustDrawCoord(coord: PylosCoord): boolean {
        const x: number = coord.x;
        const y: number = coord.y;
        const z: number = coord.z;
        return this.mustDraw(x, y, z);
    }

    protected mustDisplayLandingCoord(x: number, y: number, z: number): boolean {
        if (this.chosenStartingCoord().isPresent()) {
            if (this.chosenStartingCoord().equalsValue(new PylosCoord(x, y, z))) {
                return true;
            }
            const startingZ: number = this.chosenStartingCoord().get().z;
            return startingZ < z;
        } else {
            return true;
        }
    }

}

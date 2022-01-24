import { Component } from '@angular/core';
import { GameComponent } from '../../components/game-components/game-component/GameComponent';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosState } from 'src/app/games/pylos/PylosState';
import { PylosRules } from 'src/app/games/pylos/PylosRules';
import { PylosMinimax } from 'src/app/games/pylos/PylosMinimax';
import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { PylosOrderedMinimax } from './PylosOrderedMinimax';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PylosFailure } from './PylosFailure';
import { PylosTutorial } from './PylosTutorial';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-pylos',
    templateUrl: './pylos.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class PylosComponent extends GameComponent<PylosRules, PylosMove, PylosState> {

    public static VERBOSE: boolean = false;

    public state: PylosState;

    public lastLandingCoord: MGPOptional<PylosCoord> = MGPOptional.empty();
    public lastStartingCoord: MGPOptional<PylosCoord> = MGPOptional.empty();
    public lastFirstCapture: MGPOptional<PylosCoord> = MGPOptional.empty();
    public lastSecondCapture: MGPOptional<PylosCoord> = MGPOptional.empty();
    public highCapture: MGPOptional<PylosCoord> = MGPOptional.empty();

    public chosenStartingCoord: MGPOptional<PylosCoord> = MGPOptional.empty();
    public chosenLandingCoord: MGPOptional<PylosCoord> = MGPOptional.empty();
    public chosenFirstCapture: MGPOptional<PylosCoord> = MGPOptional.empty();

    public lastMove: MGPOptional<PylosMove> = MGPOptional.empty();

    private remainingPieces: { [owner: number]: number } = { 0: 15, 1: 15 };

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new PylosRules(PylosState);
        this.availableMinimaxes = [
            new PylosMinimax(this.rules, 'PylosMinimax'),
            new PylosOrderedMinimax(this.rules, 'PylosOrderedMinimax'),
        ];
        this.encoder = PylosMove.encoder;
        this.tutorial = new PylosTutorial().tutorial;
        this.SPACE_SIZE = this.getPieceRadius(0);
        this.updateBoard();
    }
    public getLevelRange(z: number): number[] {
        switch (z) {
            case 0: return [0, 1, 2, 3];
            case 1: return [0, 1, 2];
            default:
                Utils.expectToBe(z, 2);
                return [0, 1];
        }
    }
    public isDrawable(x: number, y: number, z: number): boolean {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        if (this.state.getPieceAt(coord) === Player.NONE) {
            return this.state.isLandable(coord);
        } else {
            return true;
        }
    }
    public async onPieceClick(x: number, y: number, z: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + x + '_' + y + '_' + z);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: PylosCoord = new PylosCoord(x, y, z);
        const clickedPiece: Player = this.state.getPieceAt(clickedCoord);
        const pieceBelongToOpponent: boolean = clickedPiece === this.state.getCurrentOpponent();
        if (pieceBelongToOpponent) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        if (this.chosenLandingCoord.isAbsent()) {
            // Starting do describe a climbing move
            this.chosenStartingCoord = MGPOptional.of(clickedCoord);
            return MGPValidation.SUCCESS;
        }
        // Starting to select capture
        if (this.chosenFirstCapture.isAbsent()) { // First capture
            this.chosenFirstCapture = MGPOptional.of(clickedCoord);
            return MGPValidation.SUCCESS;
        } else if (this.chosenFirstCapture.equalsValue(clickedCoord)) {
            return this.concludeMoveWithCapture([this.chosenFirstCapture.get()]);
        } else { // Last capture
            return this.concludeMoveWithCapture([this.chosenFirstCapture.get(), clickedCoord]);
        }
    }
    private async concludeMoveWithCapture(captures: PylosCoord[]): Promise<MGPValidation> {
        let move: PylosMove;
        if (this.chosenStartingCoord.isAbsent()) {
            move = PylosMove.fromDrop(this.chosenLandingCoord.get(), captures);
        } else {
            move = PylosMove.fromClimb(this.chosenStartingCoord.get(),
                                       this.chosenLandingCoord.get(),
                                       captures);
        }
        return this.tryMove(move, this.state);
    }
    private async tryMove(move: PylosMove, state: PylosState): Promise<MGPValidation> {
        this.cancelMove();
        return this.chooseMove(move, state);
    }
    public cancelMoveAttempt(): void {
        this.chosenStartingCoord = MGPOptional.empty();
        this.chosenLandingCoord = MGPOptional.empty();
        this.chosenFirstCapture = MGPOptional.empty();
    }
    public async onDrop(x: number, y: number, z: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#drop_' + x + '_' + y + '_' + z);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: PylosCoord = new PylosCoord(x, y, z);
        if (PylosRules.canCapture(this.state, clickedCoord)) {
            this.chosenLandingCoord = MGPOptional.of(clickedCoord);
            return MGPValidation.SUCCESS; // now player can click on his captures
        } else {
            if (this.isCapturelessMoveFinished(clickedCoord)) {
                this.chosenLandingCoord = MGPOptional.of(clickedCoord);
                return this.concludeMoveWithCapture([]);
            } else {
                return this.cancelMove(PylosFailure.MUST_MOVE_UPWARD());
            }
        }
    }
    private isCapturelessMoveFinished(clickedCoord: PylosCoord): boolean {
        if (this.chosenStartingCoord.isAbsent()) {
            // Drop without capture
            return true;
        }
        return clickedCoord.isUpperThan(this.chosenStartingCoord.get()); // true if legal climbing (without capture)
    }
    public getSquareClasses(x: number, y: number, z: number): string[] {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        if (this.lastMove.isPresent()) {
            const move: PylosMove = this.lastMove.get();
            if (move.firstCapture.equalsValue(coord) || move.secondCapture.equalsValue(coord)) {
                return ['captured'];
            } else if (coord.equals(move.landingCoord) || move.startingCoord.equalsValue(coord)) {
                return ['moved'];
            }
        }
        return [];
    }
    public getPieceRadius(z: number): number {
        return 90 + (z * 5);
    }
    public getPieceCx(x: number, _y: number, z: number): number {
        return 100 + (z * 100) + (x * 200);
    }
    public getPieceCy(_x: number, y: number, z: number): number {
        return 100 + (z * 100) + (y * 200);
    }
    public isOccupied(x: number, y: number, z: number): boolean {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        const reallyOccupied: boolean = this.rules.node.gameState.getPieceAt(coord) !== Player.NONE;
        const landingCoord: boolean = this.chosenLandingCoord.equalsValue(coord);
        return reallyOccupied || landingCoord;
    }
    public getPieceClasses(x: number, y: number, z: number): string[] {
        const c: PylosCoord = new PylosCoord(x, y, z);
        const classes: string[] = [this.getPieceFillClass(c)];
        if (this.lastLandingCoord.equalsValue(c) || this.lastStartingCoord.equalsValue(c)) {
            classes.push('highlighted');
        }
        if (this.chosenStartingCoord.equalsValue(c) || this.chosenLandingCoord.equalsValue(c)) {
            classes.push('selected');
        }
        if (this.chosenFirstCapture.equalsValue(c)) {
            classes.push('pre-captured');
        }
        return classes;
    }
    private getPieceFillClass(c: PylosCoord): string {
        if (this.chosenLandingCoord.equalsValue(c)) {
            return this.getPlayerClass(this.state.getCurrentPlayer());
        }
        return this.getPlayerPieceClass(this.state.getPieceAt(c).value);
    }
    public getPlayerPieceClass(player: number): string {
        return this.getPlayerClass(Player.of(player));
    }
    public getPlayerSidePieces(player: number): number[] {
        const nPieces: number = this.remainingPieces[player];
        const pieces: number[] = [];
        for (let i: number = 0; i < nPieces; i++) {
            pieces.push(i);
        }
        return pieces;
    }
    public updateBoard(): void {
        this.state = this.rules.node.gameState;
        this.lastMove = this.rules.node.move;
        const repartition: { [owner: number]: number } = this.state.getPiecesRepartition();
        this.remainingPieces = { 0: 15 - repartition[0], 1: 15 - repartition[1] };
        this.highCapture = MGPOptional.empty();
        if (this.lastMove.isPresent()) {
            this.showLastMove();
        } else {
            this.lastLandingCoord = MGPOptional.empty();
            this.lastStartingCoord = MGPOptional.empty();
            this.lastFirstCapture = MGPOptional.empty();
            this.lastSecondCapture = MGPOptional.empty();
            this.chosenFirstCapture = MGPOptional.empty();
            this.chosenStartingCoord = MGPOptional.empty();
            this.chosenLandingCoord = MGPOptional.empty();
        }
    }
    private showLastMove(): void {
        const lastMove: PylosMove = this.lastMove.get();
        this.lastLandingCoord = MGPOptional.of(lastMove.landingCoord);
        this.lastStartingCoord = lastMove.startingCoord;
        this.lastFirstCapture = lastMove.firstCapture;
        this.lastSecondCapture = lastMove.secondCapture;
        if (this.lastFirstCapture.isPresent() &&
            this.isDrawableCoord(this.lastFirstCapture.get()) === false)
        {
            this.highCapture = this.lastFirstCapture;
        }
    }
    private isDrawableCoord(coord: PylosCoord): boolean {
        const x: number = coord.x;
        const y: number = coord.y;
        const z: number = coord.z;
        return this.isDrawable(x, y, z);
    }
}

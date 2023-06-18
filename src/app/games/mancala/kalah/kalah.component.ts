import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { KalahRules } from './KalahRules';
import { MancalaState } from '../MancalaState';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { KalahTutorial } from './KalahTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../MancalaRules';
import { KalahMove } from './KalahMove';
import { MancalaFailure } from '../MancalaFailure';
import { MancalaMove } from '../MancalaMove';
import { KalahDummyMinimax } from './KalahDummyMinimax';

@Component({
    selector: 'app-kalah-component',
    templateUrl: './kalah.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class KalahComponent extends RectangularGameComponent<KalahRules,
                                                             KalahMove,
                                                             MancalaState,
                                                             number>
{
    public last: MGPOptional<Coord> = MGPOptional.empty();

    public currentMove: MGPOptional<KalahMove> = MGPOptional.empty();

    public constructedState: MGPOptional<MancalaState> = MGPOptional.empty();

    public captured: Table<number> = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    private filledCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
        this.rules = KalahRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new KalahDummyMinimax(),
        ];
        // this.encoder = KalahMove.encoder;
        this.tutorial = new KalahTutorial().tutorial;

        this.updateBoard();
    }
    public updateBoard(): void {
        console.log("peux-ce t'être, on verroo looooo")
        const state: MancalaState = this.getState();
        if (this.constructedState.isAbsent()) {
            this.constructedState = MGPOptional.of(state);
        }
        this.scores = MGPOptional.of(state.getCapturedCopy());
        this.hidePreviousMove();

        this.board = this.constructedState.get().getCopiedBoard();
        // Will be set in showLastMove if there is one
        this.last = MGPOptional.empty();
    }
    private hidePreviousMove(): void {
        this.captured = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        this.filledCoords = [];
    }
    public override showLastMove(move: KalahMove): void {
        this.constructedState = MGPOptional.of(this.getState());
        // const lastPlayer: number = this.getState().getCurrentPlayer().value;
        // this.last = MGPOptional.of(new Coord(move.x, lastPlayer)); TODO: this.last ? eh....do animations
        const previousState: MancalaState = this.getPreviousState();
        const distributionResult: MancalaDistributionResult = this.rules.distributeMove(move, previousState);
        console.log('post distrib')
        console.table(distributionResult.resultingState.board)
        this.filledCoords = distributionResult.filledHouses;
        const captureResult: MancalaCaptureResult = this.rules.applyCapture(distributionResult);
        console.log('post capture')
        console.table(captureResult.resultingState.board)
        console.log('what has been captured ?')
        console.table(captureResult.captureMap)
        this.captured = captureResult.captureMap;
        const mansoonedPlayer: PlayerOrNone = this.rules.mustMansoon(captureResult.resultingState);
        console.log('let us mansoon', mansoonedPlayer.toString())
        if (mansoonedPlayer !== PlayerOrNone.NONE) {
            const mancalaMansoonResult: MancalaCaptureResult =
                MancalaRules.mansoon(mansoonedPlayer as Player, captureResult);
            console.log('post moisson')
            console.table(mancalaMansoonResult.resultingState.board)
            console.log('what has been captured ?')
            console.table(mancalaMansoonResult.captureMap)
            this.captured = mancalaMansoonResult.captureMap;
        }
    }
    public override cancelMoveAttempt(): void {
        this.currentMove = MGPOptional.empty();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (y === this.getState().getCurrentPlayer().value) {
            return this.cancelMove(MancalaFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
        }
        const opponentY: number = this.getState().getCurrentOpponent().value;
        // TODO: REMOVE this.last = MGPOptional.empty(); // now the user stop try to do a move
        // TODO: REMOVE // we stop showing him the last move
        if (this.currentMove.isAbsent()) {
            this.currentMove = MGPOptional.of(new KalahMove(MancalaMove.from(x)));
        } else {
            this.currentMove = MGPOptional.of(this.currentMove.get().add(MancalaMove.from(x)));
        }
        const distributionResult: MancalaDistributionResult = this.rules.distributeHouse(x, opponentY, this.getState());
        if (distributionResult.endUpInKalah === false) {
            this.constructedState = MGPOptional.empty();
            return this.chooseMove(this.currentMove.get(), this.getState());
        } else {
            this.constructedState = MGPOptional.of(distributionResult.resultingState);
            console.log('cest updaté, tu va t\'en servir looo ?')
            this.updateBoard();
            return MGPValidation.SUCCESS;
        }
    }
    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const homeColor: string = 'player' + (y + 1) % 2 + '-fill';
        if (this.captured[y][x] > 0) {
            return ['captured-fill', 'moved-stroke'];
        } else if (this.last.equalsValue(coord)) {
            return ['moved-stroke', 'last-move-stroke', homeColor];
        } else if (this.filledCoords.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', homeColor];
        } else {
            return [homeColor];
        }
    }
    public getPieceCx(x: number): number {
        return 50 + 100 * x;
    }
    public getPieceCy(y: number): number {
        return 50 + 120 * y;
    }
    public getPieceRotation(x: number, y: number): string {
        return 'rotate(' + this.role.value * 180 + ' ' +
               this.getPieceCx(x) + ' ' +
               this.getPieceCy(y) + ')';
    }
}

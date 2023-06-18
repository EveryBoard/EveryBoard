import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { AwaleRules } from './AwaleRules';
import { AwaleMinimax } from './AwaleMinimax';
import { MancalaMove } from 'src/app/games/mancala/MancalaMove';
import { MancalaState } from '../MancalaState';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MancalaFailure } from './../MancalaFailure';
import { AwaleTutorial } from './AwaleTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../MancalaRules';

@Component({
    selector: 'app-awale-component',
    templateUrl: './awale.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends RectangularGameComponent<AwaleRules,
                                                             MancalaMove,
                                                             MancalaState,
                                                             number>
{
    public last: MGPOptional<Coord> = MGPOptional.empty();

    public captured: Table<number> = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    private filledHouses: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
        this.rules = AwaleRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new AwaleMinimax(),
        ];
        this.encoder = MancalaMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;

        this.updateBoard();
    }
    public updateBoard(): void {
        const state: MancalaState = this.getState();
        this.scores = MGPOptional.of(state.getCapturedCopy());
        this.hidePreviousMove();

        this.board = state.getCopiedBoard();
        // Will be set in showLastMove if there is one
        this.last = MGPOptional.empty();
    }
    private hidePreviousMove(): void {
        this.captured = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        this.filledHouses = [];
    }
    public override showLastMove(move: MancalaMove): void {
        const lastPlayer: number = this.getState().getCurrentPlayer().value;
        this.last = MGPOptional.of(new Coord(move.x, lastPlayer));
        const previousState: MancalaState = this.getPreviousState();
        const distributionResult: MancalaDistributionResult = this.rules.distributeMove(move, previousState);
        this.filledHouses = distributionResult.filledHouses;
        const captureResult: MancalaCaptureResult = this.rules.applyCapture(distributionResult);
        this.captured = captureResult.captureMap;
        const mansoonedPlayer: PlayerOrNone = this.rules.mustMansoon(captureResult.resultingState);
        if (mansoonedPlayer !== PlayerOrNone.NONE) {
            this.captured = MancalaRules.mansoon(mansoonedPlayer as Player, captureResult).captureMap;
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (y === this.getState().getCurrentPlayer().value) {
            return this.cancelMove(MancalaFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
        }
        // TODO: REMOVE this.last = MGPOptional.empty(); // now the user stop try to do a move
        // TODO: REMOVE // we stop showing him the last move
        const chosenMove: MancalaMove = MancalaMove.from(x);
        return this.chooseMove(chosenMove, this.getState());
    }
    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const homeColor: string = 'player' + (y + 1) % 2 + '-fill';
        if (this.captured[y][x] > 0) {
            return ['captured-fill', 'moved-stroke'];
        } else if (this.last.equalsValue(coord)) {
            return ['moved-stroke', 'last-move-stroke', homeColor];
        } else if (this.filledHouses.some((c: Coord) => c.equals(coord))) {
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

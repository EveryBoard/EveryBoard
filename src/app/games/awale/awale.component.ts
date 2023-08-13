import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { AwaleRules, CaptureResult } from './AwaleRules';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleState } from './AwaleState';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AwaleFailure } from './AwaleFailure';
import { AwaleTutorial } from './AwaleTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { MCTS } from 'src/app/jscaip/MCTS';
import { AwaleCaptureHeuristic } from './AwaleCaptureHeuristic';
import { Minimax } from 'src/app/jscaip/Minimax';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';

@Component({
    selector: 'app-awale-component',
    templateUrl: './awale.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends RectangularGameComponent<AwaleRules,
                                                             AwaleMove,
                                                             AwaleState,
                                                             number>
{
    public last: MGPOptional<Coord> = MGPOptional.empty();

    public captured: Table<number> = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    private filledCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
        this.rules = AwaleRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new Minimax('Capture Minimax', AwaleRules.get(), new AwaleCaptureHeuristic(), new AwaleMoveGenerator()),
            new MCTS('MCTS', new AwaleMoveGenerator(), this.rules),
        ];
        this.encoder = AwaleMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;

        this.updateBoard();
    }
    public updateBoard(): void {
        const state: AwaleState = this.getState();
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
        this.filledCoords = [];
    }
    public override showLastMove(move: AwaleMove): void {
        const lastPlayer: number = this.getState().getCurrentPlayer().value;
        this.last = MGPOptional.of(new Coord(move.x, lastPlayer));
        const previousState: AwaleState = this.getPreviousState();
        const previousBoard: number[][] = ArrayUtils.copyBiArray(previousState.board);
        const previousY: number = previousState.getCurrentOpponent().value;
        this.filledCoords = AwaleRules.distribute(move.x,
                                                  previousY,
                                                  previousBoard);
        const landingCoord: Coord = this.filledCoords[this.filledCoords.length - 1];
        if (landingCoord.y !== previousY) {
            const captureResult: CaptureResult = AwaleRules.captureIfLegal(landingCoord.x,
                                                                           landingCoord.y,
                                                                           previousState.getCurrentPlayer(),
                                                                           previousBoard);
            this.captured = captureResult.captureMap;
            const player: Player = this.getState().getCurrentPlayer();
            if (AwaleRules.mustMansoon(player.getOpponent(), captureResult.resultingBoard)) {
                this.captured = AwaleRules.mansoon(player, captureResult.resultingBoard).captureMap;
            }
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (y === this.getState().getCurrentPlayer().value) {
            return this.cancelMove(AwaleFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
        }
        this.last = MGPOptional.empty(); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: AwaleMove = AwaleMove.of(x);
        return this.chooseMove(chosenMove);
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

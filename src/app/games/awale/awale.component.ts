import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { AwaleRules } from './AwaleRules';
import { AwaleMinimax } from './AwaleMinimax';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleState } from './AwaleState';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AwaleFailure } from './AwaleFailure';
import { AwaleTutorial } from './AwaleTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

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

    private captured: number[][] = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    private filledCoords: Coord[] = [];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
        this.rules = new AwaleRules(AwaleState);
        this.availableMinimaxes = [
            new AwaleMinimax(this.rules, 'AwaleMinimax'),
        ];
        this.encoder = AwaleMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;

        this.updateBoard();
    }
    public updateBoard(): void {
        const state: AwaleState = this.rules.node.gameState;
        this.scores = MGPOptional.of(state.getCapturedCopy());
        this.hidePreviousMove();
        const lastMove: MGPOptional<AwaleMove> = this.rules.node.move;

        this.board = state.getCopiedBoard();
        if (lastMove.isPresent()) {
            const lastPlayer: number = state.getCurrentPlayer().value;
            this.last = MGPOptional.of(new Coord(lastMove.get().x, lastPlayer));
            this.showPreviousMove();
        } else {
            this.last = MGPOptional.empty();
        }
    }
    private hidePreviousMove(): void {
        this.captured = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        this.filledCoords = [];
    }
    private showPreviousMove(): void {
        const previousMove: AwaleMove = this.rules.node.mother.get().move.get();
        const previousState: AwaleState = this.rules.node.mother.get().gameState;
        const previousBoard: number[][] = ArrayUtils.copyBiArray(previousState.board);
        const previousY: number = previousState.getCurrentPlayer().value;
        this.filledCoords = AwaleRules.distribute(previousMove.x,
                                                  previousY,
                                                  previousBoard);
        const landingCoord: Coord = this.filledCoords[this.filledCoords.length - 1];
        if (landingCoord.y !== previousY) {
            this.captured = AwaleRules.capture(landingCoord.x,
                                               landingCoord.y,
                                               previousState.getCurrentPlayer(),
                                               previousBoard);
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (y === this.rules.node.gameState.getCurrentPlayer().value) {
            return this.cancelMove(AwaleFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
        }
        this.last = MGPOptional.empty(); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: AwaleMove = AwaleMove.from(x);
        // let's confirm on java-server-side that the move is legal
        return this.chooseMove(chosenMove, this.rules.node.gameState, this.scores.get());
    }
    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.captured[y][x] > 0) {
            return ['captured'];
        } else if (this.last.equalsValue(coord)) {
            return ['moved', 'highlighted'];
        } else if (this.filledCoords.some((c: Coord) => c.equals(coord))) {
            return ['moved'];
        } else {
            return [];
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

import { ChangeDetectorRef, Component } from '@angular/core';
import { AwaleRules } from './AwaleRules';
import { AwaleMinimax } from './AwaleMinimax';
import { MancalaMove } from 'src/app/games/mancala/commons/MancalaMove';
import { MancalaState } from '../commons/MancalaState';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MancalaFailure } from './../commons/MancalaFailure';
import { AwaleTutorial } from './AwaleTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MancalaCaptureResult, MancalaDistributionResult } from '../commons/MancalaRules';
import { MancalaComponent } from '../commons/MancalaComponent';

@Component({
    selector: 'app-awale-component',
    templateUrl: './../commons/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class AwaleComponent extends MancalaComponent<AwaleRules, MancalaMove> {

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.rules = AwaleRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new AwaleMinimax(),
        ];
        this.encoder = MancalaMove.encoder;
        this.tutorial = new AwaleTutorial().tutorial;
    }
    public async updateBoard(): Promise<void> {
        const state: MancalaState = this.getState();
        this.scores = MGPOptional.of(state.getCapturedCopy());
        this.hidePreviousMove();

        this.board = state.getCopiedBoard();
        this.changeVisibleState(state);
    }
    public override async showLastMove(distribution: MancalaMove): Promise<void> {
        const state: MancalaState = this.getPreviousState();
        const distributionResult: MancalaDistributionResult = await this.showSimpleDistributionFor(distribution, state);
        let captureResult: MancalaCaptureResult = this.rules.applyCapture(distributionResult);
        this.captured = captureResult.captureMap;
        const mansoonedPlayer: PlayerOrNone = this.rules.mustMansoon(captureResult.resultingState);
        if (mansoonedPlayer !== PlayerOrNone.NONE) {
            captureResult = this.rules.mansoon(mansoonedPlayer as Player, captureResult);
            this.captured = captureResult.captureMap;
        }
        this.changeVisibleState(captureResult.resultingState);
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
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
}

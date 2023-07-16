import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MancalaComponent } from '../commons/MancalaComponent';
import { KalahRules } from './KalahRules';
import { KalahMove } from './KalahMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaState } from '../commons/MancalaState';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { KalahDummyMinimax } from './KalahDummyMinimax';
import { KalahTutorial } from './KalahTutorial';
import { MancalaMove } from '../commons/MancalaMove';
import { MancalaCaptureResult, MancalaDistributionResult } from '../commons/MancalaRules';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MancalaFailure } from '../commons/MancalaFailure';

@Component({
    selector: 'app-kalah-component',
    templateUrl: './../commons/mancala.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KalahComponent extends MancalaComponent<KalahRules, KalahMove> {

    public currentMove: MGPOptional<KalahMove> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
        this.rules = KalahRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new KalahDummyMinimax(),
        ];
        // this.encoder = KalahMove.encoder;
        this.tutorial = new KalahTutorial().tutorial;
    }
    public async updateBoard(triggerAnimation: boolean = false, caller: string='undefined'): Promise<void> {
        const state: MancalaState = this.getState();
        this.changeVisibleState(state);
        if (triggerAnimation) {
            this.changeVisibleState(this.node.mother.get().gameState);
            for (const subMove of this.node.move.get()) {
                await this.showSubMoveAnimation(subMove);
            }
        }
        this.scores = MGPOptional.of(state.getCapturedCopy());
        this.hidePreviousMove();

        this.changeVisibleState(this.constructedState.get());
    }
    private async showSubMoveAnimation(subMove: MancalaMove): Promise<void> {
        const simpleDistributionResult: MancalaDistributionResult = await this.showSimpleDistribution(subMove);
        const nextState: MancalaState = simpleDistributionResult.resultingState;
        this.changeVisibleState(nextState);
        return new Promise((resolve: (result: void) => void) => {
            setTimeout(resolve, 200);
        });
    }
    public override async showLastMove(move: KalahMove): Promise<void> {
        // TODO: mettre en commun le sheuteumeuleu & compo!
        const previousState: MancalaState = this.getPreviousState();
        const distributionResult: MancalaDistributionResult = this.rules.distributeMove(move, previousState);
        this.filledHouses = distributionResult.filledHouses;
        const captureResult: MancalaCaptureResult = this.rules.applyCapture(distributionResult);
        this.captured = captureResult.captureMap;
        const mansoonedPlayer: PlayerOrNone = this.rules.mustMansoon(captureResult.resultingState);
        if (mansoonedPlayer !== PlayerOrNone.NONE) {
            const mancalaMansoonResult: MancalaCaptureResult =
                this.rules.mansoon(mansoonedPlayer as Player, captureResult);
            this.captured = mancalaMansoonResult.captureMap;
        }
        this.changeVisibleState(this.getState());
    }
    private async showSimpleDistribution(distribution: MancalaMove): Promise<MancalaDistributionResult> {
        const state: MancalaState = this.constructedState.get();
        return this.showSimpleDistributionFor(distribution, state);
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        console.log('clicked!')
        this.hidePreviousMove();
        if (y === this.getState().getCurrentPlayer().value) {
            return this.cancelMove(MancalaFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
        }
        // TODO: REMOVE this.last = MGPOptional.empty(); // now the user stop try to do a move
        // TODO: REMOVE // we stop showing him the last move
        if (this.currentMove.isAbsent()) {
            this.currentMove = MGPOptional.of(new KalahMove(MancalaMove.from(x)));
        } else {
            this.currentMove = MGPOptional.of(this.currentMove.get().add(MancalaMove.from(x)));
        }
        const distributionResult: MancalaDistributionResult = await this.showSimpleDistribution(MancalaMove.from(x));
        console.log('showed ongoing distribution');
        if (distributionResult.endUpInKalah === false) {
            this.constructedState = MGPOptional.empty();
            console.log('and next instruction, choosing moooove')
            return this.chooseMove(this.currentMove.get(), this.getState());
        } else {
            this.changeVisibleState(distributionResult.resultingState);
            return MGPValidation.SUCCESS;
        }
    }
    public override cancelMoveAttempt(): void {
        this.currentMove = MGPOptional.empty();
        this.constructedState = MGPOptional.empty();
    }
}

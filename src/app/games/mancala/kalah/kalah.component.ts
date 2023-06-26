import { Component } from '@angular/core';
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
})
export class KalahComponent extends MancalaComponent<KalahRules, KalahMove> {

    public currentMove: MGPOptional<KalahMove> = MGPOptional.empty();

    public constructedState: MGPOptional<MancalaState> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = KalahRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new KalahDummyMinimax(),
        ];
        // this.encoder = KalahMove.encoder;
        this.tutorial = new KalahTutorial().tutorial;

        void this.updateBoard(false, 'constructor');
    }
    public async updateBoard(triggerAnimation: boolean = false, caller: string='undefined'): Promise<void> {
        console.log('>_> Kalah.updateBoard', triggerAnimation, 'caller:', caller)
        const state: MancalaState = this.getState();
        this.constructedState = MGPOptional.of(state);
        if (triggerAnimation) {
            this.constructedState = MGPOptional.of(this.node.mother.get().gameState)
            for (const subMove of this.node.move.get()) {
                await this.showSubMoveAnimation(subMove);
            }
        }
        this.scores = MGPOptional.of(state.getCapturedCopy());
        this.hidePreviousMove();

        this.board = this.constructedState.get().getCopiedBoard();
        // Will be set in showLastMove if there is one
        this.last = MGPOptional.empty(); // TODO: LOOKS LIKE YOU BELONG IN hidePreviousMove BOY
        console.log('<_< kalah.updateBoard')
    }
    private async showSubMoveAnimation(subMove: MancalaMove): Promise<void> {
        console.log('showSubMoveAnimation', subMove.x)
        const currentState: MancalaState = this.constructedState.get();
        console.log('from')
        console.table(currentState.getCopiedBoard())
        const playerY: number = currentState.getCurrentOpponent().value;
        const nextState: MancalaState = this.rules.distributeHouse(subMove.x, playerY, currentState).resultingState;
        console.log('CONSTRUCTED STATE DEVIENS le post distrib de', subMove.x)
        this.constructedState = MGPOptional.of(nextState);
        this.board = nextState.board;
        console.log('to')
        console.table(nextState.getCopiedBoard());
        console.log('========================================')
        return new Promise((resolve: (result: void) => void) => {
            setTimeout(resolve, 1500);
        });
    }
    public override showLastMove(move: KalahMove, caller: string='none'): void { // TODO: mettre en commun le sheuteumeuleu & compo!
        console.log('> > > showLastMove (caller: ' + caller + '): CONSTRUCTED STATE DEVIENS LE NOUVEAU')
        this.constructedState = MGPOptional.of(this.getState());
        // const lastPlayer: number = this.getState().getCurrentPlayer().value;
        // this.last = MGPOptional.of(new Coord(move.x, lastPlayer)); TODO: this.last ? eh....do animations
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
        console.log('< < < showLastMove')
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
        const opponentY: number = this.getState().getCurrentOpponent().value;
        if (this.currentMove.isAbsent()) {
            this.currentMove = MGPOptional.of(new KalahMove(MancalaMove.from(x)));
        } else {
            this.currentMove = MGPOptional.of(this.currentMove.get().add(MancalaMove.from(x)));
        }
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeHouse(x, opponentY, this.constructedState.get());
        if (distributionResult.endUpInKalah === false) {
            console.log('CONSTRUCTED STATE DEVIENS null (click)')
            this.constructedState = MGPOptional.empty();
            return this.chooseMove(this.currentMove.get(), this.getState());
        } else {
            console.log('CONSTRUCTED STATE DEVIENS LE post distrib house (click)')
            this.constructedState = MGPOptional.of(distributionResult.resultingState);
            this.board = this.constructedState.get().board;
            return MGPValidation.SUCCESS;
        }
    }
    public override cancelMoveAttempt(): void {
        this.currentMove = MGPOptional.empty();
        console.log('CONSTRUCTED STATE DEVIENS vide (cma)')
        this.constructedState = MGPOptional.empty();
    }
}

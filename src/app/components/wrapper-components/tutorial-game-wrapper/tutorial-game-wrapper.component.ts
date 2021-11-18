import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from 'src/app/jscaip/Move';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { assert, display, Utils } from 'src/app/utils/utils';
import { TutorialStep } from './TutorialStep';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialFailure } from './TutorialFailure';
import { GameService } from 'src/app/services/GameService';
import { AbstractGameState } from 'src/app/jscaip/GameState';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-tutorial-game-wrapper',
    templateUrl: './tutorial-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public static VERBOSE: boolean = false;

    public COMPLETED_TUTORIAL_MESSAGE: string = $localize`Congratulations, you completed the tutorial.`;

    public steps: TutorialStep[] = [];
    public successfulSteps: number = 0;
    public stepIndex: number = -1;
    public currentMessage: string | null;
    public currentReason: string | null;
    public moveAttemptMade: boolean = false;
    public stepFinished: boolean[];
    public tutorialOver: boolean = false;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                public router: Router,
                authenticationService: AuthenticationService,
                public cdr: ChangeDetectorRef,
                public gameService: GameService)
    {
        super(componentFactoryResolver, actRoute, authenticationService);
        display(TutorialGameWrapperComponent.VERBOSE, 'TutorialGameWrapperComponent.constructor');
    }
    public getNumberOfSteps(): number {
        return this.steps.length;
    }
    public getCurrentStepTitle(): string {
        if (this.steps.length > 0) {
            return this.steps[this.stepIndex].title;
        } else {
            return '';
        }
    }
    public ngAfterViewInit(): void {
        display(TutorialGameWrapperComponent.VERBOSE, 'TutorialGameWrapperComponent.ngAfterViewInit');
        this.afterGameIncluderViewInit();
        this.start();
    }
    public start(): void {
        const tutorial: TutorialStep[] = this.gameComponent.tutorial;
        this.startTutorial(tutorial);
    }
    public startTutorial(tutorial: TutorialStep[]): void {
        display(TutorialGameWrapperComponent.VERBOSE,
                { tutorialGameWrapperComponent_startTutorial: { tutorial } });
        this.steps = tutorial;
        this.tutorialOver = false;
        this.stepFinished = this.getCompletionArray();
        this.successfulSteps = 0;
        this.showStep(0);
    }
    private getCompletionArray(): boolean[] {
        return this.steps.map(() => {
            return false;
        });
    }
    public changeStep(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        this.showStep(Number.parseInt(target.value, 10));
    }
    private showStep(stepIndex: number): void {
        display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapperComponent.showStep(' + stepIndex + ')');
        this.moveAttemptMade = false;
        this.stepFinished[stepIndex] = false;
        this.updateSuccessCount();
        this.stepIndex = stepIndex;
        const currentStep: TutorialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.instruction;
        this.currentReason = null;
        this.gameComponent.rules.node =
            new MGPNode(currentStep.state, MGPOptional.empty(), currentStep.previousMove);
        this.gameComponent.updateBoard();
        this.cdr.detectChanges();
    }
    public async onLegalUserMove(move: Move): Promise<void> {
        display(TutorialGameWrapperComponent.VERBOSE, { tutorialGameWrapper_onLegalUserMove: { move } });
        const currentStep: TutorialStep = this.steps[this.stepIndex];
        const isLegalMove: boolean = this.gameComponent.rules.choose(move);
        assert(isLegalMove, 'It should be impossible to call onLegalUserMove with an illegal move');
        display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapper.onLegalUserMove: legal move');
        this.gameComponent.updateBoard();
        this.moveAttemptMade = true;
        if (currentStep.isPredicate()) {
            const resultingState: AbstractGameState = this.gameComponent.rules.node.gameState;
            const moveValidity: MGPValidation = Utils.getNonNullable(currentStep.predicate)(move, resultingState);
            if (moveValidity.isSuccess()) {
                this.showStepSuccess();
            } else {
                this.currentReason = moveValidity.getReason();
            }
        } else if (currentStep.isAnyMove()) {
            display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapper.onLegalUserMove: awaited move!');
            this.showStepSuccess();
        } else if (currentStep.isMove() && currentStep.acceptedMoves.some((m: Move) => m.equals(move))) {
            display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapper.onLegalUserMove: awaited move!');
            this.showStepSuccess();
        } else {
            display(TutorialGameWrapperComponent.VERBOSE,
                    'tutorialGameWrapper.onLegalUserMove: not the move that was awaited.');
            this.currentReason = currentStep.getFailureMessage();
        }
        this.cdr.detectChanges();
    }
    public retry(): void {
        display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapper.retry');
        this.moveAttemptMade = false;
        this.showStep(this.stepIndex);
    }
    public onUserClick(elementName: string): MGPValidation {
        display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapper.onUserClick(' + elementName + ')');
        this.currentReason = null;
        if (this.stepFinished[this.stepIndex] || this.moveAttemptMade) {
            return MGPValidation.failure(TutorialFailure.STEP_FINISHED());
        }
        const currentStep: TutorialStep = this.steps[this.stepIndex];
        if (currentStep.isClick()) {
            this.gameComponent.updateBoard();
            if (Utils.getNonNullable(currentStep.acceptedClicks).some((m: string) => m === elementName)) {
                this.showStepSuccess();
            } else {
                this.currentMessage = Utils.getNonNullable(currentStep.failureMessage);
            }
            return MGPValidation.SUCCESS;
        } else if (currentStep.isMove() || currentStep.isPredicate() || currentStep.isAnyMove()) {
            setTimeout(() => {
                this.cdr.detectChanges();
            }, 10);
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(TutorialFailure.INFORMATIONAL_STEP());
        }
    }
    public onCancelMove(reason?: string): void {
        display(TutorialGameWrapperComponent.VERBOSE,
                'tutorialGameWrapperComponent.onCancelMove(' + reason + ')');
        // this.moveAttemptMade = true;
        if (reason !== undefined) {
            this.currentReason = reason;
        }
        this.cdr.detectChanges();
    }
    private showStepSuccess(): void {
        display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapperComponent.showStepSuccess()');
        const currentStep: TutorialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.getSuccessMessage();
        this.stepFinished[this.stepIndex] = true;
        this.updateSuccessCount();
    }
    private updateSuccessCount(): void {
        let count: number = 0;
        for (const stepSuccess of this.stepFinished) {
            if (stepSuccess) {
                count++;
            }
        }
        this.successfulSteps = count;
    }
    public next(): void {
        if (this.steps[this.stepIndex].isInformation()) {
            this.stepFinished[this.stepIndex] = true;
            this.updateSuccessCount();
        }
        if (this.stepFinished.length === this.successfulSteps) {
            this.currentMessage = this.COMPLETED_TUTORIAL_MESSAGE;
            this.tutorialOver = true;
        } else {
            let indexUndone: number = (this.stepIndex + 1) % this.steps.length;
            while (this.stepFinished[indexUndone] === true) {
                indexUndone = (indexUndone + 1) % this.steps.length;
            }
            this.showStep(indexUndone);
        }
    }
    public async showSolution(): Promise<void> {
        display(TutorialGameWrapperComponent.VERBOSE, 'tutorialGameWrapper.showSolution()');
        const step: TutorialStep = this.steps[this.stepIndex];
        if (step.hasSolution()) {
            const awaitedMove: Move = step.getSolution();
            this.showStep(this.stepIndex);
            this.gameComponent.rules.choose(awaitedMove);
            this.gameComponent.updateBoard();
            this.moveAttemptMade = true;
            this.currentMessage = step.getSuccessMessage();
            this.cdr.detectChanges();
        }
        // TODO FOR REVIEW: else, throw error or do nothing?
    }
    public playLocally(): void {
        const game: string = Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo'));
        this.router.navigate(['local/' + game]);
    }
    public createGame(): void {
        const game: string = Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo'));
        this.gameService.createGameAndRedirectOrShowError(game);
    }
    public getPlayerName(): string {
        return ''; // Not important for tutorial
    }
}

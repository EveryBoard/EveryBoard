import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from 'src/app/jscaip/Move';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { UserService } from 'src/app/services/UserService';
import { assert, display } from 'src/app/utils/utils';
import { DidacticialStep } from './DidacticialStep';
import { MGPValidation } from 'src/app/utils/MGPValidation';

import { abaloneTutorial } from 'src/app/games/abalone/AbaloneTutorial';
import { awaleTutorial } from './didacticials/awale-didacticial';
import { coerceoTutorial } from './didacticials/coerceo-didacticial';
import { dvonnTutorial } from './didacticials/dvonn-didacticial';
import { epaminondasTutorial } from './didacticials/epaminondas-didacticial';
import { encapsuleTutorial } from './didacticials/encapsule-tutorial';
import { gipfTutorial } from './didacticials/gipf-didacticial';
import { goTutorial } from './didacticials/go-didacticial';
import { kamisadoTutorial } from './didacticials/kamisado-didacticial';
import { linesOfActionTutorial } from 'src/app/games/lines-of-action/LinesOfActionDidacticial';
import { p4Tutorial } from './didacticials/p4-didacticial';
import { pentagoTutorial } from 'src/app/games/pentago/pentago.didacticial';
import { pylosTutorial } from './didacticials/pylos-didacticial';
import { quartoTutorial } from './didacticials/quarto-didacticial';
import { quixoTutorial } from './didacticials/quixo-didacticial';
import { reversiTutorial } from './didacticials/reversi-didacticial';
import { saharaTutorial } from './didacticials/sahara-didacticial';
import { siamTutorial } from './didacticials/siam-didacticial';
import { sixTutorial } from './didacticials/six-didacticial';
import { tablutTutorial } from './didacticials/tablut-didacticial';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { DidacticialFailure } from './DidacticialFailure';
import { GameService } from 'src/app/services/GameService';

@Component({
    selector: 'app-didacticial-game-wrapper',
    templateUrl: './didacticial-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DidacticialGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public static VERBOSE: boolean = false;

    public COMPLETED_TUTORIAL_MESSAGE: string = $localize`Félicitation, vous avez fini le tutoriel.`;

    public steps: DidacticialStep[];
    public successfulSteps: number = 0;
    public stepIndex: number = 0;
    public currentMessage: string;
    public currentReason: string;
    public moveAttemptMade: boolean = false;
    public stepFinished: boolean[];
    public tutorialOver: boolean = false;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService,
                authenticationService: AuthenticationService,
                public cdr: ChangeDetectorRef,
                public gameService: GameService)
    {
        super(componentFactoryResolver, actRoute, router, userService, authenticationService);
        display(DidacticialGameWrapperComponent.VERBOSE, 'DidacticialGameWrapperComponent.constructor');
    }
    private getCompletionArray(): boolean[] {
        return this.steps.map(() => {
            return false;
        });
    }
    public getNumberOfSteps(): number {
        if (this.steps == null) {
            return 0;
        }
        return this.steps.length;
    }
    public getCurrentStepTitle(): string {
        if (this.steps == null) {
            return '';
        }
        return this.steps[this.stepIndex].title;
    }
    public ngAfterViewInit(): void {
        display(DidacticialGameWrapperComponent.VERBOSE, 'DidacticialGameWrapperComponent.ngAfterViewInit');
        this.afterGameIncluderViewInit();
        this.start();
    }
    private start(): void {
        const didacticial: DidacticialStep[] = this.getDidacticial();
        this.startDidacticial(didacticial);
    }
    public getDidacticial(): DidacticialStep[] {
        const game: string = this.actRoute.snapshot.paramMap.get('compo');
        const didacticials: { [key: string]: DidacticialStep[] } = {
            Abalone: abaloneTutorial,
            Awale: awaleTutorial,
            Coerceo: coerceoTutorial,
            Dvonn: dvonnTutorial,
            Encapsule: encapsuleTutorial,
            Epaminondas: epaminondasTutorial,
            Gipf: gipfTutorial,
            Go: goTutorial,
            Kamisado: kamisadoTutorial,
            LinesOfAction: linesOfActionTutorial,
            P4: p4Tutorial,
            Pentago: pentagoTutorial,
            Pylos: pylosTutorial,
            Quarto: quartoTutorial,
            Quixo: quixoTutorial,
            Reversi: reversiTutorial,
            Sahara: saharaTutorial,
            Siam: siamTutorial,
            Six: sixTutorial,
            Tablut: tablutTutorial,
        };
        if (didacticials[game] == null) {
            throw new Error('Unknown Game ' + game + '.');
        }
        return didacticials[game];
    }
    public startDidacticial(didacticial: DidacticialStep[]): void {
        display(
            DidacticialGameWrapperComponent.VERBOSE,
            { didacticialGameWrapperComponent_startDidacticial: { didacticial } });
        this.steps = didacticial;
        this.tutorialOver = false;
        this.stepFinished = this.getCompletionArray();
        this.successfulSteps = 0;
        this.showStep(0);
    }
    public changeStep(stepIndex: string): void {
        this.showStep(Number.parseInt(stepIndex, 10));
    }
    private showStep(stepIndex: number): void {
        display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapperComponent.showStep(' + stepIndex + ')');
        this.moveAttemptMade = false;
        this.stepFinished[stepIndex] = false;
        this.updateSuccessCount();
        this.stepIndex = stepIndex;
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.instruction;
        this.currentReason = null;
        this.gameComponent.rules.node = new MGPNode(null, null, currentStep.state);
        this.gameComponent.updateBoard();
        this.cdr.detectChanges();
    }
    public async onLegalUserMove(move: Move): Promise<void> {
        display(DidacticialGameWrapperComponent.VERBOSE, { didacticialGameWrapper_onLegalUserMove: { move } });
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        const isLegalMove: boolean = this.gameComponent.rules.choose(move);
        assert(isLegalMove, 'It should be impossible to call onLegalUserMove with an illegal move');
        display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapper.onLegalUserMove: legal move');
        this.gameComponent.updateBoard();
        this.moveAttemptMade = true;
        if (currentStep.isPredicate()) {
            const resultingState: GamePartSlice = this.gameComponent.rules.node.gamePartSlice;
            const moveValidity: MGPValidation = currentStep.predicate(move, resultingState);
            if (moveValidity.isSuccess()) {
                this.showStepSuccess();
            } else {
                this.currentReason = moveValidity.getReason();
            }
        } else if (currentStep.isAnyMove() || currentStep.acceptedMoves.some((m: Move) => m.equals(move))) {
            display(DidacticialGameWrapperComponent.VERBOSE,
                    'didacticialGameWrapper.onLegalUserMove: awaited move!');
            this.showStepSuccess();
        } else {
            display(DidacticialGameWrapperComponent.VERBOSE,
                    'didacticialGameWrapper.onLegalUserMove: not the move that was awaited.');
            this.currentReason = currentStep.failureMessage;
        }
        this.cdr.detectChanges();
    }
    public retry(): void {
        display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapper.retry');
        this.moveAttemptMade = false;
        this.showStep(this.stepIndex);
    }
    public onUserClick: (elementName: string) => MGPValidation = (elementName: string) => {
        display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapper.onUserClick(' + elementName + ')');
        this.currentReason = null;
        if (this.stepFinished[this.stepIndex] || this.moveAttemptMade) {
            return MGPValidation.failure(DidacticialFailure.STEP_FINISHED);
        }
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        if (currentStep.isClick()) {
            this.gameComponent.updateBoard();
            if (currentStep.acceptedClicks.some((m: string) => m === elementName)) {
                this.showStepSuccess();
            } else {
                this.currentMessage = currentStep.failureMessage;
            }
            return MGPValidation.SUCCESS;
        } else if (currentStep.isMove() || currentStep.isPredicate()) {
            setTimeout(() => {
                this.cdr.detectChanges();
            }, 10);
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(DidacticialFailure.INFORMATIONAL_STEP);
        }
    }
    public onCancelMove: (reason?: string) => void = (reason?: string) => {
        display(DidacticialGameWrapperComponent.VERBOSE,
                'didacticialGameWrapperComponent.onCancelMove(' + reason + ')');
        // this.moveAttemptMade = true;
        this.currentReason = reason;
        this.cdr.detectChanges();
    }
    private showStepSuccess(): void {
        display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapperComponent.showStepSuccess()');
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.successMessage;
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
        display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapper.showSolution()');
        const step: DidacticialStep = this.steps[this.stepIndex];
        let awaitedMove: Move;
        if (step.acceptedMoves != null && step.acceptedMoves.length > 0) {
            awaitedMove = step.acceptedMoves[0];
        } else {
            awaitedMove = step.solutionMove;
        }
        this.showStep(this.stepIndex);
        this.gameComponent.rules.choose(awaitedMove);
        this.gameComponent.updateBoard();
        this.moveAttemptMade = true;
        this.currentMessage = step.successMessage;
        this.cdr.detectChanges();
    }
    public playLocally(): void {
        const game: string = this.actRoute.snapshot.paramMap.get('compo');
        this.router.navigate(['local/' + game]);
    }
    public createGame(): void {
        const game: string = this.actRoute.snapshot.paramMap.get('compo');
        this.gameService.createGameAndRedirectOrShowError(game);
    }
}

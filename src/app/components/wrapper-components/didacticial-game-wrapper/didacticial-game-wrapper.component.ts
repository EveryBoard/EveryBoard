import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Move } from 'src/app/jscaip/Move';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { UserService } from 'src/app/services/user/UserService';
import { display } from 'src/app/utils/collection-lib/utils';
import { awaleDidacticial } from './didacticials/awale-didacticial';
import { p4Didacticial } from './didacticials/p4-didacticial';
import { DidacticialStep } from './DidacticialStep';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { dvonnDidacticial } from './didacticials/dvonn-didacticial';
import { kamisadoDidacticial } from './didacticials/kamisado-didacticial';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { goDidacticial } from './didacticials/go-didacticial';
import { epaminondasDidacticial } from './didacticials/epaminondas-didacticial';

@Component({
    selector: 'app-didacticial-game-wrapper',
    templateUrl: './didacticial-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DidacticialGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public static VERBOSE: boolean = false;

    public COMPLETED_TUTORIAL_MESSAGE: string = 'Félicitation, vous avez fini le tutoriel.'

    public steps: DidacticialStep[];
    public stepIndex: number = 0;
    public currentMessage: string;
    public currentReason: string;
    public stepAttemptMade: boolean = false;
    public stepFinished: boolean[];
    public tutorialOver: boolean = false;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
        actRoute: ActivatedRoute,
        router: Router,
        userService: UserService,
        authenticationService: AuthenticationService,
        public cdr: ChangeDetectorRef)
    {
        super(componentFactoryResolver, actRoute, router, userService, authenticationService);
        display(DidacticialGameWrapperComponent.VERBOSE, 'DidacticialGameWrapperComponent.constructor');
    }
    public getStepColor(index: number): string {
        if (this.stepFinished[index]) {
            return 'green';
        } else {
            return 'red';
        }
    }
    private getCompletionArray(): boolean[] {
        return this.steps.map(() => {
            return false;
        });
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
    private getDidacticial(): DidacticialStep[] {
        const game: string = this.actRoute.snapshot.paramMap.get('compo');
        const didacticials: { [key: string]: DidacticialStep[] } = {
            Awale: awaleDidacticial,
            Dvonn: dvonnDidacticial,
            Kamisado: kamisadoDidacticial,
            Epaminondas: epaminondasDidacticial,
            Go: goDidacticial,
            P4: p4Didacticial,
            Quarto: [
                new DidacticialStep('title zero', 'instruction zero', QuartoPartSlice.getInitialSlice(), [], [], null, null),
                new DidacticialStep('title one', 'instruction one', QuartoPartSlice.getInitialSlice(), [], [], null, null),
            ],
        };
        if (didacticials[game] == null) {
            throw new Error('Unknown Game ' + game);
        }
        return didacticials[game];
    }
    public startDidacticial(didacticial: DidacticialStep[]): void {
        this.steps = didacticial;
        this.tutorialOver = false;
        this.stepFinished = this.getCompletionArray();
        this.showStep(0);
    }
    private showStep(stepIndex: number): void {
        this.stepAttemptMade = false;
        this.stepIndex = stepIndex;
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.instruction;
        this.currentReason = null;
        this.gameComponent.rules.node = new MGPNode(null, null, currentStep.slice, 0);
        this.gameComponent.updateBoard();
        this.cdr.detectChanges();
    }
    public async onValidUserMove(move: Move): Promise<void> {
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.gameComponent.rules.choose(move);
        this.gameComponent.updateBoard();
        if (currentStep.acceptedMoves.some((m: Move) => m.equals(move))) {
            this.showStepSuccess();
        } else {
            this.currentMessage = currentStep.failureMessage;
        }
        this.stepAttemptMade = true;
        this.cdr.detectChanges();
    }
    public retry(): void {
        this.stepAttemptMade = false;
        this.showStep(this.stepIndex);
    }
    public onUserClick: (elementName: string) => MGPValidation = (elementName: string) => {
        this.currentReason = null;
        if (this.stepAttemptMade) {
            return MGPValidation.failure('Step attemps already made.');
        }
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        if (currentStep.isClick()) {
            this.gameComponent.updateBoard();
            if (currentStep.acceptedClicks.some((m: string) => m === elementName)) {
                this.showStepSuccess();
            } else {
                this.currentMessage = currentStep.failureMessage;
            }
            this.stepAttemptMade = true;
            return MGPValidation.SUCCESS;
        } else {
            return currentStep.isMove() ? MGPValidation.SUCCESS : MGPValidation.failure('Step is not awaiting a move.');
        }
    }
    public onCancelMove: (reason?: string) => void = (reason?: string) => {
        this.stepAttemptMade = true;
        this.currentReason = reason;
        this.cdr.detectChanges();
    }
    private showStepSuccess(): void {
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.successMessage;
        this.stepFinished[this.stepIndex] = true;
    }
    public next(): void {
        if (this.steps[this.stepIndex].isNothing()) {
            this.stepFinished[this.stepIndex] = true;
        }
        if (this.stepFinished.every((value: boolean) => value === true)) {
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
}

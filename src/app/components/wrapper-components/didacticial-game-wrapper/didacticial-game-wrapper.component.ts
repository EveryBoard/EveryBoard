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
import { dvonnDidacticial } from './didacticials/dvonn-didacticial';
import { kamisadoDidacticial } from './didacticials/kamisado-didacticial';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { goDidacticial } from './didacticials/go-didacticial';
import { epaminondasDidacticial } from './didacticials/epaminondas-didacticial';
import { reversiDidacticial } from './didacticials/reversi-didacticial';
import { saharaDidacticial } from './didacticials/sahara-didacticial';
import { tablutDidacticial } from './didacticials/tablut-didacticial';
import { siamDidacticial } from './didacticials/siam-didacticial';
import { quartoDidacticial } from './didacticials/quarto-didacticial';

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
    public moveAttemptMade: boolean = false;
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
            Quarto: quartoDidacticial,
            Reversi: reversiDidacticial,
            Sahara: saharaDidacticial,
            Siam: siamDidacticial,
            Tablut: tablutDidacticial,
        };
        if (didacticials[game] == null) {
            throw new Error('Unknown Game ' + game);
        }
        return didacticials[game];
    }
    public startDidacticial(didacticial: DidacticialStep[]): void {
        display(
            DidacticialGameWrapperComponent.VERBOSE,
            { didacticialGameWrapperComponent_startDidacticial: { didacticial }});
        this.steps = didacticial;
        this.tutorialOver = false;
        this.stepFinished = this.getCompletionArray();
        this.showStep(0);
    }
    private showStep(stepIndex: number): void {
        display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapperComponent.showStep(' + stepIndex + ')');
        this.moveAttemptMade = false;
        this.stepFinished[stepIndex] = false;
        this.stepIndex = stepIndex;
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.instruction;
        this.currentReason = null;
        this.gameComponent.rules.node = new MGPNode(null, null, currentStep.slice, 0);
        this.gameComponent.updateBoard();
        this.cdr.detectChanges();
    }
    public async onValidUserMove(move: Move): Promise<void> {
        display(DidacticialGameWrapperComponent.VERBOSE, { didacticialGameWrapper_onValidUserMove: { move }});
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        const isLegalMove: boolean = this.gameComponent.rules.choose(move);
        if (isLegalMove) {
            display(DidacticialGameWrapperComponent.VERBOSE, 'didacticialGameWrapper.onValidUserMove: legal move');
            this.gameComponent.updateBoard();
            this.moveAttemptMade = true;
            if (currentStep.acceptedMoves.some((m: Move) => m.equals(move))) {
                display(
                    DidacticialGameWrapperComponent.VERBOSE,
                    'didacticialGameWrapper.onValidUserMove: awaited move!');
                this.showStepSuccess();
            } else {
                this.currentMessage = currentStep.failureMessage;
            }
        } else {
            this.currentMessage = currentStep.failureMessage;
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
            return MGPValidation.failure('Step finished.');
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
        } else if (currentStep.isMove()) {
            setTimeout(() => {
                this.cdr.detectChanges();
            }, 10);
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Step is not awaiting actions.');
        }
    }
    public onCancelMove: (reason?: string) => void = (reason?: string) => {
        display(
            DidacticialGameWrapperComponent.VERBOSE,
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
    }
    public next(): void {
        if (this.steps[this.stepIndex].isInformation()) {
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

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

@Component({
    selector: 'app-didacticial-game-wrapper',
    templateUrl: './didacticial-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DidacticialGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public static VERBOSE: boolean = true;

    public COMPLETED_TUTORIAL_MESSAGE: string = 'Félicitation, vous avez fini le tutoriel.'

    public steps: DidacticialStep[];
    public stepIndex: number = 0;
    public currentMessage: string;
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
        switch (game) {
            case 'Awale':
                return awaleDidacticial;
            case 'Dvonn':
                return dvonnDidacticial;
            case 'P4':
                return p4Didacticial;
            case 'Quarto':
                return [
                    new DidacticialStep('title 0', 'instruction 0', QuartoPartSlice.getInitialSlice(), [], [], null, null),
                    new DidacticialStep('title 1', 'instruction 1', QuartoPartSlice.getInitialSlice(), [], [], null, null),
                ];
            default:
                throw new Error('TODO: name that shit');
        }
    }
    public startDidacticial(didacticial: DidacticialStep[]): void {
        console.log('start didacticial indeed called');
        this.steps = didacticial;
        this.tutorialOver = false;
        this.stepFinished = this.getCompletionArray();
        this.showStep(0);
    }
    private showStep(stepIndex: number): void {
        console.log('showStep ' + stepIndex);
        this.stepAttemptMade = false;
        this.stepIndex = stepIndex;
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.instruction;
        this.gameComponent.rules.node = new MGPNode(null, null, currentStep.slice, 0);
        this.gameComponent.updateBoard();
        this.cdr.detectChanges();
    }
    public async onValidUserMove(move: Move): Promise<void> {
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        if (currentStep.isMove()) {
            console.log('didacticial was indeed awaiting a move');
            this.gameComponent.rules.choose(move);
            this.gameComponent.updateBoard();
            if (currentStep.acceptedMoves.some((m: Move) => m.equals(move))) {
                console.log('accepted move was given');
                this.showStepSuccess();
            } else {
                this.currentMessage = currentStep.failureMessage;
                console.log('not accepted move was given');
            }
            this.stepAttemptMade = true;
            this.cdr.detectChanges();
        } else {
            console.log('didacticial was not awaiting a move');
        }
    }
    public retry(): void {
        console.log('retry');
        this.stepAttemptMade = false;
        this.showStep(this.stepIndex);
    }
    public onUserClick: (elementName: string) => boolean = (elementName: string) => {
        console.log('didacticial-game-wrapper onUserClick on ' + elementName);
        if (this.stepAttemptMade) {
            console.log('step finished, don\'t click');
            return false;
        }
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        if (currentStep.isClick()) {
            console.log('didacticial was indeed awaiting a click');
            this.gameComponent.updateBoard();
            if (currentStep.acceptedClicks.some((m: string) => m === elementName)) {
                console.log('accepted click was done');
                this.showStepSuccess();
            } else {
                this.currentMessage = currentStep.failureMessage;
                console.log('not accepted click was made');
            }
            this.stepAttemptMade = true;
            return true;
        } else {
            return currentStep.isMove();
        }
    }
    public onCancelMove: (reason?: string) => void = (reason?: string) => {
        console.log("currentMessage is now: " + reason);
        this.stepAttemptMade = true;
        this.currentMessage = reason;
        this.cdr.detectChanges();
    }
    private showStepSuccess(): void {
        console.log('show step success');
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.successMessage;
        this.stepFinished[this.stepIndex] = true;
    }
    public next(): void {
        console.log('next')
        if (this.steps[this.stepIndex].isNothing()) {
            console.log('info checked');
            this.stepFinished[this.stepIndex] = true;
        }
        console.log({ step: this.steps, finished: this.stepFinished })
        if (this.stepFinished.every((value: boolean) => value === true)) {
            console.log('finished, don\'t need to go next');
            this.currentMessage = this.COMPLETED_TUTORIAL_MESSAGE;
            this.tutorialOver = true;
        } else if (this.stepIndex + 1 < this.steps.length) {
            console.log('can go next cause ' + this.stepIndex + ' < ' + this.steps.length);
            this.showStep(this.stepIndex + 1);
        } else {
            throw new Error('what the hell');
        }
    }
}

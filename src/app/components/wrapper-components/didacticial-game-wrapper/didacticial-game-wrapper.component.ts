import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Move } from 'src/app/jscaip/Move';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { UserService } from 'src/app/services/user/UserService';
import { display } from 'src/app/utils/collection-lib/utils';
import { awaleDidacticial, DidacticialStep } from './DidacticialStep';

@Component({
    selector: 'app-didacticial-game-wrapper',
    templateUrl: './didacticial-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DidacticialGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public static VERBOSE: boolean = true;

    public steps: DidacticialStep[] = awaleDidacticial; // TODO: OF FUCK NOT THAT
    public stepIndex: number = 0;
    public currentMessage: string;
    public mustRetry: boolean = false;

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
    public ngAfterViewInit(): void {
        display(DidacticialGameWrapperComponent.VERBOSE, 'DidacticialGameWrapperComponent.ngAfterViewInit');
        this.afterGameIncluderViewInit();
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        this.currentMessage = currentStep.instruction;
        this.cdr.detectChanges();
    }
    private showStep(stepIndex: number): void {
        console.log('showStep ' + stepIndex);
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
                this.currentMessage = currentStep.successMessage;
            } else {
                this.currentMessage = currentStep.failureMessage;
                this.mustRetry = true;
                console.log('not accepted move was given');
            }
            this.cdr.detectChanges();
        } else {
            console.log('didacticial was not awaiting a move');
        }
    }
    public retry(): void {
        this.mustRetry = false;
        this.showStep(this.stepIndex);
    }
    public onUserClick: (elementName: string) => boolean = (elementName: string) => {
        console.log('didacticial-game-wrapper onUserClick on ' + elementName);
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        if (currentStep.isClick()) {
            console.log('didacticial was indeed awaiting a click');
            this.gameComponent.updateBoard();
            if (currentStep.acceptedClicks.some((m: string) => m === elementName)) {
                console.log('accepted click was done');
                this.currentMessage = currentStep.successMessage;
            } else {
                this.currentMessage = currentStep.failureMessage;
                this.mustRetry = true;
                console.log('not accepted click was made');
            }
        } else {
            console.log('didacticial is not awaiting a click');
        }
        return true;
    }
    public next(): void {
        this.showStep(this.stepIndex + 1);
    }
}

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { AwaleMove } from 'src/app/games/awale/awale-move/AwaleMove';
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
    public async onValidUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number): Promise<void> {
        const currentStep: DidacticialStep = this.steps[this.stepIndex];
        if (currentStep.isMove()) {
            if (currentStep.acceptedMoves.some((m: Move) => m.equals(move))) {
                this.currentMessage = currentStep.successMessage;
                this.gameComponent.rules.choose(move);
                this.gameComponent.updateBoard();
                this.cdr.detectChanges();
            } else {
                this.currentMessage = currentStep.failureMessage;
            }
        }
    }
}

import { Component, ComponentFactoryResolver, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { GameWrapper } from '../GameWrapper';
import { Move } from '../../../jscaip/Move';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user/UserService';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public VERBOSE = false;

    public aiDepth: number = 5;

    public botTimeOut: number = 500; // this.aiDepth * 500;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService,
                authenticationService: AuthenticationService,
                viewContainerRef: ViewContainerRef,
                private cdr: ChangeDetectorRef) {
        super(componentFactoryResolver, actRoute, router, userService, authenticationService, viewContainerRef);
        if (this.VERBOSE) console.log("LocalGameWrapper Constructed: "+(this.gameComponent!=null));
    }
    public ngAfterViewInit() {
        setTimeout(() => {
            this.authenticationService.getJoueurObs().subscribe(user => {
                this.userName = user.pseudo;
                if (this.players[0] !== "bot") this.players[0] = user.pseudo;
                if (this.players[1] !== "bot") this.players[1] = user.pseudo;
            });
            if (this.VERBOSE) console.log("LocalGameWrapper AfterViewInit: "+(this.gameComponent!=null));
            this.afterGameIncluderViewInit();
            this.cdr.detectChanges();
        }, 1);
    }
    public onValidUserMove(move: Move): boolean {
        if (LocalGameWrapperComponent.VERBOSE) {
            console.log('LocalGameWrapperComponent.onValidUserMove');
        }
        const isLegal: boolean = this.gameComponent.rules.choose(move);
        if (isLegal) {
            this.gameComponent.updateBoard();
            this.proposeAIToPlay();
        }
        return isLegal;
    }
    public proposeAIToPlay() {
        // check if ai's turn has come, if so, make her start after a delay
        const turn = this.gameComponent.rules.node.gamePartSlice.turn % 2;
        if (this.players[turn] === 'bot') {
            // bot's turn
            setTimeout(() => {
                // called only when it's AI's Turn
                if (!this.gameComponent.rules.node.isEndGame()) {
                    const aiMove: Move = this.gameComponent.rules.node.findBestMoveAndSetDepth(this.aiDepth).move;
                    if (this.gameComponent.rules.choose(aiMove)) {  // TODO: remove since useless
                        this.gameComponent.updateBoard();
                        this.cdr.detectChanges();
                        this.proposeAIToPlay();
                    } else {
                        throw new Error("AI choosed illegal move");
                    }
                }
            }, this.botTimeOut);
        }
    }
    public switchPlayerOne() { // totally adaptable to other Rules
        this.switchPlayer(0);
    }
    public switchPlayerTwo() { // totally adaptable to other Rules
        this.switchPlayer(1);
    }
    public switchPlayer(n: 0|1) {
        if (LocalGameWrapperComponent.VERBOSE) console.log("before switching: " + this.players);
        this.players[n] = this.players[n] === 'bot' ? this.authenticationService.getAuthenticatedUser().pseudo : 'bot';
        if (LocalGameWrapperComponent.VERBOSE) console.log("after switching: " + this.players);
        this.proposeAIToPlay();
    }
    get compo(): AbstractGameComponent<Move, GamePartSlice, LegalityStatus> {
        return this.gameComponent;
    }
}
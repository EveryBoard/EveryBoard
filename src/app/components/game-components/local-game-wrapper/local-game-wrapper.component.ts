import { Component, ComponentFactoryResolver, AfterContentInit } from '@angular/core';
import { GameWrapper } from '../GameWrapper';
import { Move } from '../../../jscaip/Move';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/UserService';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
})
export class LocalGameWrapperComponent extends GameWrapper implements AfterContentInit {

    public static VERBOSE = false;

    public aiDepth: number = 2; // TODO: make that a choice of user

    public botTimeOut: number = 500; // this.aiDepth * 500;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService) {
        super(componentFactoryResolver, actRoute, router, userService);
    }
    public ngAfterContentInit() {
        const currentUser: string = this.userService.getCurrentUser();
        this.players = [currentUser, currentUser];
        console.log("localGameWrapper.ngAfterContentInit");
        console.log({compo: this.gameCompo});
        this.afterGameComponentViewProbablyInit();
    }
    public onValidUserMove(move: Move) {
        if (LocalGameWrapperComponent.VERBOSE) {
            console.log('LocalGameWrapperComponent.onValidUserMove');
        }
        this.componentInstance.rules.choose(move);
        this.componentInstance.updateBoard();
        this.proposeAIToPlay();
    }
    public proposeAIToPlay() {
        // check if ai's turn has come, if so, make her start after a delay
        const turn = this.componentInstance.rules.node.gamePartSlice.turn % 2;
        if (this.players[turn] === 'bot') {
            // bot's turn
            setTimeout(() => {
                // called only when it's AI's Turn
                if (!this.componentInstance.rules.node.isEndGame()) {
                    const aiMove: Move = this.componentInstance.rules.node.findBestMoveAndSetDepth(this.aiDepth).move;
                    this.componentInstance.rules.choose(aiMove);
                    this.componentInstance.updateBoard();
                    this.proposeAIToPlay();
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
        this.players[n] = this.players[n] === 'bot' ? this.userService.getCurrentUser() : 'bot';
        this.proposeAIToPlay();
    }
    get compo(): AbstractGameComponent<Move, GamePartSlice, LegalityStatus> {
        return this.componentInstance;
    }
}
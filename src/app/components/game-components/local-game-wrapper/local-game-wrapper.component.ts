import { Component, ComponentFactoryResolver, AfterViewInit,
         ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { GameWrapper } from 'src/app/components/game-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { UserService } from 'src/app/services/user/UserService';
import { Rules } from 'src/app/jscaip/Rules';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public static VERBOSE: boolean = false;

    public playerZeroValue: string = "0";
    public playerOneValue: string = "0";
    public aiDepth: number = 5;
    public winner: string;

    public botTimeOut: number = 1000; // this.aiDepth * 500;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService,
                authenticationService: AuthenticationService,
                private cdr: ChangeDetectorRef) {
        super(componentFactoryResolver, actRoute, router, userService, authenticationService);
        Rules.display(LocalGameWrapperComponent.VERBOSE, "LocalGameWrapper.constructor");
    }
    public ngAfterViewInit() {
        setTimeout(() => {
            this.authenticationService.getJoueurObs().subscribe(user => {
                this.userName = user.pseudo;
                if (this.isAI(this.players[0]) === false) this.players[0] = user.pseudo;
                if (this.isAI(this.players[1]) === false) this.players[1] = user.pseudo;
            });
            Rules.display(LocalGameWrapperComponent.VERBOSE, "LocalGameWrapper AfterViewInit: "+(this.gameComponent!=null));
            this.afterGameIncluderViewInit();
            this.cdr.detectChanges();
        }, 1);
    }
    private isAI(player: string): boolean {
        if (player == null) return false;
        return player.substr(0, 3) === "bot";
    }
    public async onValidUserMove(move: Move): Promise<void> {
        Rules.display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapperComponent.onValidUserMove');

        this.gameComponent.rules.choose(move);
        this.updateBoard();
        this.proposeAIToPlay();
        return Promise.resolve();
    }
    public updateBoard() {
        this.gameComponent.updateBoard();
        if (this.gameComponent.rules.node.isEndGame()) {
            this.endGame = true;
            const boardValue: number = this.gameComponent.rules.node.ownValue;
            if (boardValue !== 0) {
                const intWinner: number = boardValue < 0 ? 1 : 2;
                this.winner = "Joueur " + intWinner + "(" + this.players[intWinner - 1] + ")"
            } else {
                console.log("There was no winner, du cu");
            }
        }
    }
    public proposeAIToPlay() {
        // check if ai's turn has come, if so, make her start after a delay
        if (this.isAITurn()) {
            // bot's turn
            setTimeout(() => {
                // called only when it's AI's Turn
                if (!this.gameComponent.rules.node.isEndGame()) {
                    const aiMove: Move = this.gameComponent.rules.node.findBestMoveAndSetDepth(this.aiDepth).move;
                    if (this.gameComponent.rules.choose(aiMove)) {
                        this.updateBoard();
                        this.cdr.detectChanges();
                        this.proposeAIToPlay();
                    } else {
                        console.log(aiMove);
                        throw new Error("AI choosed illegal move (" + aiMove.toString() + ")");
                    }
                }
            }, this.botTimeOut);
        }
    }
    private isAITurn(): boolean {
        const turn = this.gameComponent.rules.node.gamePartSlice.turn % 2;
        const currentPlayer: string = this.players[turn];
        return this.isAI(currentPlayer);
    }
    public switchPlayerOne() { // totally adaptable to other Rules
        this.switchPlayer(0, this.playerZeroValue);
    }
    public switchPlayerTwo() { // totally adaptable to other Rules
        this.switchPlayer(1, this.playerOneValue);
    }
    public switchPlayer(n: 0|1, value: string) {
        const numberValue: number = Number.parseInt(value);
        if (numberValue === 0) {
            this.players[n] = this.authenticationService.getAuthenticatedUser().pseudo;
        } else {
            this.players[n] = 'bot level '+ value;
            this.aiDepth = numberValue;
        }
        this.proposeAIToPlay();
    }
    public takeBack() {
        if (this.gameComponent.rules.node.gamePartSlice.turn > 0) {
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
            this.gameComponent.updateBoard();
        }
    }
}
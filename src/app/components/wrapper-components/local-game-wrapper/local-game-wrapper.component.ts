import { Component, ComponentFactoryResolver, AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { UserService } from 'src/app/services/UserService';
import { display } from 'src/app/utils/utils';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Minimax } from 'src/app/jscaip/Minimax';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalGameWrapperComponent extends GameWrapper implements AfterViewInit {
    public static VERBOSE: boolean = false;

    public playerZero: string = 'humain';
    public playerOne: string = 'humain';
    public aiZeroDepth: string = '0';
    public aiOneDepth: string = '0';
    public winner: string = null;

    public botTimeOut: number = 1000; // this.aiDepth * 500;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService,
                authenticationService: AuthenticationService,
                public cdr: ChangeDetectorRef)
    {
        super(componentFactoryResolver, actRoute, router, userService, authenticationService);
        display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper.constructor');
    }
    public ngAfterViewInit(): void {
        display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapperComponent.ngAfterViewInit');
        setTimeout(() => {
            display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper.ngAfterViewInit inside timeout');
            this.authenticationService.getJoueurObs().subscribe((user: AuthUser) => {
                this.userName = user.pseudo;
                // if (this.isAI(0) === false) this.players[0] = user.pseudo;
                // if (this.isAI(1) === false) this.players[1] = user.pseudo;
                if (this.isAI(0) === false) this.players[0] = 'humain'; // TODO: clean that
                if (this.isAI(1) === false) this.players[1] = 'humain'; // TODO: clean that
            });
            display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper AfterViewInit: '+(this.gameComponent!=null));
            this.afterGameIncluderViewInit();
            this.cdr.detectChanges();
        }, 1);
    }
    private isAI(player: number): boolean {
        const namePlayer: string = this.players[player];
        if (namePlayer == null) return false;
        return namePlayer !== 'humain';
    }
    public async onLegalUserMove(move: Move): Promise<void> {
        display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapperComponent.onLegalUserMove');

        this.gameComponent.rules.choose(move);
        this.updateBoard();
        this.proposeAIToPlay();
        return Promise.resolve();
    }
    public updateBoard(): void {
        this.gameComponent.updateBoard();
        const minimax: Minimax<Move, GamePartSlice> = this.getPlayingAI();
        const state: GamePartSlice = this.gameComponent.rules.node.gamePartSlice;
        if (this.gameComponent.rules.isGameOver(state)) {
            this.endGame = true;
            const boardValue: number = this.gameComponent.rules.node.getOwnValue(minimax).value;
            // TODO: Rules should adjuge victory, not minimaxes
            if (boardValue !== 0) {
                const intWinner: number = boardValue < 0 ? 1 : 2;
                this.winner = 'Joueur ' + intWinner + '(' + this.players[intWinner - 1] + ')';
            }
        }
    }
    public proposeAIToPlay(): void {
        // check if ai's turn has come, if so, make her start after a delay
        const playingMinimax: Minimax<Move, GamePartSlice> = this.getPlayingAI();
        if (playingMinimax != null) {
            // bot's turn
            setTimeout(() => {
                // called only when it's AI's Turn
                const state: GamePartSlice = this.gameComponent.rules.node.gamePartSlice;
                if (!this.gameComponent.rules.isGameOver(state)) {
                    const turn: number = this.gameComponent.rules.node.gamePartSlice.turn % 2;
                    const currentAiDepth: number = Number.parseInt(turn === 0 ? this.aiZeroDepth : this.aiOneDepth);
                    const aiMove: Move =
                        this.gameComponent.rules.node.findBestMove(currentAiDepth, playingMinimax);
                    if (this.gameComponent.rules.choose(aiMove)) {
                        this.updateBoard();
                        this.cdr.detectChanges();
                        this.proposeAIToPlay();
                    } else {
                        throw new Error('AI choosed illegal move (' + aiMove.toString() + ')');
                    }
                } else {
                    console.log('l\'ia considère la patie comme finie')
                }
            }, this.botTimeOut);
        }
    }
    private getPlayingAI(): Minimax<Move, GamePartSlice> {
        const turn: number = this.gameComponent.rules.node.gamePartSlice.turn % 2;
        return this.gameComponent.availableMinimaxes.find((a) => a.name === this.players[turn]);
    }
    public switchPlayerZero(): void { // totally adaptable to other Rules
        this.switchPlayer(0, this.playerZero);
    }
    public switchPlayerOne(): void { // totally adaptable to other Rules
        this.switchPlayer(1, this.playerOne);
    }
    public switchPlayer(n: 0|1, player: string): void {
        this.players[n] = player;
        if (player !== 'humain' && [this.aiZeroDepth, this.aiOneDepth][n] !== '0') {
            this.proposeAIToPlay();
        }
    }
    public takeBack(): void {
        if (this.gameComponent.rules.node.gamePartSlice.turn > 0) {
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
            this.gameComponent.updateBoard();
        }
    }
    public restartGame(): void {
        const state: GamePartSlice = this.gameComponent.rules.stateType['getInitialSlice']();
        this.gameComponent.rules.node = new MGPNode(null, null, state);
        this.gameComponent.updateBoard();
        this.endGame = false;
        this.winner = null;
    }
}

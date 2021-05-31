import { Component, ComponentFactoryResolver, AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { UserService } from 'src/app/services/UserService';
import { display } from 'src/app/utils/utils';
import { createdNodes, MGPNode } from 'src/app/jscaip/MGPNode';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Minimax } from 'src/app/jscaip/Minimax';
import { GameStatus } from 'src/app/jscaip/Rules';
import { Player } from 'src/app/jscaip/Player';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalGameWrapperComponent extends GameWrapper implements AfterViewInit {
    public static VERBOSE: boolean = false;

    public aiDepths: [string, string] = ['0', '0'];
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
        this.players = ['humain', 'humain'];
        display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper.constructor');
    }
    public getCreatedNodes(): number {
        return createdNodes;
    }
    public ngAfterViewInit(): void {
        display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapperComponent.ngAfterViewInit');
        setTimeout(() => {
            display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper.ngAfterViewInit inside timeout');
            display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper AfterViewInit: '+(this.gameComponent!=null));
            this.afterGameIncluderViewInit();
            this.cdr.detectChanges();
        }, 1);
    }
    public updatePlayer(player: 0|1): void {
        if (this.players[player] !== 'humain' && this.aiDepths[player] !== '0') {
            this.proposeAIToPlay();
        }
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
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
        if (gameStatus.isEndGame === true) {
            this.endGame = true;
            if (gameStatus.winner !== Player.NONE) {
                this.winner = 'Joueur ' + (gameStatus.winner.value + 1);
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
                const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
                if (gameStatus === GameStatus.ONGOING) {
                    const turn: number = this.gameComponent.rules.node.gamePartSlice.turn % 2;
                    const currentAiDepth: number = Number.parseInt(this.aiDepths[turn % 2]);
                    const aiMove: Move =
                        this.gameComponent.rules.node.findBestMove(currentAiDepth, playingMinimax);
                    if (this.gameComponent.rules.choose(aiMove)) {
                        this.updateBoard();
                        this.cdr.detectChanges();
                        this.proposeAIToPlay();
                    } else {
                        throw new Error('AI choosed illegal move (' + aiMove.toString() + ')');
                    }
                }
            }, this.botTimeOut);
        }
    }
    private getPlayingAI(): Minimax<Move, GamePartSlice> {
        const turn: number = this.gameComponent.rules.node.gamePartSlice.turn % 2;
        return this.gameComponent.availableMinimaxes.find((a: Minimax<Move, GamePartSlice, LegalityStatus>) => {
            return a.name === this.players[turn];
        });
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
        if (this.players[Player.ZERO.value] !== 'humain' && this.aiDepths[Player.ZERO.value] !== '0') {
            this.proposeAIToPlay();
        }
    }
}

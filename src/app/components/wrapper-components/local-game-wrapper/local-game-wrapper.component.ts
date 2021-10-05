import { Component, ComponentFactoryResolver, AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { assert, display } from 'src/app/utils/utils';
import { MGPNode, MGPNodeStats } from 'src/app/jscaip/MGPNode';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Minimax } from 'src/app/jscaip/Minimax';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
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

    public botTimeOut: number = 1000;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                authenticationService: AuthenticationService,
                public cdr: ChangeDetectorRef)
    {
        super(componentFactoryResolver, actRoute, authenticationService);
        this.players = ['humain', 'humain'];
        display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper.constructor');
    }
    public getCreatedNodes(): number {
        return MGPNodeStats.createdNodes;
    }
    public getMinimaxTime(): number {
        return MGPNodeStats.minimaxTime;
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
    }
    public updateBoard(): void {
        this.gameComponent.updateBoard();
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node);
        if (gameStatus.isEndGame === true) {
            this.endGame = true;
            if (gameStatus.winner !== Player.NONE) {
                this.winner = $localize`Player ${gameStatus.winner.value + 1}`;
            }
        }
    }
    public proposeAIToPlay(): void {
        // check if ai's turn has come, if so, make her start after a delay
        const playingMinimax: Minimax<Move, GamePartSlice> = this.getPlayingAI();
        if (playingMinimax != null) {
            // bot's turn
            setTimeout(() => {
                this.doAIMove(playingMinimax);
            }, this.botTimeOut);
        }
    }
    private getPlayingAI(): Minimax<Move, GamePartSlice> {
        const turn: number = this.gameComponent.rules.node.gamePartSlice.turn % 2;
        if (this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node).isEndGame) {
            // No AI is playing when the game is finished
            return null;
        }
        return this.gameComponent.availableMinimaxes.find((a: Minimax<Move, GamePartSlice, LegalityStatus>) => {
            return a.name === this.players[turn];
        });
    }
    public doAIMove(playingMinimax: Minimax<Move, GamePartSlice>): void {
        // called only when it's AI's Turn
        const ruler: Rules<Move, GamePartSlice, LegalityStatus> = this.gameComponent.rules;
        const gameStatus: GameStatus = ruler.getGameStatus(ruler.node);
        assert(gameStatus === GameStatus.ONGOING, 'IA should not try to play when game is over!');
        const turn: number = ruler.node.gamePartSlice.turn % 2;
        const currentAiDepth: number = Number.parseInt(this.aiDepths[turn % 2]);
        const aiMove: Move = ruler.node.findBestMove(currentAiDepth, playingMinimax);
        if (ruler.choose(aiMove)) {
            this.updateBoard();
            this.cdr.detectChanges();
            this.proposeAIToPlay();
        } else {
            throw new Error('AI choosed illegal move (' + aiMove.toString() + ')');
        }
    }
    public canTakeBack(): boolean {
        return this.gameComponent.rules.node.gamePartSlice.turn > 0;
    }
    public takeBack(): void {
        this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
        if (this.isAITurn()) {
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
        }
        this.gameComponent.updateBoard();
    }
    private isAITurn(): boolean {
        return this.getPlayingAI() != null;
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

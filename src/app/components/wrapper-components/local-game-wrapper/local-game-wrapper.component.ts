import { Component, ComponentFactoryResolver, AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { display } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPNode, MGPNodeStats } from 'src/app/jscaip/MGPNode';
import { GameState } from 'src/app/jscaip/GameState';
import { AbstractMinimax } from 'src/app/jscaip/Minimax';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalGameWrapperComponent extends GameWrapper implements AfterViewInit {

    public static VERBOSE: boolean = false;

    public aiDepths: [string, string] = ['0', '0'];

    public playerSelection: [string, string] = ['human', 'human'];

    public winner: MGPOptional<string> = MGPOptional.empty();

    public botTimeOut: number = 1000;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                protected readonly connectedUserService: ConnectedUserService,
                public cdr: ChangeDetectorRef,
                private readonly messageDisplayer: MessageDisplayer)
    {
        super(componentFactoryResolver, actRoute, connectedUserService);
        this.players = [MGPOptional.of(this.playerSelection[0]), MGPOptional.of(this.playerSelection[1])];
        display(LocalGameWrapperComponent.VERBOSE, 'LocalGameWrapper.constructor');
    }
    public getCreatedNodes(): number {
        return MGPNodeStats.createdNodes;
    }
    public getMinimaxTime(): number {
        return MGPNodeStats.minimaxTime;
    }
    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.afterGameIncluderViewInit();
            this.restartGame();
            this.cdr.detectChanges();
        }, 1);
    }
    public updatePlayer(player: 0|1): void {
        this.players[player] = MGPOptional.of(this.playerSelection[player]);
        this.proposeAIToPlay();
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
                this.winner = MGPOptional.of($localize`Player ${gameStatus.winner.value + 1}`);
            }
        }
    }
    public proposeAIToPlay(): void {
        // check if ai's turn has come, if so, make her start after a delay
        const playingMinimax: MGPOptional<AbstractMinimax> = this.getPlayingAI();
        if (playingMinimax.isPresent()) {
            // bot's turn
            window.setTimeout(async() => {
                await this.doAIMove(playingMinimax.get());
            }, this.botTimeOut);
        }
    }
    private getPlayingAI(): MGPOptional<AbstractMinimax> {
        if (this.gameComponent.rules.getGameStatus(this.gameComponent.rules.node).isEndGame) {
            // No AI is playing when the game is finished
            return MGPOptional.empty();
        }
        const playerIndex: number = this.gameComponent.rules.node.gameState.turn % 2;
        if (this.aiDepths[playerIndex] === '0') {
            // No AI is playing if its level is set to 0
            return MGPOptional.empty();
        }
        return MGPOptional.ofNullable(
            this.gameComponent.availableMinimaxes.find((a: AbstractMinimax) => {
                return this.players[playerIndex].equalsValue(a.name);
            }));
    }
    public async doAIMove(playingMinimax: AbstractMinimax): Promise<MGPValidation> {
        // called only when it's AI's Turn
        const ruler: Rules<Move, GameState, unknown> = this.gameComponent.rules;
        const gameStatus: GameStatus = ruler.getGameStatus(ruler.node);
        assert(gameStatus === GameStatus.ONGOING, 'IA should not try to play when game is over!');
        const turn: number = ruler.node.gameState.turn % 2;
        const currentAiDepth: number = Number.parseInt(this.aiDepths[turn % 2]);
        const aiMove: Move = ruler.node.findBestMove(currentAiDepth, playingMinimax, true);
        if (ruler.choose(aiMove)) {
            this.updateBoard();
            this.cdr.detectChanges();
            this.proposeAIToPlay();
            return MGPValidation.SUCCESS;
        } else {
            this.messageDisplayer.criticalMessage($localize`The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!`);
            return ErrorLoggerService.logError('LocalGameWrapper', 'AI chose illegal move', { name: playingMinimax.name, move: aiMove.toString() });
        }
    }
    public canTakeBack(): boolean {
        return this.gameComponent.rules.node.gameState.turn > 0;
    }
    public takeBack(): void {
        this.gameComponent.rules.node = this.gameComponent.rules.node.mother.get();
        if (this.isAITurn()) {
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother.get();
        }
        this.gameComponent.updateBoard();
    }
    private isAITurn(): boolean {
        return this.getPlayingAI().isPresent();
    }
    public restartGame(): void {
        const state: GameState = this.gameComponent.rules.stateType['getInitialState']();
        this.gameComponent.rules.node = new MGPNode(state);
        this.gameComponent.updateBoard();
        this.endGame = false;
        this.winner = MGPOptional.empty();
        this.proposeAIToPlay();
    }
    public getPlayerName(): string {
        return 'human';
    }
}

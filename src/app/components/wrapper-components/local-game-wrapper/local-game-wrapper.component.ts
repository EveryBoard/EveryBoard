import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractAI, AbstractNode, AIOptions, MGPNodeStats } from 'src/app/jscaip/MGPNode';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { Debug } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { GameState } from 'src/app/jscaip/GameState';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/GameStatus';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@Debug.log
export class LocalGameWrapperComponent extends GameWrapper<string> implements AfterViewInit {

    public aiOptions: [string, string] = ['none', 'none'];

    public playerSelection: [string, string] = ['human', 'human'];

    public winnerMessage: MGPOptional<string> = MGPOptional.empty();

    public botTimeOut: number = 1000;

    public displayAIMetrics: boolean = false;

    public constructor(actRoute: ActivatedRoute,
                       connectedUserService: ConnectedUserService,
                       router: Router,
                       messageDisplayer: MessageDisplayer,
                       private readonly cdr: ChangeDetectorRef)
    {
        super(actRoute, connectedUserService, router, messageDisplayer);
        this.players = [MGPOptional.of(this.playerSelection[0]), MGPOptional.of(this.playerSelection[1])];
        this.role = Player.ZERO; // The user is playing, not observing
    }
    public getCreatedNodes(): number {
        return MGPNodeStats.createdNodes;
    }
    public getMinimaxTime(): number {
        return MGPNodeStats.minimaxTime;
    }
    public ngAfterViewInit(): void {
        setTimeout(async() => {
            const createdSuccessfully: boolean = await this.afterViewInit();
            if (createdSuccessfully) {
                this.restartGame();
                this.cdr.detectChanges();
            }
        }, 1);
    }
    public updatePlayer(player: Player): void {
        this.players[player.value] = MGPOptional.of(this.playerSelection[player.value]);
        if (this.playerSelection[1] === 'human' && this.playerSelection[0] !== 'human') {
            this.setRole(Player.ONE);
        } else {
            this.setRole(Player.ZERO);
        }
        this.proposeAIToPlay();
    }
    public async onLegalUserMove(move: Move): Promise<void> {
        this.gameComponent.node = this.gameComponent.rules.choose(this.gameComponent.node, move).get();
        this.updateBoard();
        this.proposeAIToPlay();
    }
    public updateBoard(): void {
        this.updateBoardAndShowLastMove();
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.node);
        if (gameStatus.isEndGame === true) {
            this.endGame = true;
            if (gameStatus.winner.isPlayer()) {
                const winner: string = $localize`Player ${gameStatus.winner.value + 1}`;
                const loser: Player = gameStatus.winner.getOpponent();
                const loserValue: number = loser.value;
                if (this.players[gameStatus.winner.value].equalsValue('human')) { // When human win
                    if (this.players[loserValue].equalsValue('human')) {
                        this.winnerMessage = MGPOptional.of($localize`${ winner } won`);
                    } else {
                        this.winnerMessage = MGPOptional.of($localize`You won`);
                    }
                } else { // When AI win
                    if (this.players[loserValue].equalsValue('human')) {
                        this.winnerMessage = MGPOptional.of($localize`You lost`);
                    } else {
                        this.winnerMessage = MGPOptional.of($localize`${this.players[gameStatus.winner.value].get()} (Player ${gameStatus.winner.value + 1}) won`);
                    }
                }
            }

        }
    }
    public proposeAIToPlay(): void {
        // check if ai's turn has come, if so, make her start after a delay
        const playingAI: MGPOptional<{ ai: AbstractAI, options: AIOptions }> = this.getPlayingAI();
        if (playingAI.isPresent()) {
            // bot's turn
            window.setTimeout(async() => {
                await this.doAIMove(playingAI.get().ai, playingAI.get().options);
            }, this.botTimeOut);
        }
    }
    private getPlayingAI(): MGPOptional<{ ai: AbstractAI, options: AIOptions }> {
        if (this.gameComponent.rules.getGameStatus(this.gameComponent.node).isEndGame) {
            // No AI is playing when the game is finished
            return MGPOptional.empty();
        }
        const playerIndex: number = this.gameComponent.getTurn() % 2;
        const aiOpt: MGPOptional<AbstractAI> = this.findAI(playerIndex);
        if (aiOpt.isPresent()) {
            const ai: AbstractAI = aiOpt.get();
            const optionsName: string = this.aiOptions[playerIndex];
            const matchingOptions: MGPOptional<AIOptions> =
                MGPOptional.ofNullable(ai.availableOptions.find((options: AIOptions) => {
                    return options.name === optionsName;
                }));
            return matchingOptions.map((options: AIOptions) => {
                return { ai, options };
            });
        } else {
            return MGPOptional.empty();
        }
    }
    private findAI(playerIndex: number): MGPOptional<AbstractAI> {
        return MGPOptional.ofNullable(
            this.gameComponent.availableAIs.find((a: AbstractAI) => {
                return this.players[playerIndex].equalsValue(a.name);
            }));
    }
    public async doAIMove(playingAI: AbstractAI, options: AIOptions): Promise<MGPValidation> {
        // called only when it's AI's Turn
        const ruler: Rules<Move, GameState, unknown> = this.gameComponent.rules;
        const gameStatus: GameStatus = ruler.getGameStatus(this.gameComponent.node);
        assert(gameStatus === GameStatus.ONGOING, 'AI should not try to play when game is over!');
        const aiMove: Move = playingAI.chooseNextMove(this.gameComponent.node, options);
        const nextNode: MGPOptional<AbstractNode> = ruler.choose(this.gameComponent.node, aiMove);
        if (nextNode.isPresent()) {
            this.gameComponent.node = nextNode.get();
            this.updateBoard();
            this.cdr.detectChanges();
            this.proposeAIToPlay();
            return MGPValidation.SUCCESS;
        } else {
            this.messageDisplayer.criticalMessage($localize`The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!`);
            return ErrorLoggerService.logError('LocalGameWrapper', 'AI chose illegal move', {
                game: this.getGameName(),
                name: playingAI.name,
                move: aiMove.toString(),
            });
        }
    }
    public availableAIOptions(player: number): AIOptions[] {
        return this.findAI(player).get().availableOptions;
    }
    public canTakeBack(): boolean {
        return this.gameComponent.getTurn() > 0;
    }
    public takeBack(): void {
        this.gameComponent.node = this.gameComponent.node.parent.get();
        if (this.isAITurn()) {
            this.gameComponent.node = this.gameComponent.node.parent.get();
        }
        this.updateBoardAndShowLastMove();
    }
    private isAITurn(): boolean {
        return this.getPlayingAI().isPresent();
    }
    public restartGame(): void {
        this.gameComponent.node = this.gameComponent.rules.getInitialNode();
        this.gameComponent.updateBoard();
        this.endGame = false;
        this.winnerMessage = MGPOptional.empty();
        this.proposeAIToPlay();
    }
    public getPlayer(): string {
        return 'human';
    }
    public onCancelMove(reason?: string): void {
        if (this.gameComponent.node.previousMove.isPresent()) {
            const move: Move = this.gameComponent.node.previousMove.get();
            this.gameComponent.showLastMove(move);
        }
    }
}

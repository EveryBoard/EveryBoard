import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { AbstractNode, GameNodeStats } from 'src/app/jscaip/AI/GameNode';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { Debug, Utils } from 'src/app/utils/utils';
import { GameState } from 'src/app/jscaip/GameState';
import { SuperRules } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { AbstractAI, AIOptions, AIStats } from 'src/app/jscaip/AI/AI';
import { RulesConfig, RulesConfigUtils } from 'src/app/jscaip/RulesConfigUtil';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { MGPFallible } from 'src/app/utils/MGPFallible';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@Debug.log
export class LocalGameWrapperComponent extends GameWrapper<string> implements AfterViewInit {

    public static readonly AI_TIMEOUT: number = 1;

    public aiOptions: [string, string] = ['none', 'none'];

    public playerSelection: [string, string] = ['human', 'human'];

    public winnerMessage: MGPOptional<string> = MGPOptional.empty();

    public displayAIMetrics: boolean = false;

    private configIsSet: boolean = false;

    public rulesConfig: MGPOptional<RulesConfig> = MGPOptional.empty();

    private readonly configBS: BehaviorSubject<MGPOptional<RulesConfig>> = new BehaviorSubject(MGPOptional.empty());
    private readonly configObs: Observable<MGPOptional<RulesConfig>> = this.configBS.asObservable();

    public constructor(activatedRoute: ActivatedRoute,
                       connectedUserService: ConnectedUserService,
                       router: Router,
                       messageDisplayer: MessageDisplayer,
                       private readonly cdr: ChangeDetectorRef)
    {
        super(activatedRoute, connectedUserService, router, messageDisplayer);
        this.players = [MGPOptional.of(this.playerSelection[0]), MGPOptional.of(this.playerSelection[1])];
        this.role = Player.ZERO; // The user is playing, not observing
        this.setDefaultRulesConfig();
    }

    // Will set the default rules config.
    // Will set it to MGPOptional.empty() if the game doesn't exist, but an error will be handled by another function.
    // ConfiglessRules have MGPOptional.empty() value.
    private setDefaultRulesConfig(): void {
        const gameName: string = this.getGameName();
        this.rulesConfig = RulesConfigUtils.getGameDefaultConfig(gameName);
    }

    public getCreatedNodes(): number {
        return GameNodeStats.createdNodes;
    }

    public getMinimaxTime(): number {
        return AIStats.aiTime;
    }

    public ngAfterViewInit(): void {
        window.setTimeout(async() => {
            const createdSuccessfully: boolean = await this.createMatchingGameComponent();
            if (createdSuccessfully) {
                await this.restartGame();
                this.cdr.detectChanges();
            }
        }, 1);
    }

    public async updatePlayer(player: Player): Promise<void> {
        this.players[player.getValue()] = MGPOptional.of(this.playerSelection[player.getValue()]);
        if (this.playerSelection[1] === 'human' && this.playerSelection[0] !== 'human') {
            this.gameComponent.setInteractive(false);
            await this.setRole(Player.ONE);
        } else {
            this.gameComponent.setInteractive(true);
            await this.setRole(Player.ZERO);
        }
        await this.proposeAIToPlay();
    }

    public async onLegalUserMove(move: Move): Promise<void> {
        const config: MGPOptional<RulesConfig> = await this.getConfig();
        this.gameComponent.node = this.gameComponent.rules.choose(this.gameComponent.node, move, config).get();
        await this.proposeAIToPlay();
    }

    public async updateBoard(triggerAnimation: boolean): Promise<void> {
        await this.updateBoardAndShowLastMove(triggerAnimation);
        const config: MGPOptional<RulesConfig> = await this.getConfig();
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.node, config);
        if (gameStatus.isEndGame === true) {
            this.endGame = true;
            if (gameStatus.winner.isPlayer()) {
                const winner: string = $localize`Player ${gameStatus.winner.getValue() + 1}`;
                const loser: Player = gameStatus.winner.getOpponent();
                const loserValue: number = loser.getValue();
                if (this.players[gameStatus.winner.getValue()].equalsValue('human')) { // When human win
                    if (this.players[loserValue].equalsValue('human')) {
                        this.winnerMessage = MGPOptional.of($localize`${ winner } won`);
                    } else {
                        this.winnerMessage = MGPOptional.of($localize`You won`);
                    }
                } else { // When AI win
                    if (this.players[loserValue].equalsValue('human')) {
                        this.winnerMessage = MGPOptional.of($localize`You lost`);
                    } else {
                        this.winnerMessage = MGPOptional.of($localize`${this.players[gameStatus.winner.getValue()].get()} (Player ${gameStatus.winner.getValue() + 1}) won`);
                    }
                }
            }
        }
    }

    public async proposeAIToPlay(): Promise<void> {
        if (await this.hasSelectedAI()) {
            // It is AI's turn, let it play after a small delay
            this.gameComponent.setInteractive(false);
            await this.updateBoard(false);
            const playingAI: MGPOptional<{ ai: AbstractAI, options: AIOptions }> = this.getPlayingAI();
            if (playingAI.isPresent()) {
                window.setTimeout(async() => {
                    await this.doAIMove(playingAI.get().ai, playingAI.get().options);
                }, LocalGameWrapperComponent.AI_TIMEOUT);
            }
            // If playingAI is absent, that means the user selected an AI without selecting options yet
            // We do nothing in this case.
        } else {
            this.gameComponent.setInteractive(true);
            await this.updateBoard(false);
            this.cdr.detectChanges();
        }
    }

    private async hasSelectedAI(): Promise<boolean> {
        const config: MGPOptional<RulesConfig> = await this.getConfig();
        if (this.gameComponent.rules.getGameStatus(this.gameComponent.node, config).isEndGame) {
            // No AI is playing when the game is finished
            return false;
        }

        const playerIndex: number = this.gameComponent.getTurn() % 2;
        return this.playerSelection[playerIndex] !== 'human';
    }

    private getPlayingAI(): MGPOptional<{ ai: AbstractAI, options: AIOptions }> {
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

    public getStateProvider(): MGPOptional<(config: MGPOptional<RulesConfig>) => GameState> {
        const urlName: string = this.getGameName();
        const gameInfos: MGPOptional<GameInfo> = GameInfo.getByUrlName(urlName);
        if (gameInfos.isPresent()) {
            const stateProvider: (config: MGPOptional<RulesConfig>) => GameState =
                (config: MGPOptional<RulesConfig>) => {
                    return gameInfos.get().rules.getInitialState(config);
                };
            return MGPOptional.of(stateProvider);
        } else {
            return MGPOptional.empty();
        }
    }

    public async doAIMove(playingAI: AbstractAI, options: AIOptions): Promise<MGPValidation> {
        // called only when it's AI's Turn
        const ruler: SuperRules<Move, GameState, RulesConfig, unknown> = this.gameComponent.rules;
        const config: MGPOptional<RulesConfig> = await this.getConfig();
        const gameStatus: GameStatus = ruler.getGameStatus(this.gameComponent.node, config);
        Utils.assert(gameStatus === GameStatus.ONGOING, 'AI should not try to play when game is over!');
        const aiMove: Move = playingAI.chooseNextMove(this.gameComponent.node, options, config);
        const nextNode: MGPFallible<AbstractNode> = ruler.choose(this.gameComponent.node, aiMove, config);
        if (nextNode.isSuccess()) {
            this.gameComponent.node = nextNode.get();
            await this.updateBoard(true);
            this.cdr.detectChanges();
            await this.proposeAIToPlay();
            return MGPValidation.SUCCESS;
        } else {
            this.messageDisplayer.criticalMessage($localize`The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!`);
            return ErrorLoggerService.logError('LocalGameWrapper', 'AI chose illegal move', {
                game: this.getGameName(),
                name: playingAI.name,
                move: aiMove.toString(),
                reason: nextNode.getReason(),
            });
        }
    }

    public availableAIOptions(player: number): AIOptions[] {
        return this.findAI(player).get().availableOptions;
    }

    public canTakeBack(): boolean {
        if (this.players[0].equalsValue('human')) {
            return this.gameComponent.getTurn() > 0;
        } else if (this.players[1].equalsValue('human')) {
            return this.gameComponent.getTurn() > 1;
        } else {
            return false;
        }
    }

    public async takeBack(): Promise<void> {
        this.gameComponent.node = this.gameComponent.node.parent.get();
        if (this.isAITurn()) {
            Utils.assert(this.gameComponent.node.parent.isPresent(),
                         'Cannot take back in first turn when AI is Player.ZERO');
            this.gameComponent.node = this.gameComponent.node.parent.get();
        }
        await this.updateBoardAndShowLastMove(false);
    }

    private isAITurn(): boolean {
        return this.getPlayingAI().isPresent();
    }

    public async restartGame(): Promise<void> {
        const config: MGPOptional<RulesConfig> = await this.getConfig();
        this.gameComponent.node = this.gameComponent.rules.getInitialNode(config);
        this.gameComponent.hideLastMove();
        await this.gameComponent.updateBoard(false);
        this.endGame = false;
        this.winnerMessage = MGPOptional.empty();
        await this.proposeAIToPlay();
    }

    public override getPlayer(): string {
        return 'human';
    }

    public async onCancelMove(reason?: string): Promise<void> {
        if (this.gameComponent.node.previousMove.isPresent()) {
            const move: Move = this.gameComponent.node.previousMove.get();
            const config: MGPOptional<RulesConfig> = await this.getConfig();
            await this.gameComponent.showLastMove(move, config);
        }
    }

    public override async getConfig(): Promise<MGPOptional<RulesConfig>> {
        let subcription: MGPOptional<Subscription> = MGPOptional.empty();
        const rulesConfigPromise: Promise<RulesConfig> =
            new Promise((resolve: (value: RulesConfig) => void) => {
                subcription = MGPOptional.of(
                    this.configObs.subscribe((response: MGPOptional<RulesConfig>) => {
                        if (response.isPresent()) {
                            resolve(response.get());
                        }
                    }),
                );
            });
        const rulesConfig: RulesConfig = await rulesConfigPromise;
        // Subscription will never be empty at this point
        // but this is needed to prevent linter from complaining that:
        // "subscription is used before it is set"
        subcription.get().unsubscribe();
        return MGPOptional.of(rulesConfig);
    }

    public updateConfig(rulesConfig: MGPOptional<RulesConfig>): void {
        this.rulesConfig = rulesConfig;
        // If there is no config for this game, then rulesConfig value will be MGPOptional.empty()
        if (rulesConfig.isPresent() && Object.keys(rulesConfig.get()).length === 0) {
            this.markConfigAsFilled();
        }
    }

    public isConfigSet(): boolean {
        return this.configIsSet;
    }

    public markConfigAsFilled(): void {
        this.configIsSet = true;
        this.cdr.detectChanges();
        this.configBS.next(this.rulesConfig);
    }

    public displayAIInfo(): boolean {
        return localStorage.getItem('displayAIInfo') === 'true';
    }
}

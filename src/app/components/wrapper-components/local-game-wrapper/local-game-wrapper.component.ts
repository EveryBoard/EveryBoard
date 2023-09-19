import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { AbstractNode, MGPNodeStats } from 'src/app/jscaip/MGPNode';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { Debug, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { GameState } from 'src/app/jscaip/GameState';
import { AbstractMinimax } from 'src/app/jscaip/Minimax';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { RulesConfig, RulesConfigUtils } from 'src/app/jscaip/RulesConfigUtil';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@Debug.log
export class LocalGameWrapperComponent extends GameWrapper<string> implements AfterViewInit {

    public static readonly AI_TIMEOUT: number = 1000;

    public aiDepths: [string, string] = ['0', '0'];

    public playerSelection: [string, string] = ['human', 'human'];

    public winnerMessage: MGPOptional<string> = MGPOptional.empty();


    public displayAIMetrics: boolean = false;

    public configSetted: boolean = false;

    public rulesConfig: MGPOptional<RulesConfig> = MGPOptional.empty();

    private readonly configBS: BehaviorSubject<MGPOptional<RulesConfig>> = new BehaviorSubject(MGPOptional.empty());
    private readonly configObs: Observable<MGPOptional<RulesConfig>> = this.configBS.asObservable();

    public constructor(actRoute: ActivatedRoute,
                       connectedUserService: ConnectedUserService,
                       router: Router,
                       messageDisplayer: MessageDisplayer,
                       private readonly cdr: ChangeDetectorRef)
    {
        super(actRoute, connectedUserService, router, messageDisplayer);
        this.players = [MGPOptional.of(this.playerSelection[0]), MGPOptional.of(this.playerSelection[1])];
        this.role = Player.ZERO; // The user is playing, not observing
        this.setDefaultRulesConfig();
    }

    // Will set the default rules config
    // Will set it to {} if the game don't exist, but an error will be handled by some other function
    private setDefaultRulesConfig(): void {
        const gameName: string = this.getGameName();
        const defaultConfig: RulesConfig = RulesConfigUtils.getGameDefaultConfig(gameName);
        this.rulesConfig = MGPOptional.of(defaultConfig);
    }

    public getCreatedNodes(): number {
        return MGPNodeStats.createdNodes;
    }
    public getMinimaxTime(): number {
        return MGPNodeStats.minimaxTime;
    }
    public ngAfterViewInit(): void {
        window.setTimeout(async() => {
            const createdSuccessfully: boolean = await this.createRulesConfigAndStartComponent();
            if (createdSuccessfully) {
                await this.restartGame();
                this.cdr.detectChanges();
            }
        }, 1);
    }

    private async createRulesConfigAndStartComponent(): Promise<boolean> {
        return this.afterViewInit();
    }

    public async updatePlayer(player: Player): Promise<void> {
        this.players[player.value] = MGPOptional.of(this.playerSelection[player.value]);
        if (this.playerSelection[1] === 'human' && this.playerSelection[0] !== 'human') {
            await this.setRole(Player.ONE);
        } else {
            await this.setRole(Player.ZERO);
        }
        this.proposeAIToPlay();
    }
    public async onLegalUserMove(move: Move): Promise<void> {
        this.gameComponent.node = this.gameComponent.rules.choose(this.gameComponent.node, move).get();
        await this.updateBoard(false);
        this.proposeAIToPlay();
        this.cdr.detectChanges();
    }
    public async updateBoard(triggerAnimation: boolean): Promise<void> {
        await this.updateBoardAndShowLastMove(triggerAnimation);
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
        const playingMinimax: MGPOptional<AbstractMinimax> = this.getPlayingAI();
        if (playingMinimax.isPresent()) {
            // bot's turn
            window.setTimeout(async() => {
                await this.doAIMove(playingMinimax.get());
            }, LocalGameWrapperComponent.AI_TIMEOUT);
        }
    }
    private getPlayingAI(): MGPOptional<AbstractMinimax> {
        if (this.gameComponent.rules.getGameStatus(this.gameComponent.node).isEndGame) {
            // No AI is playing when the game is finished
            return MGPOptional.empty();
        }
        const playerIndex: number = this.gameComponent.getTurn() % 2;
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
        const ruler: Rules<Move, GameState, RulesConfig, unknown> = this.gameComponent.rules;
        const gameStatus: GameStatus = ruler.getGameStatus(this.gameComponent.node);
        assert(gameStatus === GameStatus.ONGOING, 'AI should not try to play when game is over!');
        const turn: number = this.gameComponent.node.gameState.turn % 2;
        const currentAiDepth: number = Number.parseInt(this.aiDepths[turn % 2]);
        const aiMove: Move = this.gameComponent.node.findBestMove(currentAiDepth, playingMinimax, true);
        const nextNode: MGPOptional<AbstractNode> = ruler.choose(this.gameComponent.node, aiMove);
        if (nextNode.isPresent()) {
            this.gameComponent.node = nextNode.get();
            await this.updateBoard(true);
            this.cdr.detectChanges();
            this.proposeAIToPlay();
            return MGPValidation.SUCCESS;
        } else {
            this.messageDisplayer.criticalMessage($localize`The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!`);
            return ErrorLoggerService.logError('LocalGameWrapper', 'AI chose illegal move', { name: playingMinimax.name, move: aiMove.toString() });
        }
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
        this.gameComponent.node = this.gameComponent.node.mother.get();
        if (this.isAITurn()) {
            Utils.assert(this.gameComponent.node.mother.isPresent(),
                         'Cannot take back in first turn when AI is Player.ZERO');
            this.gameComponent.node = this.gameComponent.node.mother.get();
        }
        await this.updateBoardAndShowLastMove(false);
    }
    private isAITurn(): boolean {
        return this.getPlayingAI().isPresent();
    }
    public async restartGame(): Promise<void> {
        const config: RulesConfig = await this.getConfig();
        this.gameComponent.node = this.gameComponent.rules.getInitialNode(config);
        this.gameComponent.hideLastMove();
        await this.gameComponent.updateBoard(false);
        this.endGame = false;
        this.winnerMessage = MGPOptional.empty();
        this.proposeAIToPlay();
    }
    public override getPlayer(): string {
        return 'human';
    }
    public async onCancelMove(reason?: string): Promise<void> {
        if (this.gameComponent.node.move.isPresent()) {
            const move: Move = this.gameComponent.node.move.get();
            await this.gameComponent.showLastMove(move);
        }
    }
    public override async getConfig(): Promise<RulesConfig> {
        // Linter seem to think that the unscubscription line can be reached before the subscription
        // yet this is false, so this explain the weird instanciation
        let subcription: Subscription = { unsubscribe: () => {} } as Subscription;
        const rulesConfigPromise: Promise<RulesConfig> =
            new Promise((resolve: (value: RulesConfig) => void) => {
                subcription = this.configObs.subscribe((response: MGPOptional<RulesConfig>) => {
                    if (response.isPresent()) {
                        resolve(response.get());
                    }
                });
            });
        const rulesConfig: RulesConfig = await rulesConfigPromise;
        subcription.unsubscribe();
        return rulesConfig;
    }
    public updateConfig(rulesConfig: MGPOptional<RulesConfig>): void {
        this.rulesConfig = rulesConfig;
        if (rulesConfig.isPresent() && Object.keys(rulesConfig.get()).length === 0) {
            this.markConfigAsFilled();
        }
    }
    public markConfigAsFilled(): void {
        this.configSetted = true;
        this.cdr.detectChanges();
        this.configBS.next(this.rulesConfig);
    }
}

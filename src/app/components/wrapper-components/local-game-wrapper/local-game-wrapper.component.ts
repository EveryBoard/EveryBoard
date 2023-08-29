import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractNode, MGPNodeStats } from 'src/app/jscaip/MGPNode';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { GameWrapper } from 'src/app/components/wrapper-components/GameWrapper';
import { Move } from 'src/app/jscaip/Move';
import { Debug } from 'src/app/utils/utils';
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
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { GameConfig, GameConfigDescription } from 'src/app/jscaip/ConfigUtil';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@Debug.log
export class LocalGameWrapperComponent extends GameWrapper<string> implements AfterViewInit {

    public aiDepths: [string, string] = ['0', '0'];

    public playerSelection: [string, string] = ['human', 'human'];

    public winnerMessage: MGPOptional<string> = MGPOptional.empty();

    public botTimeOut: number = 1000;

    public displayAIMetrics: boolean = false;

    public configSetted: boolean = false;

    private readonly configBS: BehaviorSubject<MGPOptional<GameConfig>> = new BehaviorSubject(MGPOptional.empty());
    private readonly configObs: Observable<MGPOptional<GameConfig>> = this.configBS.asObservable();

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
            const createdSuccessfully: boolean = await this.createGameConfigAndStartComponent();
            if (createdSuccessfully) {
                await this.restartGame();
                this.cdr.detectChanges();
            }
        }, 1);
    }
    private async createGameConfigAndStartComponent(): Promise<boolean> {
        const gameURL: string = this.getGameName();
        const gameInfo: GameInfo = GameInfo.ALL_GAMES().filter((gameInfo: GameInfo) => gameInfo.urlName === gameURL)[0];
        return this.afterViewInit(); // TODO: DO
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
            } else {
                console.log('y a bien draw he')
            }
        } else {
            console.log("la partie n'est pas finie, FELIPE")
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
        const ruler: Rules<Move, GameState, GameConfig, unknown> = this.gameComponent.rules;
        const gameStatus: GameStatus = ruler.getGameStatus(this.gameComponent.node);
        assert(gameStatus === GameStatus.ONGOING, 'AI should not try to play when game is over!');
        const turn: number = this.gameComponent.node.gameState.turn % 2;
        const currentAiDepth: number = Number.parseInt(this.aiDepths[turn % 2]);
        const aiMove: Move = this.gameComponent.node.findBestMove(currentAiDepth, playingMinimax, true);
        const nextNode: MGPOptional<AbstractNode> = ruler.choose(this.gameComponent.node, aiMove);
        if (nextNode.isPresent()) {
            this.gameComponent.node = nextNode.get();
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
        return this.gameComponent.getTurn() > 0;
    }
    public takeBack(): void {
        this.gameComponent.node = this.gameComponent.node.mother.get();
        if (this.isAITurn()) {
            this.gameComponent.node = this.gameComponent.node.mother.get();
        }
        this.updateBoardAndShowLastMove();
    }
    private isAITurn(): boolean {
        return this.getPlayingAI().isPresent();
    }
    public async restartGame(): Promise<void> {
        console.log('restartGame !')
        const config: GameConfig = await this.getConfig();
        console.log('restartGame has a gameConfig: the same as before?!')
        this.gameComponent.node = this.gameComponent.rules.getInitialNode(config);
        this.gameComponent.updateBoard();
        this.endGame = false;
        console.log('restartGame winnerMessage erased')
        this.winnerMessage = MGPOptional.empty();
        this.proposeAIToPlay();
    }
    public getPlayer(): string {
        return 'human';
    }
    public onCancelMove(reason?: string): void {
        if (this.gameComponent.node.move.isPresent()) {
            const move: Move = this.gameComponent.node.move.get();
            this.gameComponent.showLastMove(move);
        }
    }
    public getConfigDescriptor(): GameConfigDescription {
        const gameURL: string = this.getGameName();
        const game: GameInfo = GameInfo.ALL_GAMES().filter((gameInfo: GameInfo) => gameInfo.urlName === gameURL)[0];
        // TODO: do the assert that this exist eh
        return game.configDescription;
    }
    public async getConfig(): Promise<GameConfig> {
        // Linter seem to think that the unscubscription line can be reached before the subscription
        // yet this is false, so this explain the weird instanciation
        let subcription: Subscription = { unsubscribe: () => {}} as Subscription;
        const gameConfigPromise: Promise<GameConfig> =
            new Promise((resolve: (value: GameConfig) => void) => {
                subcription = this.configObs.subscribe((response: MGPOptional<GameConfig>) => {
                    if (response.isPresent()) {
                        resolve(response.get());
                    }
                });
        });
        const gameConfig: GameConfig = await gameConfigPromise;
        subcription.unsubscribe();
        return gameConfig;
    }
    public markConfigAsFilled(gameConfig: GameConfig): void {
        this.configSetted = true;
        this.cdr.detectChanges();
        this.configBS.next(MGPOptional.of(gameConfig));
    }
}

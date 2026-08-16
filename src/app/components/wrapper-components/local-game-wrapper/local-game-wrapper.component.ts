import { NgClass } from '@angular/common';
import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Type, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ParamMap } from '@angular/router';

import { MGPFallible, MGPOptional, MGPValidation, Utils, JSONParser, JSONValue, isJSONPrimitive } from '@everyboard/lib';

import { AIDepthLimitOptions, AIOptions, AIStats, AITimeLimitOptions, AbstractAI } from '../../../jscaip/AI/AI';
import { MCTSConfig, MinimaxConfig } from '../../../jscaip/AI/AIConfig';
import { AIInstanceRegistry, PlayerSelection, createIterativeDeepeningMinimaxFromConfig, createMCTSFromConfig, createMinimaxFromConfig } from '../../../jscaip/AI/AIConfigUtils';
import { AbstractNode, GameNode, GameNodeStats } from '../../../jscaip/AI/GameNode';
import { IterativeDeepeningMinimax } from '../../../jscaip/AI/IterativeDeepeningMinimax';
import { MCTS } from '../../../jscaip/AI/MCTS';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { GameStatus } from '../../../jscaip/GameStatus';
import { Move } from '../../../jscaip/Move';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { PlayerMap } from '../../../jscaip/PlayerMap';
import { SuperRules } from '../../../jscaip/Rules';
import { ConfigDescriptionType, RulesConfig, RulesConfigUtils } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';
import { Debug } from '../../../utils/Debug';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { ViewConfigComponent } from '../../normal-component/view-config/view-config.component';
import { GameWrapper } from '../GameWrapper';
import { RulesConfigDescription } from '../rules-configuration/RulesConfigDescription';

type AIChoice = {
    id: string;
    name: string;
}

@Component({
    selector: 'app-local-game-wrapper',
    templateUrl: './local-game-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ViewConfigComponent, NgClass, ReactiveFormsModule, FormsModule],
})
@Debug.log
export class LocalGameWrapperComponent extends GameWrapper<string> implements AfterViewInit, OnDestroy {
    private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    private readonly aiInstances: AIInstanceRegistry = new AIInstanceRegistry();

    private aiTimeout: MGPOptional<ReturnType<typeof setTimeout>> = MGPOptional.empty();

    public static readonly AI_TIMEOUT: number = 1500;

    private readonly aiProfiles: PlayerMap<string> = PlayerMap.ofValues('none', 'none');

    private readonly aiOptions: PlayerMap<string> = PlayerMap.ofValues('none', 'none');

    private readonly playerSelection: PlayerMap<PlayerSelection> = PlayerMap.ofValues('human', 'human');

    public winnerMessage: MGPOptional<string> = MGPOptional.empty();

    public rulesConfig: RulesConfig; // Set in constructor and in ngAfterViewInit

    public constructor()
    {
        super();
        this.players = PlayerMap.ofValues(MGPOptional.of(this.playerSelection.get(Player.ZERO)),
                                          MGPOptional.of(this.playerSelection.get(Player.ONE)));
        this.role = Player.ZERO; // The user is playing, not observing
    }

    public getCreatedNodes(): number {
        return GameNodeStats.createdNodes;
    }

    public getMinimaxTimes(): string {
        return Array.from(AIStats.aiTime.entries())
            .map(([key, value]: [string, number]) => `${key}: ${value.toFixed(0)}ms`)
            .join(',');
    }

    public getAIInfoLines(): string[] {
        const config: RulesConfig = this.getConfig();
        return [
            ...this.getMinimaxConfigs().map((minimaxConfig: MinimaxConfig<Move, GameState, RulesConfig>) => {
                const ai: Minimax<Move, GameState, RulesConfig, unknown> = this.createMinimax(minimaxConfig);
                return `${ai.name}: ${ai.getInfo(this.gameComponent.node, config)}`;
            }),
            ...this.getMCTSConfigs().map((mctsConfig: MCTSConfig<Move, GameState, RulesConfig>) => {
                const ai: MCTS<Move, GameState, RulesConfig, unknown> = this.createMCTS(mctsConfig);
                return `${ai.name}: ${ai.getInfo(this.gameComponent.node)}`;
            }),
        ];
    }

    public async ngAfterViewInit(): Promise<void> {
        setTimeout(async() => {
            const createdSuccessfully: boolean = await this.createMatchingGameComponent();
            if (createdSuccessfully) {
                await this.restartGame();
                this.cdr.detectChanges();
            }
        }, 1);
    }

    protected override async createGameComponentAndSetConfig(componentType: Type<AbstractGameComponent>)
    : Promise<void>
    {
        await this.setConfigFromParams();
        await super.createGameComponentAndSetConfig(componentType);
    }

    /**
     * Reads the URL to get the config from query parameters (e.g., /P4?width=5&height=5)
     * If the config is invalid, redirect to page that lets the user select the config.
     * Public for being able to trigger it from tests.
     */
    public async setConfigFromParams(): Promise<void> {
        const params: ParamMap = this.activatedRoute.snapshot.queryParamMap;
        const noConfigIsProvided: boolean = params.keys.length === 0;

        const defaultConfig: RulesConfig = RulesConfigUtils.getGameDefaultConfig(this.getGameUrlName());
        const gameIsNotConfigurable: boolean = Object.keys(defaultConfig).length === 0;

        if (noConfigIsProvided || gameIsNotConfigurable) {
            this.rulesConfig = defaultConfig;
        } else {
            // Extract the configuration from the query parameters and validate it
            const rulesConfigDescription: RulesConfigDescription<RulesConfig> = this.getRulesConfigDescription();
            const config: RulesConfig = {};

            // We set the config to preserve the invariant that rulesConfig should be set when returning.
            // In case where a valid config is provided, this.rulesConfig will be updated.
            // If no valid config is provided, it is important to still have a valid this.rulesConfig to avoid errors
            // before the redirection
            this.rulesConfig = defaultConfig;
            for (const key of rulesConfigDescription.getFields()) {
                const paramValue: string | null = params.get(key);
                if (paramValue == null) {
                    // Config element has not been provided
                    return this.redirectToConfiguration();
                } else {
                    const value: MGPOptional<JSONValue> = JSONParser.parseJSONSafely(paramValue);
                    if (value.isPresent()) {
                        const actualValue: JSONValue = value.get();
                        if (isJSONPrimitive(actualValue) && rulesConfigDescription.isValid(key, actualValue)) {
                            config[key] = value.get() as ConfigDescriptionType;
                        } else {
                            // Config element is a complex JSON object/array
                            return this.redirectToConfiguration();
                        }
                    } else {
                        // Config element is not valid
                        return this.redirectToConfiguration();
                    }
                }
            }
            const areValidatorsValid: boolean = this.areGlobalValidatorsValid(rulesConfigDescription, config);
            if (areValidatorsValid === false) {
                return this.redirectToConfiguration();
            }
            this.rulesConfig = config;
        }
    }

    private areGlobalValidatorsValid(rulesConfigDescription: RulesConfigDescription<RulesConfig>, config: RulesConfig)
    : boolean
    {
        const validators: ((config: RulesConfig) => MGPValidation)[] =
            rulesConfigDescription.defaultConfigDescription.validators ?? [];
        for (const validator of validators) {
            const validation: MGPValidation = validator(config);
            if (validation.isFailure()) {
                return false;
            }
        }
        return true;
    }

    private async redirectToConfiguration(): Promise<void> {
        await this.router.navigate(['/local', this.getGameUrlName(), 'config']);
    }

    public getPlayerSelection(player: Player): string {
        return this.playerSelection.get(player);
    }

    public async onPlayerSelectionChange(player: Player, value: PlayerSelection): Promise<void> {
        this.playerSelection.put(player, value);
        await this.updatePlayer(player);
    }

    public getAIProfile(player: Player): string {
        return this.aiProfiles.get(player);
    }

    public async onAIProfileChange(player: Player, value: string): Promise<void> {
        this.aiProfiles.put(player, value);
        await this.updatePlayer(player);
    }

    public getAIOption(player: Player): string {
        return this.aiOptions.get(player);
    }

    public async onAIOptionChange(player: Player, value: string): Promise<void> {
        this.aiOptions.put(player, value);
        await this.updatePlayer(player);
    }

    public async updatePlayer(player: Player): Promise<void> {
        this.resetInvalidAISelection(player);
        this.players.put(player, MGPOptional.of(this.playerSelection.get(player)));
        const playerZeroIsHuman: boolean = this.playerSelection.get(Player.ZERO) === 'human';
        const playerOneIsHuman: boolean = this.playerSelection.get(Player.ONE) === 'human';
        if (playerZeroIsHuman) {
            await this.setInteractive(true);
            await this.setRole(Player.ZERO);
        } else if (playerOneIsHuman) {
            await this.setInteractive(false);
            await this.setRole(Player.ONE);
        } else {
            await this.setInteractive(false);
            await this.setRole(Player.ZERO);
        }
        await this.proposeAIToPlay();
    }

    private resetInvalidAISelection(player: Player): void {
        if (this.playerSelection.get(player) === 'human') {
            this.aiProfiles.put(player, 'none');
            this.aiOptions.put(player, 'none');
            return;
        }
        if (this.mustSelectAIProfile(player) === false) {
            this.aiProfiles.put(player, this.availableAIProfiles(player)[0]?.id ?? 'none');
        }
        const profileExists: boolean = this.availableAIProfiles(player).some((profile: AIChoice) => {
            return profile.id === this.aiProfiles.get(player);
        });
        if (profileExists === false) {
            this.aiProfiles.put(player, 'none');
            this.aiOptions.put(player, 'none');
        } else if (this.availableAIOptions(player).some((option: AIOptions) => {
            return option.name === this.aiOptions.get(player);
        }) === false) {
            this.aiOptions.put(player, 'none');
        }
    }

    public mustSelectAIProfile(player: Player): boolean {
        return this.playerSelection.get(player) !== 'human' &&
               (this.playerSelection.get(player) !== 'mcts' || this.availableAIProfiles(player).length > 1);
    }

    public isAIProfileSelected(player: Player): boolean {
        return this.mustSelectAIProfile(player) === false || this.aiProfiles.get(player) !== 'none';
    }

    public override async onLegalUserMove(move: Move): Promise<void> {
        const config: RulesConfig = this.getConfig();
        this.gameComponent.node = this.gameComponent.rules.choose(this.gameComponent.node, move, config).get();
        await this.applyNewMove();
    }

    private async updateWrapper(): Promise<void> {
        const config: RulesConfig = this.getConfig();
        const gameStatus: GameStatus = this.gameComponent.rules.getGameStatus(this.gameComponent.node, config);
        if (gameStatus.isEndGame) {
            this.endGame = true;
            if (gameStatus.winner.isPlayer()) {
                const winner: string = $localize`Player ${gameStatus.winner.getValue() + 1}`;
                const loser: Player = gameStatus.winner.getOpponent();
                if (this.players.get(gameStatus.winner).equalsValue('human')) {
                    // When human wins
                    if (this.players.get(loser).equalsValue('human')) {
                        this.winnerMessage = MGPOptional.of($localize`${ winner } won`);
                    } else {
                        this.winnerMessage = MGPOptional.of($localize`You won`);
                    }
                } else {
                    // When AI wins
                    if (this.players.get(loser).equalsValue('human')) {
                        this.winnerMessage = MGPOptional.of($localize`You lost`);
                    } else {
                        this.winnerMessage = MGPOptional.of($localize`${this.getPlayerName(gameStatus.winner)} (Player ${gameStatus.winner.getValue() + 1}) won`);
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }

    private getPlayerName(player: Player): string {
        if (this.playerSelection.get(player) === 'human') {
            return $localize`Human`;
        }
        const profile: AIChoice | undefined = this.availableAIProfiles(player).find((candidate: AIChoice) => {
            return candidate.id === this.aiProfiles.get(player);
        });
        return Utils.getNonNullable(profile).name;
    }

    public async proposeAIToPlay(): Promise<void> {
        this.cancelPendingAIMove();
        const currentPlayerIsHuman: boolean = await this.hasSelectedAI() === false;
        await this.setInteractive(currentPlayerIsHuman);
        // Another call may have scheduled a move while this call was awaiting.
        this.cancelPendingAIMove();
        if (currentPlayerIsHuman === false) {
            // It is AI's turn, let it play after a small delay
            const playingAI: MGPOptional<{ ai: AbstractAI; options: AIOptions }> = this.getPlayingAI();
            if (playingAI.isPresent()) {
                this.aiTimeout = MGPOptional.of(setTimeout(async() => {
                    this.aiTimeout = MGPOptional.empty();
                    const config: RulesConfig = this.getConfig();
                    const gameIsOngoing: boolean =
                        this.gameComponent.rules.getGameStatus(this.gameComponent.node, config) === GameStatus.ONGOING;
                    if (gameIsOngoing) {
                        await this.doAIMove(playingAI.get().ai, playingAI.get().options);
                    }
                }, LocalGameWrapperComponent.AI_TIMEOUT));
            }
            // If playingAI is absent, that means the user selected an AI without selecting options yet
            // We do nothing in this case.
        }
    }

    private cancelPendingAIMove(): void {
        if (this.aiTimeout.isPresent()) {
            window.clearTimeout(this.aiTimeout.get());
            this.aiTimeout = MGPOptional.empty();
        }
    }

    public ngOnDestroy(): void {
        this.cancelPendingAIMove();
    }

    /**
     * @returns false if the game is finished
     *          false if no AI is selected
     *          true if an AI is selected even if its option is not selected yet
     */
    private async hasSelectedAI(): Promise<boolean> {
        const config: RulesConfig = this.getConfig();
        if (this.gameComponent.rules.getGameStatus(this.gameComponent.node, config).isEndGame) {
            // No AI is playing when the game is finished
            return false;
        }

        const player: Player = this.gameComponent.getCurrentPlayer();
        return this.playerSelection.get(player) !== 'human';
    }

    private lastMoveWasAI(): boolean {
        const opponent: Player = this.gameComponent.getCurrentOpponent();
        return this.playerSelection.get(opponent) !== 'human';
    }

    private getPlayingAI(): MGPOptional<{ ai: AbstractAI; options: AIOptions }> {
        return this.getAI(this.gameComponent.getCurrentPlayer());
    }

    private getOpponentAI(): MGPOptional<{ ai: AbstractAI; options: AIOptions }> {
        return this.getAI(this.gameComponent.getCurrentOpponent());
    }

    private getAI(player: Player): MGPOptional<{ ai: AbstractAI; options: AIOptions }> {
        const strategy: PlayerSelection = this.playerSelection.get(player);
        if (strategy === 'human') {
            return MGPOptional.empty();
        }
        const profileId: string = this.aiProfiles.get(player);
        const optionName: string = this.aiOptions.get(player);
        const options: MGPOptional<AIOptions> = MGPOptional.ofNullable(
            this.availableAIOptions(player).find((option: AIOptions) => option.name === optionName));
        if (options.isAbsent()) {
            return MGPOptional.empty();
        }
        switch (strategy) {
            case 'minimax':
                return this.getMinimaxConfig(profileId).map((config: MinimaxConfig<Move, GameState, RulesConfig>) => {
                    const minimax: Minimax<Move, GameState, RulesConfig, unknown> = this.createMinimax(config);
                    return { ai: minimax, options: options.get() };
                });
            case 'iterative-deepening':
                return this.getMinimaxConfig(profileId).map((config: MinimaxConfig<Move, GameState, RulesConfig>) => {
                    return { ai: this.createIterativeMinimax(config), options: options.get() };
                });
            case 'mcts':
                return this.getMCTSConfig(profileId).map((config: MCTSConfig<Move, GameState, RulesConfig>) => {
                    const mcts: MCTS<Move, GameState, RulesConfig, unknown> = this.createMCTS(config);
                    return { ai: mcts, options: options.get() };
                });
        }
    }

    private getMinimaxConfig(id: string): MGPOptional<MinimaxConfig<Move, GameState, RulesConfig>> {
        return MGPOptional.ofNullable(
            this.getMinimaxConfigs().find((config: MinimaxConfig<Move, GameState, RulesConfig>) => {
                return config.id === id;
            }));
    }

    private getMCTSConfig(id: string): MGPOptional<MCTSConfig<Move, GameState, RulesConfig>> {
        return MGPOptional.ofNullable(this.getMCTSConfigs().find((config: MCTSConfig<Move, GameState, RulesConfig>) => {
            return config.id === id;
        }));
    }

    private getMinimaxConfigs(): MinimaxConfig<Move, GameState, RulesConfig>[] {
        return this.gameComponent.aiConfig.minimax;
    }

    private createMinimax(config: MinimaxConfig<Move, GameState, RulesConfig>)
    : Minimax<Move, GameState, RulesConfig, unknown>
    {
        return this.aiInstances.getOrCreate(config, 'minimax', (): Minimax<Move, GameState, RulesConfig, unknown> => {
            return createMinimaxFromConfig(this.gameComponent.rules, config);
        });
    }

    private createIterativeMinimax(config: MinimaxConfig<Move, GameState, RulesConfig>)
    : IterativeDeepeningMinimax<Move, GameState, RulesConfig, unknown>
    {
        return this.aiInstances.getOrCreate(
            config,
            'iterative-deepening',
            (): IterativeDeepeningMinimax<Move, GameState, RulesConfig, unknown> => {
                return createIterativeDeepeningMinimaxFromConfig(this.gameComponent.rules, config);
            },
        );
    }

    private getMCTSConfigs(): MCTSConfig<Move, GameState, RulesConfig>[] {
        return this.gameComponent.aiConfig.mcts;
    }

    private createMCTS(config: MCTSConfig<Move, GameState, RulesConfig>)
    : MCTS<Move, GameState, RulesConfig, unknown>
    {
        return this.aiInstances.getOrCreate(config, 'mcts', (): MCTS<Move, GameState, RulesConfig, unknown> => {
            return createMCTSFromConfig(this.gameComponent.rules, config);
        });
    }

    public async doAIMove(playingAI: AbstractAI, options: AIOptions): Promise<MGPValidation> {
        // called only when it's AI's Turn
        const ruler: SuperRules<Move, GameState, RulesConfig, unknown> = this.gameComponent.rules;
        const config: RulesConfig = this.getConfig();
        const gameStatus: GameStatus = ruler.getGameStatus(this.gameComponent.node, config);
        Utils.assert(gameStatus === GameStatus.ONGOING, 'AI should not try to play when game is over!');
        const aiMove: Move = playingAI.chooseNextMove(this.gameComponent.node, options, config);
        const nextNode: MGPFallible<AbstractNode> = ruler.choose(this.gameComponent.node, aiMove, config);
        if (nextNode.isSuccess()) {
            this.gameComponent.hideLastMove();
            this.gameComponent.node = nextNode.get();
            await this.applyNewMove();
            return MGPValidation.SUCCESS;
        } else {
            return this.handleAIError(playingAI, aiMove, nextNode.getReason());
        }
    }

    private async applyNewMove(): Promise<void> {
        const lastMoveWasAI: boolean = this.lastMoveWasAI();
        await this.showNewMove(lastMoveWasAI);
        await this.updateWrapper();
        await this.proposeAIToPlay();
        this.cdr.detectChanges();
    }

    private async handleAIError(playingAI: AbstractAI, illegalMove: Move, error: string): Promise<MGPValidation> {
        this.messageDisplayer.criticalMessage($localize`The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!`);
        return Utils.logError('LocalGameWrapper', 'AI chose illegal move', {
            game: this.getGameUrlName(),
            name: playingAI.name,
            move: illegalMove.toString(),
            reason: error,
        });
    }

    public availableAIOptions(player: Player): AIOptions[] {
        switch (this.playerSelection.get(player)) {
            case 'minimax':
                return this.depthOptions();
            case 'iterative-deepening':
            case 'mcts':
                return this.timeOptions();
            case 'human':
                return [];
        }
    }

    public availableAIStrategies(): AIChoice[] {
        const strategies: AIChoice[] = [];
        if (this.getMinimaxConfigs().length > 0) {
            strategies.push({ id: 'minimax', name: $localize`Minimax` });
            strategies.push({ id: 'iterative-deepening', name: $localize`Iterative deepening` });
        }
        if (this.getMCTSConfigs().length > 0) {
            strategies.push({ id: 'mcts', name: $localize`MCTS` });
        }
        return strategies;
    }

    public availableAIProfiles(player: Player): AIChoice[] {
        switch (this.playerSelection.get(player)) {
            case 'minimax':
            case 'iterative-deepening':
                return this.getMinimaxConfigs();
            case 'mcts':
                return this.getMCTSConfigs();
            case 'human':
                return [];
        }
    }

    private depthOptions(): AIDepthLimitOptions[] {
        const options: AIDepthLimitOptions[] = [];
        for (let i: number = 1; i < 10; i++) {
            options.push({ name: `Level ${i}`, maxDepth: i });
        }
        return options;
    }

    private timeOptions(): AITimeLimitOptions[] {
        const options: AITimeLimitOptions[] = [];
        for (let i: number = 1; i < 10; i++) {
            options.push({ name: `${i*i} seconds`, maxSeconds: i*i });
        }
        return options;
    }

    public canTakeBack(): boolean {
        if (this.players.get(Player.ZERO).equalsValue('human')) {
            return this.gameComponent.getTurn() > 0;
        } else if (this.players.get(Player.ONE).equalsValue('human')) {
            return this.gameComponent.getTurn() > 1;
        } else {
            return false;
        }
    }

    public async takeBack(): Promise<void> {
        this.gameComponent.node = this.gameComponent.node.parent.get();
        if (this.isTurnOfPlayingAI()) {
            Utils.assert(this.gameComponent.node.parent.isPresent(),
                         'Cannot take back in first turn when AI is Player.ZERO');
            this.gameComponent.node = this.gameComponent.node.parent.get();
        }
        await this.showCurrentState(false);
    }

    private isTurnOfPlayingAI(): boolean {
        return this.getPlayingAI().isPresent();
    }

    public async restartGame(): Promise<void> {
        const config: RulesConfig = this.getConfig();
        this.gameComponent.node = this.gameComponent.rules.getInitialNode(config);
        this.gameComponent.cancelMoveAttempt();
        this.gameComponent.hideLastMove();
        await this.gameComponent.updateBoardAndRedraw(false);
        this.endGame = false;
        this.winnerMessage = MGPOptional.empty();
        await this.proposeAIToPlay();
    }

    public override getPlayer(): string {
        return 'human';
    }

    public override async onCancelMove(reason?: string): Promise<void> {
        await super.onCancelMove(reason);
        if (this.gameComponent.node.previousMove.isPresent()) {
            const move: Move = this.gameComponent.node.previousMove.get();
            await this.gameComponent.showLastMove(move);
        }
    }

    public override getConfig(): RulesConfig {
        return this.rulesConfig;
    }

    public displayAIInfo(): boolean {
        return localStorage.getItem('displayAIInfo') === 'true';
    }

    public viewTreeFromCurrentNode(): void {
        this.viewTreeFrom(this.gameComponent.node);
    }

    public viewTreeFromPreviousNode(): void {
        // Useful to explain why an AI has selected a particular node
        this.viewTreeFrom(this.gameComponent.node.parent.get());
    }

    private viewTreeFrom(node: GameNode<Move, GameState>): void {
        // We will use the data from the previous turn's AI
        const opponentAI: MGPOptional<{ ai: AbstractAI; options: AIOptions }> = this.getOpponentAI();
        // We will annotate the trees with data from MCTS
        function mctsLabel(nodeToLabel: GameNode<Move, GameState>): string {
            if (opponentAI.isPresent() && opponentAI.get().ai instanceof MCTS) {
                const mcts: MCTS<Move, GameState, RulesConfig, unknown> =
                    opponentAI.get().ai as MCTS<Move, GameState, RulesConfig, unknown>;
                const wins: number = mcts.getCounterFromCache(nodeToLabel, 'wins');
                const simulations: number = mcts.getCounterFromCache(nodeToLabel, 'simulations');
                return `${wins}/${simulations} = ${Math.round(wins/simulations * 100)}%`;
            } else {
                return '';
            }
        }
        const maxDepth: number = Number(localStorage.getItem('tree-depth') ?? '2'); // Change it to a lower/higher value for more tree depth
        const result: { dot: string; nextId: number; winner: PlayerOrNone } =
            node.showDot(this.gameComponent.rules, this.rulesConfig, mctsLabel, maxDepth);
        // Shows the graph on an online tool by opening a new tab
        window.open('https://dreampuf.github.io/GraphvizOnline/#' + encodeURI(result.dot));
    }

}

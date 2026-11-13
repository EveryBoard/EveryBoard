import { computed, signal, Signal, WritableSignal } from '@angular/core';

import { MoveGenerator } from '@everyboard/games';
import { AIConfig } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { Player } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { Table, TableUtils } from '@everyboard/games';
import { ScoreName } from '@everyboard/games';
import { MancalaConfig } from '@everyboard/games/families/mancala';
import { MancalaFailure } from '@everyboard/games/families/mancala';
import { MancalaDistribution, MancalaMove } from '@everyboard/games/families/mancala';
import {
    MancalaCaptureResult,
    MancalaDistributionResult,
    MancalaDropResult,
    MancalaRules,
} from '@everyboard/games/families/mancala';
import { MancalaScoreHeuristic } from '@everyboard/games/families/mancala';
import { MancalaState, MancalaDistributionDirection } from '@everyboard/games/families/mancala';
import { MGPOptional, MGPValidation, TimeUtils, Utils } from '@everyboard/lib';

import { ViewBox } from '../../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../../components/game-components/rectangular-game-component/RectangularGameComponent';

export type SeedDropResult = {
    direction: MancalaDistributionDirection;
    houseToDistribute: Coord;
    currentDropIsStore: boolean;
    seedsInHand: number;
    resultingState: MancalaState;
};

export abstract class MancalaComponent<R extends MancalaRules>
    extends RectangularGameComponent<R, MancalaMove, MancalaState, number, MancalaConfig>
{
    protected static readonly TIMEOUT_BETWEEN_SEEDS: number = 100;

    // The awaited time between two laps or distributions
    protected static readonly TIMEOUT_BETWEEN_LAPS: number = 1000;

    private static readonly SPACE_BETWEEN_PLAYER_ROW: number = 5;

    private static readonly SPACE_BETWEEN_PLAYERS: number = 20;

    private static readonly PADDING: number = 10;

    private lastDistributedHouses: Coord[] = [];

    private currentMove: MGPOptional<MancalaMove> = MGPOptional.empty();

    protected readonly selectedSpace: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());

    private captured: Table<number> = [];

    private droppedInStore: PlayerNumberMap = PlayerNumberMap.of(0, 0);

    protected filledCoords: Coord[] = [];

    protected constructedState: MancalaState;

    private opponentMoveIsBeingAnimated: boolean = false;

    protected constructor(urlName: string) {
        super(urlName);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    protected override getScoreName(): ScoreName {
        return ScoreName.CAPTURES;
    }

    protected readonly viewBoxWidth: Signal<number> = computed(() => this.viewBox().width - this.STROKE_WIDTH);

    private computeViewBoxWidth(): number {
        return 60 + ((2 + this.width()) * this.SPACE_SIZE);
    }

    protected override computeViewBox(): ViewBox {
        const left: number = - this.STROKE_WIDTH / 2;
        const up: number = - this.STROKE_WIDTH / 2;
        const width: number = this.computeViewBoxWidth() + this.STROKE_WIDTH;
        const height: number = this.getViewBoxHeight() + this.STROKE_WIDTH;
        return new ViewBox(left, up, width, height);
    }

    protected getViewBoxHeight(): number {
        const abstractHeight: number = this.config().numberOfRows * 2;
        const pieceHeight: number = abstractHeight * (this.SPACE_SIZE);
        const interPieceHeight: number = (abstractHeight - 1) * MancalaComponent.SPACE_BETWEEN_PLAYER_ROW;
        return (
            pieceHeight +
            interPieceHeight +
            MancalaComponent.SPACE_BETWEEN_PLAYERS +
            (MancalaComponent.PADDING * 2)
        );
    }

    protected getVerticalCenter(): number {
        return this.getViewBoxHeight() / 2;
    }

    protected getStoreTranslate(player: Player): string {
        const translateX: number = player === Player.ZERO ? 60 : this.viewBoxWidth() - 60;
        const translateY: number = this.getVerticalCenter();
        return `translate(${ translateX } ${ translateY })`;
    }

    protected getPieceCx(x: number): number {
        return 80 + 100 * (x + 1);
    }

    protected getPieceCy(y: number): number {
        let ry: number = y * (this.SPACE_SIZE + MancalaComponent.SPACE_BETWEEN_PLAYER_ROW);
        ry += 0.5 * this.SPACE_SIZE;
        ry += MancalaComponent.PADDING;
        if (this.config().numberOfRows <= y) {
            ry += MancalaComponent.SPACE_BETWEEN_PLAYERS;
        }
        return ry;
    }

    protected override async showLastMove(move: MancalaMove): Promise<void> {
        this.droppedInStore = PlayerNumberMap.of(0, 0);
        const previousState: MancalaState = this.getPreviousState();
        const config: MancalaConfig = this.config();
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeMove(move, previousState, config);
        this.filledCoords = distributionResult.filledCoords;
        let captureResult: MancalaCaptureResult = this.rules.applyCapture(distributionResult, config);
        this.captured = captureResult.captureMap;
        this.lastDistributedHouses = move.distributions.map((d: MancalaDistribution) => d.coord);
        const monsoonedPlayer: Player[] = this.rules.mustMonsoon(captureResult.resultingState, config);
        if (monsoonedPlayer.length > 0) {
            captureResult = this.rules.monsoon(Player.ZERO, captureResult); // Who captures here is not important
            this.captured = captureResult.captureMap;
        }
        this.changeVisibleState(this.state());
    }

    public override async updateBoard(triggerAnimation: boolean): Promise<void> {
        const state: MancalaState = this.state();
        if (triggerAnimation) {
            this.opponentMoveIsBeingAnimated = true;
            this.animationOngoing = true;
            Utils.assert(this.node().parent.isPresent(), 'triggerAnimation in store should be false at first turn');
            this.changeVisibleState(this.node().parent.get().gameState);
            let indexDistribution: number = 0;
            const move: MancalaMove = this.node().previousMove.get();
            for (const distributions of move) {
                await this.showSeedBySeedDistribution(distributions);
                if (indexDistribution + 1 < move.distributions.length) {
                    // This prevent to wait 1sec at the end of the animation for nothing
                    await TimeUtils.sleep(MancalaComponent.TIMEOUT_BETWEEN_LAPS);
                }
                indexDistribution++;
            }
            this.opponentMoveIsBeingAnimated = false;
            this.animationOngoing = false;
        }
        this.scores = MGPOptional.of(state.getScoresCopy());
        this.changeVisibleState(state);
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    protected async onClick(x: number, y: number): Promise<MGPValidation> {
        if (this.animationOngoing) {
            return MGPValidation.SUCCESS;
        } else {
            this.animationOngoing = true;
            const result: MGPValidation = await this.onLegalClick(x, y);
            this.animationOngoing = false;
            return result;
        }
    }

    protected async onLegalClick(x: number, y: number): Promise<MGPValidation> {
        // TODO: make it private and don't call it in tests
        const config: MancalaConfig = this.config();
        if (this.rules.getSpaceOwner(new Coord(x, y), config) === this.state().getCurrentOpponent()) {
            return this.cancelMove(MancalaFailure.MUST_DISTRIBUTE_YOUR_OWN_HOUSES());
        }
        if (this.constructedState.getPieceAtXY(x, y) === 0) {
            return this.cancelMove(MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE());
        } else {
            if (config.verticalSowing) {
                this.selectedSpace.set(MGPOptional.of(new Coord(x, y)));
                return MGPValidation.SUCCESS;
            } else {
                this.updateOrCreateCurrentMove('CLOCKWISE', x, y);
                return this.continueMoveConstruction('CLOCKWISE', x, y);
            }
        }
    }

    @ClickHandler((direction: MancalaDistributionDirection) => {
        return direction === 'CLOCKWISE' ? '#left-arrow' : '#up-arrow';
    })
    protected onDirectionClick(direction: MancalaDistributionDirection): Promise<MGPValidation> {
        const selectedSpace: Coord = this.selectedSpace().get();
        this.selectedSpace.set(MGPOptional.empty()); // TODO: test
        this.updateOrCreateCurrentMove(direction, selectedSpace.x, selectedSpace.y);
        return this.continueMoveConstruction(direction, selectedSpace.x, selectedSpace.y);
    }

    protected async continueMoveConstruction(
        direction: MancalaDistributionDirection,
        x: number,
        y: number,
    ): Promise<MGPValidation> {
        const moveValidity: MGPValidation = await this.isDistributionLegal(direction, x, y);
        if (moveValidity.isFailure()) {
            return this.cancelMove(moveValidity.getReason());
        }
        const distributionResult: MancalaDistributionResult =
            await this.showSeedBySeedDistribution(MancalaDistribution.of(direction, x, y));
        if (distributionResult.endsUpInStore &&
            this.config().mustContinueDistributionAfterStore)
        {
            const player: Player = this.constructedState.getCurrentPlayer();
            if (MancalaRules.isStarving(player, distributionResult.resultingState.board, this.config())) {
                // Player has no more seed to distribute
                return this.chooseMove(this.currentMove.get());
            } else {
                // Player can still distribute
                return MGPValidation.SUCCESS;
            }
        } else {
            return this.chooseMove(this.currentMove.get());
        }
    }

    private async isDistributionLegal(
        direction: MancalaDistributionDirection,
        x: number,
        y: number,
    ): Promise<MGPValidation> {
        const config: MancalaConfig = this.config();
        const distributionResult: MancalaDistributionResult =
            await this.getDistributionResult(MancalaDistribution.of(direction, x, y));
        if (distributionResult.endsUpInStore &&
            config.mustContinueDistributionAfterStore
        ) {
            const player: Player = this.constructedState.getCurrentPlayer();
            if (MancalaRules.isStarving(player, distributionResult.resultingState.board, this.config())) {
                // Player has no more seed to distribute
                return this.rules.isLegal(this.currentMove.get(), this.state(), config);
            } else {
                // Player can still distribute
                return MGPValidation.SUCCESS;
            }
        } else {
            return this.rules.isLegal(this.currentMove.get(), this.state(), config);
        }
    }

    private async getDistributionResult(distribution: MancalaDistribution): Promise<MancalaDistributionResult> {
        return this.getSimpleDistributionResult(distribution, false);
    }

    private async showSeedBySeedDistribution(distribution: MancalaDistribution): Promise<MancalaDistributionResult> {
        return this.getSimpleDistributionResult(distribution, true);
    }

    private async getSimpleDistributionResult(
        distribution: MancalaDistribution,
        showSeedBySeed: boolean,
    ): Promise<MancalaDistributionResult> {
        const state: MancalaState = this.constructedState;
        const coord: Coord = distribution.coord;
        this.lastDistributedHouses.push(coord);
        const config: MancalaConfig = this.config();
        if (showSeedBySeed) {
            await this.showSeedBySeed(distribution, state);
        }
        const previousDistributionResult: MancalaDistributionResult = MancalaRules.getEmptyDistributionResult(state);
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeHouse(distribution, previousDistributionResult, config);
        return distributionResult;
    }

    private async showSeedBySeed(distribution: MancalaDistribution, state: MancalaState): Promise<void> {
        const config: MancalaConfig = this.config();
        // to remember in order not to sow in the starting space if we make a full turn
        const initial: Coord = distribution.coord;
        let mustDoOneMoreLap: boolean = true;
        let seedDropResult: SeedDropResult = {
            direction: distribution.direction,
            currentDropIsStore: false,
            houseToDistribute: distribution.coord,
            resultingState: state,
            seedsInHand: 0,
        };
        while (mustDoOneMoreLap) {
            seedDropResult.seedsInHand =
                seedDropResult.resultingState.getPieceAt(seedDropResult.houseToDistribute);
            seedDropResult.resultingState =
                seedDropResult.resultingState.setPieceAt(seedDropResult.houseToDistribute, 0);
            // Changing immediately the chosen house
            this.changeVisibleState(seedDropResult.resultingState);
            await TimeUtils.sleep(MancalaComponent.TIMEOUT_BETWEEN_SEEDS);
            while (seedDropResult.seedsInHand > 0) {
                seedDropResult = await this.showSeedDrop(
                    seedDropResult,
                    config,
                    initial,
                );
            }
            if (seedDropResult.currentDropIsStore || config.continueLapUntilCaptureOrEmptyHouse === false) {
                mustDoOneMoreLap = false;
            } else {
                const lastHouseContent: number =
                    seedDropResult.resultingState.getPieceAt(seedDropResult.houseToDistribute);
                mustDoOneMoreLap = lastHouseContent !== 1 && this.rules.isCapturableValue(lastHouseContent) === false;
                if (mustDoOneMoreLap) {
                    await TimeUtils.sleep(MancalaComponent.TIMEOUT_BETWEEN_LAPS);
                }
            }
        }
    }

    private async showSeedDrop(seedDropResult: SeedDropResult,
                               config: MancalaConfig,
                               initial: Coord,
    ): Promise<SeedDropResult> {
        const player: Player = seedDropResult.resultingState.getCurrentPlayer();
        const nextCoord: MGPOptional<Coord> = this.rules.getNextCoord(
            seedDropResult.direction,
            seedDropResult.houseToDistribute,
            seedDropResult.currentDropIsStore,
            seedDropResult.resultingState,
            config,
        );
        const currentDropIsStore: boolean = nextCoord.isAbsent();
        let seedsInHand: number = seedDropResult.seedsInHand;
        let resultingState: MancalaState = seedDropResult.resultingState;
        let houseToDistribute: Coord = seedDropResult.houseToDistribute;
        if (currentDropIsStore) {
            seedsInHand--;
            this.filledCoords.push(MancalaRules.FAKE_STORE_COORD.get(player).get());
            this.droppedInStore.add(player, 1);
            resultingState = resultingState.feedStore(player);
        } else {
            houseToDistribute = nextCoord.get();
            if (initial.equals(houseToDistribute) === false || config.feedOriginalHouse) {
                // not to distribute on our starting space
                const feedResult: MancalaDropResult =
                    this.rules.getDropResult(seedsInHand, resultingState, houseToDistribute);
                resultingState = feedResult.resultingState;
                this.captured = TableUtils.add(this.captured, feedResult.captureMap);
                this.filledCoords.push(houseToDistribute);
                seedsInHand--; // drop in this space a piece we have in hand
            }
        }
        this.changeVisibleState(resultingState);
        if (seedsInHand > 0) {
            await TimeUtils.sleep(MancalaComponent.TIMEOUT_BETWEEN_SEEDS);
        }
        return {
            direction: seedDropResult.direction,
            houseToDistribute,
            currentDropIsStore,
            seedsInHand,
            resultingState,
        };
    }

    public override hideLastMove(): void {
        const width: number = this.width();
        const height: number = this.height();
        this.captured = TableUtils.create(width, height, 0);
        this.filledCoords = [];
        this.lastDistributedHouses = [];
        this.changeVisibleState(this.state());
    }

    public override cancelMoveAttempt(): void {
        this.currentMove = MGPOptional.empty();
        this.droppedInStore = PlayerNumberMap.of(0, 0);
        this.filledCoords = [];
        this.lastDistributedHouses = [];
        this.changeVisibleState(this.state());
        // this.selectedSpace.set(MGPOptional.empty()); // TODO TEST
    }

    protected getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const homeOwner: Player = this.rules.getSpaceOwner(coord, this.config());
        const homeColor: string = this.getPlayerClass(homeOwner);
        if (this.rules.getStoreOwner(coord).isAbsent() && y < this.captured.length && this.captured[y][x] > 0) {
            return ['captured-fill', 'moved-stroke'];
        } else if (this.lastDistributedHouses.some((c: Coord) => c.equals(coord))) {
            return ['last-move-stroke', homeColor];
        } else if (this.filledCoords.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', homeColor];
        } else {
            return [homeColor];
        }
    }

    protected getPieceTransform(x: number, y: number): string {
        const cx: number = this.getPieceCx(x);
        const cy: number = this.getPieceCy(y);
        return this.getSVGTranslation(cx, cy);
    }

    protected getPieceRotation(): string {
        return 'rotate(' + this.getPointOfView().getValue() * 180 + ')';
    }

    protected getHouseSecondaryContent(x: number, y: number): MGPOptional<string> {
        const previousContent: number = this.getPreviousStableState().getPieceAtXY(x, y);
        const currentContent: number = this.constructedState.getPieceAtXY(x, y);
        const difference: number = currentContent - previousContent;
        if (y < this.captured.length && this.captured[y][x] > 0) {
            return MGPOptional.of('-' + this.captured[y][x]);
        } else if (difference > 0) {
            return MGPOptional.of('+' + difference);
        } else if (difference < 0) {
            return MGPOptional.of('' + difference);
        } else {
            return MGPOptional.empty();
        }
    }

    protected getStoreContent(owner: Player): number {
        return this.scores.get().get(owner) + this.droppedInStore.get(owner);
    }

    protected getStoreSecondaryContent(owner: Player): MGPOptional<string> {
        const previousScore: number = this.getPreviousStableState().scores.get(owner);
        const currentScore: number = this.constructedState.scores.get(owner);
        const difference: number = currentScore - previousScore;
        if (difference > 0) {
            return MGPOptional.of('+' + difference);
        } else {
            return MGPOptional.empty();
        }
    }

    private getPreviousStableState(): MancalaState {
        if (this.opponentMoveIsBeingAnimated) {
            Utils.assert(this.getTurn() > 0, 'Kalah: Should not animate move at turn 0');
            return this.node().parent.get().gameState;
        } else {
            if (this.constructedState.equals(this.state())) {
                if (this.node().parent.isPresent()) {
                    return this.node().parent.get().gameState;
                } else {
                    return this.state();
                }
            } else {
                return this.state();
            }
        }
    }

    @ClickHandler((owner: Player) => `#store-${ owner.toString() }`)
    protected async onStoreClick(_: Player): Promise<MGPValidation> {
        return this.cancelMove(MancalaFailure.MUST_DISTRIBUTE_YOUR_OWN_HOUSES());
    }

    private changeVisibleState(state: MancalaState): void {
        this.constructedState = state;
        this.board = this.constructedState.board;
        this.cdr.detectChanges();
    }

    protected createAIConfig(
        moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>,
    ): AIConfig<MancalaMove, MancalaState, MancalaConfig> {
        return {
            minimax: [{
                id: 'score',
                name: $localize`Score`,
                heuristic: () => new MancalaScoreHeuristic(),
                moveGenerator: () => moveGenerator,
                hash: (state: MancalaState) =>
                    `${state.turn % 2}-${JSON.stringify(state.board)}-${JSON.stringify(state.scores)}`,
            }],
            mcts: [
                {
                    id: 'default',
                    name: $localize`Default`,
                    moveGenerator: () => moveGenerator,
                },
                {
                    id: 'Score',
                    name: $localize`Score`,
                    moveGenerator: () => moveGenerator,
                    heuristic: () => new MancalaScoreHeuristic(),
                },
            ],
        };
    }

    /**
     * Used to create or update this.currentMove
     * for single sow it will always be creating it
     * for multiple sow it will sometime be the second sub-distribution of the move
     * @param x the X value of the distribution that has been done
     * @param y the Y value of the distribution that has been done
     */
    protected updateOrCreateCurrentMove(direction: MancalaDistributionDirection, x: number, y: number): void {
        if (this.currentMove.isPresent()) {
            const newMove: MancalaMove = this.addToMove(direction, x, y);
            this.currentMove = MGPOptional.of(newMove);
        } else {
            this.currentMove = MGPOptional.of(this.generateMove(direction, x, y));
        }
    }

    protected generateMove(direction: MancalaDistributionDirection, x: number, y: number): MancalaMove {
        return MancalaMove.of(MancalaDistribution.of(direction, x, y));
    }

    protected addToMove(direction: MancalaDistributionDirection, x: number, y: number): MancalaMove {
        return this.currentMove.get().add(MancalaDistribution.of(direction, x, y));
    }

}

import { MancalaState } from './MancalaState';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MancalaDistribution, MancalaMove } from './MancalaMove';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from './MancalaRules';
import { ChangeDetectorRef } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MancalaFailure } from './MancalaFailure';
import { TimeUtils } from 'src/app/utils/TimeUtils';
import { Utils } from 'src/app/utils/utils';
import { AI, AIOptions, MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MancalaConfig } from './MancalaConfig';
import { MancalaScoreMinimax } from './MancalaScoreMinimax';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MCTS } from 'src/app/jscaip/AI/MCTS';

export abstract class MancalaComponent<R extends MancalaRules>
    extends RectangularGameComponent<R, MancalaMove, MancalaState, number, MancalaConfig>
{
    public static readonly TIMEOUT_BETWEEN_SEED: number = 200;

    // The awaited time between two laps or distributions
    public static readonly TIMEOUT_BETWEEN_LAPS: number = 1000;

    public MGPOptional: typeof MGPOptional = MGPOptional;

    public lastDistributedHouses: Coord[] = [];

    public currentMove: MGPOptional<MancalaMove> = MGPOptional.empty();

    private clickOngoing: boolean = false;

    public captured: Table<number> = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    public droppedInStore: [number, number] = [0, 0];

    protected filledCoords: Coord[] = [];

    public constructedState: MancalaState;

    private opponentMoveIsBeingAnimated: boolean = false;

    public constructor(messageDisplayer: MessageDisplayer,
                       public readonly cdr: ChangeDetectorRef)
    {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    public getMancalaViewBox(): string {
        const left: number = - this.STROKE_WIDTH / 2;
        const up: number = - this.STROKE_WIDTH / 2;
        const width: number = this.getViewBoxWidth() + this.STROKE_WIDTH;
        const height: number = (2 * this.SPACE_SIZE) + 50;
        return left + ' ' + up + ' ' + width + ' ' + height;
    }

    public getViewBoxWidth(): number {
        return 60 + ((2 + this.getState().getWidth()) * this.SPACE_SIZE);
    }

    public override async showLastMove(move: MancalaMove): Promise<void> {
        this.droppedInStore = [0, 0];
        const previousState: MancalaState = this.getPreviousState();
        const config: MancalaConfig = this.getConfig().get();
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeMove(move, previousState, config);
        this.filledCoords = distributionResult.filledCoords;
        let captureResult: MancalaCaptureResult = this.rules.applyCapture(distributionResult);
        this.captured = captureResult.captureMap;
        const playerY: number = previousState.getCurrentPlayerY();
        this.lastDistributedHouses = move.distributions.map((d: MancalaDistribution) => new Coord(d.x, playerY));
        const mansoonedPlayer: PlayerOrNone = this.rules.mustMansoon(captureResult.resultingState, config);
        if (mansoonedPlayer !== PlayerOrNone.NONE) {
            captureResult = this.rules.monsoon(mansoonedPlayer as Player, captureResult);
            this.captured = captureResult.captureMap;
        }
        this.changeVisibleState(this.getState());
    }

    public async updateBoard(triggerAnimation: boolean): Promise<void> {
        const state: MancalaState = this.getState();
        if (triggerAnimation) {
            this.opponentMoveIsBeingAnimated = true;
            Utils.assert(this.node.parent.isPresent(), 'triggerAnimation in store should be false at first turn');
            this.changeVisibleState(this.node.parent.get().gameState);
            let indexDistribution: number = 0;
            const move: MancalaMove = this.node.previousMove.get();
            for (const distributions of move) {
                await this.showSimpleDistribution(distributions);
                if (indexDistribution + 1 < move.distributions.length) {
                    // This prevent to wait 1sec at the end of the animation for nothing
                    await TimeUtils.sleep(MancalaComponent.TIMEOUT_BETWEEN_LAPS);
                }
                indexDistribution++;
            }
            this.opponentMoveIsBeingAnimated = false;
        }
        this.scores = MGPOptional.of(state.getScoresCopy());
        this.changeVisibleState(state);
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.clickOngoing === true) {
            return MGPValidation.SUCCESS;
        } else if (this.opponentMoveIsBeingAnimated === true) {
            return MGPValidation.SUCCESS;
        } else {
            this.clickOngoing = true;
            const result: MGPValidation = await this.onLegalClick(x, y);
            this.clickOngoing = false;
            return result;
        }
    }

    public async onLegalClick(x: number, y: number): Promise<MGPValidation> {
        if (y === this.getState().getCurrentPlayer().getValue()) {
            return this.cancelMove(MancalaFailure.MUST_DISTRIBUTE_YOUR_OWN_HOUSES());
        }
        this.updateOrCreateCurrentMove(x);
        if (this.constructedState.getPieceAtXY(x, y) === 0) {
            return this.cancelMove(MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE());
        } else {
            return this.continueMoveConstruction(x);
        }
    }

    protected async continueMoveConstruction(x: number): Promise<MGPValidation> {
        const distributionResult: MancalaDistributionResult =
            await this.showSimpleDistribution(MancalaDistribution.of(x));
        const config: MancalaConfig = this.getConfig().get();
        if (distributionResult.endsUpInStore &&
            config.mustContinueDistributionAfterStore)
        {
            const player: Player = this.constructedState.getCurrentPlayer();
            if (MancalaRules.isStarving(player, distributionResult.resultingState.board)) {
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

    protected async showSimpleDistribution(distribution: MancalaDistribution): Promise<MancalaDistributionResult> {
        const state: MancalaState = this.constructedState;
        const playerY: number = state.getCurrentPlayerY();
        const coord: Coord = new Coord(distribution.x, playerY);
        this.lastDistributedHouses.push(coord);
        const config: MancalaConfig = this.getConfig().get();
        await this.showSeedBySeed(coord, state, config);
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeHouse(distribution.x, playerY, state, config);
        return distributionResult;
    }

    private async showSeedBySeed(coord: Coord, state: MancalaState, config: MancalaConfig): Promise<void> {
        const resultingBoard: number[][] = state.getCopiedBoard();
        const player: Player = state.getCurrentPlayer();
        const initial: Coord = coord; // to remember in order not to sow in the starting space if we make a full turn
        let seedsInHand: number = resultingBoard[coord.y][coord.x];
        let currentDropIsStore: boolean = false;
        const scores: PlayerNumberMap = state.getScoresCopy();
        resultingBoard[coord.y][coord.x] = 0;
        // Changing immediately the chosen house
        this.changeVisibleState(new MancalaState(resultingBoard, state.turn, scores));
        await TimeUtils.sleep(MancalaComponent.TIMEOUT_BETWEEN_SEED);
        while (seedsInHand > 0) {
            const nextCoord: MGPOptional<Coord> =
                this.rules.getNextCoord(coord, player, currentDropIsStore, state, config);
            currentDropIsStore = nextCoord.isAbsent();
            if (currentDropIsStore) {
                seedsInHand--;
                this.filledCoords.push(MancalaRules.FAKE_STORE_COORD.get(player).get());
                this.droppedInStore[player.getValue()] += 1;
                scores.add(player, 1);
            } else {
                coord = nextCoord.get();
                if (initial.equals(coord) === false || config.feedOriginalHouse) {
                    // not to distribute on our starting space
                    resultingBoard[coord.y][coord.x] += 1;
                    this.filledCoords.push(coord);
                    seedsInHand--; // drop in this space a piece we have in hand
                }
            }
            this.changeVisibleState(new MancalaState(resultingBoard, state.turn, scores));
            await TimeUtils.sleep(MancalaComponent.TIMEOUT_BETWEEN_SEED);
        }
    }

    public override hideLastMove(): void {
        this.captured = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        this.filledCoords = [];
        this.lastDistributedHouses = [];
        this.changeVisibleState(this.getState());
    }

    public override cancelMoveAttempt(): void {
        this.currentMove = MGPOptional.empty();
        this.droppedInStore = [0, 0];
        this.filledCoords = [];
        this.lastDistributedHouses = [];
        this.changeVisibleState(this.getState());
    }

    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const homeOwner: Player = this.getSpaceOwner(coord);
        const homeColor: string = this.getPlayerClass(homeOwner);
        if (this.getStoreOwner(coord).isAbsent() && this.captured[y][x] > 0) {
            return ['captured-fill', 'moved-stroke'];
        } else if (this.lastDistributedHouses.some((c: Coord) => c.equals(coord))) {
            return ['last-move-stroke', homeColor];
        } else if (this.filledCoords.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', homeColor];
        } else {
            return [homeColor];
        }
    }

    private getStoreOwner(coord: Coord): MGPOptional<MGPSet<Player>> {
        return MancalaRules.FAKE_STORE_COORD.reverse().get(coord);
    }

    private getSpaceOwner(coord: Coord): Player {
        const owner: MGPOptional<MGPSet<Player>> = this.getStoreOwner(coord);
        if (owner.isPresent()) {
            return owner.get().getAnyElement().get(); // Only one player can be in there
        } else {
            return Player.of((coord.y + 1) % 2);
        }
    }

    public getPieceCx(x: number): number {
        return 80 + 100 * (x + 1);
    }

    public getPieceCy(y: number): number {
        return 60 + 120 * y;
    }

    public getPieceTransform(x: number, y: number): string {
        return 'translate(' + this.getPieceCx(x) + ', ' + this.getPieceCy(y) + ')';
    }

    public getPieceRotation(): string {
        return 'rotate(' + this.getPointOfView().getValue() * 180 + ')';
    }

    public getHouseSecondaryContent(x: number, y: number): MGPOptional<string> {
        const previousContent: number = this.getPreviousStableState().getPieceAtXY(x, y);
        const currentContent: number = this.constructedState.getPieceAtXY(x, y);
        const difference: number = currentContent - previousContent;
        if (this.captured[y][x] > 0) {
            return MGPOptional.of('-' + this.captured[y][x]);
        } else if (difference > 0) {
            return MGPOptional.of('+' + difference);
        } else if (difference < 0) {
            return MGPOptional.of('' + difference);
        } else {
            return MGPOptional.empty();
        }
    }

    public getStoreContent(owner: Player): number {
        return this.scores.get().get(owner).get() + this.droppedInStore[owner.getValue()];
    }

    public getStoreSecondaryContent(owner: Player): MGPOptional<string> {
        const previousScore: number = this.getPreviousStableState().scores.get(owner).get();
        const currentScore: number = this.constructedState.scores.get(owner).get();
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
            return this.node.parent.get().gameState;
        } else {
            if (this.constructedState.equals(this.getState()) === true) {
                if (this.node.parent.isPresent()) {
                    return this.node.parent.get().gameState;
                } else {
                    return this.getState();
                }
            } else {
                return this.getState();
            }
        }
    }

    public async onStoreClick(owner: Player): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#store_player_' + owner.getValue());
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        return this.cancelMove(MancalaFailure.MUST_DISTRIBUTE_YOUR_OWN_HOUSES());
    }

    private changeVisibleState(state: MancalaState): void {
        this.constructedState = state;
        this.board = this.constructedState.board;
        this.cdr.detectChanges();
    }

    protected createAIs(moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>)
    : AI<MancalaMove, MancalaState, AIOptions, MancalaConfig>[]
    {
        return [
            new MancalaScoreMinimax(this.rules, moveGenerator),
            new MCTS($localize`MCTS`, moveGenerator, this.rules),
        ];
    }

    /**
     * Used to create or update this.currentMove
     * for single sow it will always be creating it
     * for multiple sow it will sometime be the second sub-distribution of the move
     * @param x the X value of the distribution that has been done
     */
    protected updateOrCreateCurrentMove(x: number): void {
        if (this.currentMove.isAbsent()) {
            this.hideLastMove();
            this.currentMove = MGPOptional.of(this.generateMove(x));
        } else {
            const newMove: MancalaMove = this.addToMove(x);
            this.currentMove = MGPOptional.of(newMove);
        }
    }

    public generateMove(x: number): MancalaMove {
        return MancalaMove.of(MancalaDistribution.of(x));
    }

    protected addToMove(x: number): MancalaMove {
        return this.currentMove.get().add(MancalaDistribution.of(x));
    }

}

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

export abstract class MancalaComponent<R extends MancalaRules<M>, M extends MancalaMove>
    extends RectangularGameComponent<R, M, MancalaState, number>
{
    public MGPOptional: typeof MGPOptional = MGPOptional;

    public lasts: Coord[] = [];

    public currentMove: MGPOptional<M> = MGPOptional.empty();

    private clickOngoing: boolean = false;

    public captured: Table<number> = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    public droppedInKalah: [number, number] = [0, 0];

    protected filledHouses: Coord[] = [];

    public constructedState: MancalaState;

    public constructor(messageDisplayer: MessageDisplayer,
                       public readonly cdr: ChangeDetectorRef)
    {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
    }
    public override async showLastMove(move: M): Promise<void> {
        const previousState: MancalaState = this.getPreviousState();
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeMove(move, previousState);
        this.filledHouses = distributionResult.filledHouses;
        let captureResult: MancalaCaptureResult = this.rules.applyCapture(distributionResult);
        this.captured = captureResult.captureMap;
        const playerY: number = previousState.getCurrentOpponent().value;
        this.lasts = move.subMoves.map((value: MancalaDistribution) => new Coord(value.x, playerY));
        const mansoonedPlayer: PlayerOrNone = this.rules.mustMansoon(captureResult.resultingState);
        if (mansoonedPlayer !== PlayerOrNone.NONE) {
            captureResult = this.rules.mansoon(mansoonedPlayer as Player, captureResult);
            this.captured = captureResult.captureMap;
        }
        this.droppedInKalah = [0, 0];
        this.changeVisibleState(this.getState());
    }
    public async updateBoard(triggerAnimation: boolean): Promise<void> {
        const state: MancalaState = this.getState();
        if (triggerAnimation) {
            this.changeVisibleState(this.node.mother.get().gameState);
            let indexDistribution: number = 0;
            for (const subMove of this.node.move.get()) {
                await this.showSimpleDistribution(subMove);
                if (indexDistribution + 1 < this.node.move.get().subMoves.length) {
                    // This prevent to wait 1sec at the end of the animation for nothing
                    await new Promise((resolve: (result: void) => void) => {
                        window.setTimeout(resolve, 1000);
                    });
                }
                indexDistribution++;
            }
        }
        this.scores = MGPOptional.of(state.getCapturedCopy());
        this.changeVisibleState(state);
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.clickOngoing === true) {
            return MGPValidation.SUCCESS;
        } else {
            this.clickOngoing = true;
            const result: MGPValidation = await this.onLegalClick(x, y);
            this.clickOngoing = false;
            return result;
        }
    }
    public async onLegalClick(x: number, y: number): Promise<MGPValidation> {
        if (y === this.getState().getCurrentPlayer().value) {
            return this.cancelMove(MancalaFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
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
        if (distributionResult.endUpInKalah) {
            const player: Player = this.constructedState.getCurrentPlayer();
            if (MancalaRules.isStarving(player, distributionResult.resultingState.board)) {
                // Player has no longer seed to distribute
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
        const lastPlayer: Player = state.getCurrentOpponent();
        const playerY: number = lastPlayer.value;
        await this.showSeedBySeed(distribution.x, playerY, state);
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeHouse(distribution.x, playerY, state);
        return distributionResult;
    }
    private async showSeedBySeed(x :number, y: number, state: MancalaState): Promise<void> {
        let coord: Coord = new Coord(x, y);
        this.lasts.push(coord);
        const resultingBoard: number[][] = state.getCopiedBoard();
        const player: Player = state.getCurrentPlayer();
        // iy and ix are the initial spaces
        const i: Coord = new Coord(x, y);
        // to remember in order not to sow in the starting space if we make a full turn
        let inHand: number = resultingBoard[y][x];
        resultingBoard[y][x] = 0;
        let previousDropWasKalah: boolean = false;
        let endUpInKalah: boolean = false;
        // Changing immediately the chosen house
        this.changeVisibleState(new MancalaState(resultingBoard, state.turn, state.captured));
        await new Promise((resolve: (result: void) => void) => {
            window.setTimeout(resolve, 200);
        });
        while (inHand > 0) {
            previousDropWasKalah = endUpInKalah;
            endUpInKalah = false;
            // get next space
            const nextCoord: MGPOptional<Coord> = this.rules.getNextCoord(coord, player, previousDropWasKalah);
            endUpInKalah = nextCoord.isAbsent();

            if (endUpInKalah) {
                inHand--;
                this.filledHouses.push(MancalaRules.FAKE_KALAH_COORD.get(player).get());
                this.droppedInKalah[player.value] += 1;
            } else {
                coord = nextCoord.get();
                if (i.equals(coord) === false) { // TODO: adapt the fillInitHouseOrNot
                    // not to distribute on our starting space
                    resultingBoard[coord.y][coord.x] += 1;
                    this.filledHouses.push(coord);
                    inHand--; // drop in this space a piece we have in hand
                }
            }
            this.changeVisibleState(new MancalaState(resultingBoard, state.turn, state.captured));
            await new Promise((resolve: (result: void) => void) => {
                window.setTimeout(resolve, 200);
            });
        }
    }
    public override hideLastMove(): void {
        this.captured = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        this.droppedInKalah = [0, 0];
        this.filledHouses = [];
        this.lasts = [];
        this.changeVisibleState(this.getState());
    }
    public override cancelMoveAttempt(): void {
        this.currentMove = MGPOptional.empty();
    }
    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const homeOwner: Player = this.getSpaceOwner(coord);
        const homeColor: string = this.getPlayerClass(homeOwner);
        if (this.getKalahOwner(coord).isAbsent() && this.captured[y][x] > 0) {
            return ['captured-fill', 'moved-stroke'];
        } else if (this.lasts.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', 'last-move-stroke', homeColor];
        } else if (this.filledHouses.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', homeColor];
        } else {
            return [homeColor];
        }
    }
    private getKalahOwner(coord: Coord): MGPOptional<MGPSet<Player>> {
        return MancalaRules.FAKE_KALAH_COORD.reverse().get(coord);
    }
    private getSpaceOwner(coord: Coord): Player {
        const owner: MGPOptional<MGPSet<Player>> = this.getKalahOwner(coord);
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
        return 'rotate(' + this.role.value * 180 + ')';
    }
    private changeVisibleState(state: MancalaState): void {
        this.constructedState = state;
        this.board = this.constructedState.board;
        this.cdr.detectChanges();
    }
    protected abstract updateOrCreateCurrentMove(x: number): void;

    public abstract generateMove(x: number): M;
}

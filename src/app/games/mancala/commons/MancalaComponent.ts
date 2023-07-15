import { MancalaState } from './MancalaState';
import { Move } from 'src/app/jscaip/Move';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MancalaMove } from './MancalaMove';
import { Player } from 'src/app/jscaip/Player';
import { MancalaDistributionResult, MancalaRules } from './MancalaRules';
import { ChangeDetectorRef } from '@angular/core';

export abstract class MancalaComponent<R extends MancalaRules<M>, M extends Move>
    extends RectangularGameComponent<R, M, MancalaState, number>
{

    public MGPOptional: typeof MGPOptional = MGPOptional;

    public constructor(messageDisplayer: MessageDisplayer,
                       public readonly cdr: ChangeDetectorRef)
    {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
    }
    public lasts: Coord[] = [];

    public captured: Table<number> = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    protected filledHouses: Coord[] = [];

    public constructedState: MGPOptional<MancalaState> = MGPOptional.empty();

    protected async showSimpleDistributionFor(distribution: MancalaMove, state: MancalaState)
    : Promise<MancalaDistributionResult>
    {
        const lastPlayer: Player = state.getCurrentOpponent();
        const playerY: number = lastPlayer.value;
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeHouse(distribution.x, playerY, state);
        await this.showSeedBySeed(distribution.x, playerY, state);

        this.lasts = [new Coord(distribution.x, playerY)];
        this.filledHouses = distributionResult.filledHouses;
        return distributionResult;
    }
    private async showSeedBySeed(x :number, y: number, state: MancalaState): Promise<void> {
        let coord: Coord = new Coord(x, y);
        this.lasts = [coord];
        const resultingBoard: number[][] = state.getCopiedBoard();
        const player: Player = state.getCurrentPlayer();
        // iy and ix are the initial spaces
        const i: Coord = new Coord(x, y);
        // to remember in order not to sow in the starting space if we make a full turn
        let inHand: number = resultingBoard[y][x];
        this.filledHouses = [];
        resultingBoard[y][x] = 0;
        let previousDropWasKalah: boolean = false;
        let endUpInKalah: boolean = false;
        // Changing immediately the chosen house
        this.changeVisibleState(new MancalaState(resultingBoard, state.turn, state.captured));
        await new Promise((resolve: (result: void) => void) => {
            setTimeout(resolve, 200);
        });
        while (inHand > 0) {
            previousDropWasKalah = endUpInKalah;
            endUpInKalah = false;
            // get next space
            const nextCoord: MGPOptional<Coord> = this.rules.getNextCoord(coord, player, previousDropWasKalah);
            endUpInKalah = nextCoord.isAbsent();

            if (endUpInKalah) {
                inHand--;
            } else {
                coord = nextCoord.get();
                if (i.equals(coord) === false) {
                    // not to distribute on our starting space
                    resultingBoard[coord.y][coord.x] += 1;
                    this.filledHouses.push(coord);
                    inHand--; // drop in this space a piece we have in hand
                }
            }
            this.changeVisibleState(new MancalaState(resultingBoard, state.turn, state.captured));
            await new Promise((resolve: (result: void) => void) => {
                setTimeout(resolve, 200);
            });
        }
    }
    protected hidePreviousMove(): void {
        this.captured = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        this.filledHouses = [];
        this.lasts = [];
    }
    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const homeColor: string = 'player' + (y + 1) % 2 + '-fill';
        if (this.captured[y][x] > 0) {
            return ['captured-fill', 'moved-stroke'];
        } else if (this.lasts.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', 'last-move-stroke', homeColor];
        } else if (this.filledHouses.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', homeColor];
        } else {
            return [homeColor];
        }
    }
    public getPieceCx(x: number): number {
        return 60 + 100 * (x + 1);
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
    public changeVisibleState(state: MancalaState): void {
        this.constructedState = MGPOptional.of(state);
        this.board = this.constructedState.get().board;
        this.cdr.detectChanges();
        console.log('change detected!')
    }
}

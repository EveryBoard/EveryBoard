import { computed, Signal, signal, WritableSignal } from '@angular/core';

import { Coord } from '@everyboard/games';
import { Direction } from '@everyboard/games';
import { FourStatePiece } from '@everyboard/games';
import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { ReversiConfig } from '@everyboard/games/families/reversi';
import { ReversiLegalityInformation } from '@everyboard/games/families/reversi';
import { TopologicReversiRules } from '@everyboard/games/families/reversi';
import { ReversiHeuristic } from '@everyboard/games/families/reversi';
import { ReversiMove } from '@everyboard/games/families/reversi';
import { ReversiMoveGenerator } from '@everyboard/games/families/reversi';
import { ReversiState } from '@everyboard/games/families/reversi';
import { MGPMap, MGPOptional, MGPValidation, Set, Utils } from '@everyboard/lib';

import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { TopologicGameComponent } from '../../../components/game-components/topologic-game-component/TopologicGameComponent';

export abstract class AbstractReversiComponent<R extends TopologicReversiRules> extends TopologicGameComponent<
    R,
    ReversiMove,
    ReversiState<Direction>,
    FourStatePiece,
    ReversiConfig,
    ReversiLegalityInformation
> {
    protected readonly lastMove: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());

    private readonly captured: WritableSignal<Set<Coord>> = signal(new Set());

    public constructor(urlName: string) {
        super(urlName);
        this.aiConfig = {
            minimax: [{
                id: 'Piece Count',
                name: $localize`Piece Count`,
                heuristic: (): ReversiHeuristic => new ReversiHeuristic(this.rules),
                moveGenerator: (): ReversiMoveGenerator => new ReversiMoveGenerator(this.rules),
            }],
            mcts: [{
                id: 'default',
                name: $localize`Default`,
                moveGenerator: (): ReversiMoveGenerator => new ReversiMoveGenerator(this.rules),
            }],
        };
        this.encoder = ReversiMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(2, 2));
    }

    @ClickHandler((coord: Coord) => `#click-${ coord.x }-${ coord.y }`)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const chosenMove: ReversiMove = new ReversiMove(coord.x, coord.y);
        return await this.chooseMove(chosenMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        console.log('updateBoard');
        const state: ReversiState<Direction> = this.state();

        // this.board = state.getCopiedBoard();

        console.log('couilles de mers');
        this.scores = MGPOptional.of(state.countScore());
        console.log('crotenpobit');
        this.canPass = this.rules.playerCanOnlyPass(state);
    }

    protected override async showLastMove(move: ReversiMove): Promise<void> {
        console.log('showLastMove setting', move.coord.toString());
        this.lastMove.set(MGPOptional.of(move.coord));
        const player: Player = this.state().getCurrentOpponent();
        this.captured.set(
            this.rules.getAllSwitchedCoords(move, player, this.getPreviousState()),
        );
    }

    public override hideLastMove(): void {
        console.log('hideLastMove');
        this.captured.set(new Set());
        this.lastMove.set(MGPOptional.empty());
    }

    protected readonly spaceClassesMap: Signal<MGPMap<Coord, string[]>> = computed(() => {
        const spaceClassesMap: MGPMap<Coord, string[]> = new MGPMap();
        for (const coordAndContent of this.state().getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const classes: string[] = [];
            const owner: PlayerOrNone = coordAndContent.content.getPlayer();
            classes.push(this.getPlayerClass(owner));
            if (this.lastMove().equalsValue(coord)) {
                classes.push('last-move-stroke');
            }
            if (this.captured().contains(coord)) {
                classes.push('captured-fill');
            }
            spaceClassesMap.set(coord, classes);
        }
        spaceClassesMap.makeImmutable();
        return spaceClassesMap;
    });

    public override async pass(): Promise<MGPValidation> {
        Utils.assert(this.canPass, 'ReversiComponent: pass() can only be called if canPass is true');
        return this.onClick(ReversiMove.PASS.coord);
    }

}

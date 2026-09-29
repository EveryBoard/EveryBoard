import { signal, WritableSignal } from '@angular/core';

import { MGPOptional, MGPValidation, Set, Utils } from '@everyboard/lib';

import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { TopologicGameComponent } from '../../../components/game-components/topologic-game-component/TopologicGameComponent';
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';

import { TopologicReversiRules, ReversiConfig, ReversiLegalityInformation } from './AbstractReversiRules';
import { ReversiHeuristic } from './ReversiHeuristic';
import { ReversiMove } from './ReversiMove';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiState } from './ReversiState';

export abstract class AbstractReversiComponent<R extends TopologicReversiRules>
    extends TopologicGameComponent<R,
                                   ReversiMove,
                                   ReversiState,
                                   FourStatePiece,
                                   ReversiConfig,
                                   ReversiLegalityInformation>
{
    private readonly lastMove: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());

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
        const state: ReversiState = this.state();

        // this.board = state.getCopiedBoard();

        this.scores = MGPOptional.of(state.countScore());
        this.canPass = this.rules.playerCanOnlyPass(state);
    }

    protected override async showLastMove(move: ReversiMove): Promise<void> {
        this.lastMove.set(MGPOptional.of(move.coord));
        const player: Player = this.state().getCurrentOpponent();
        this.captured.set(
            this.rules.getAllSwitchedCoords(move, player, this.getPreviousState()),
        );
    }

    public override hideLastMove(): void {
        this.captured.set(new Set());
        this.lastMove.set(MGPOptional.empty());
    }

    private getRectClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.captured().contains(coord)) {
            return ['captured-fill'];
        } else if (this.lastMove().equalsValue(coord)) {
            return ['moved-fill'];
        } else {
            return [];
        }
    }

    private getPieceClass(x: number, y: number): string {
        const coord: Coord = new Coord(x, y);
        const player: PlayerOrNone = this.state().getPieceAt(coord).getPlayer();
        return this.getPlayerClass(player);
    }

    protected getSpaceClass(coord: Coord): string[] {
        const owner: PlayerOrNone = this.state().getPieceAt(coord).getPlayer();
        const classes: string[] = [];
        classes.push(this.getPlayerClass(owner));
        if (this.lastMove().equalsValue(coord)) {
            classes.push('last-move-stroke');
        }
        return classes;
    }

    public override async pass(): Promise<MGPValidation> {
        Utils.assert(this.canPass, 'ReversiComponent: pass() can only be called if canPass is true');
        return this.onClick(ReversiMove.PASS.coord);
    }

}

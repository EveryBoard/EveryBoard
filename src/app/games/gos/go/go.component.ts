import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { PlayerNumberMap } from '@everyboard/games';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { ScoreName } from '../../../components/game-components/game-component/ScoreName';
import { GobanGameComponent } from '../../../components/game-components/goban-game-component/GobanGameComponent';
import { BlankGobanComponent } from '../../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { GroupData } from '../../../jscaip/BoardData';
import { Coord } from '../../../jscaip/Coord';
import { Debug } from '../../../utils/Debug';
import { GoLegalityInformation } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

import { GoHeuristic } from './GoHeuristic';
import { GoMoveGenerator } from './GoMoveGenerator';
import { GoConfig, GoRules } from './GoRules';

@Component({
    selector: 'app-go',
    templateUrl: './go.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgClass],
})
@Debug.log
export class GoComponent extends GobanGameComponent<GoRules,
                                                    GoMove,
                                                    GoState,
                                                    GoPiece,
                                                    GoConfig,
                                                    GoLegalityInformation>
{

    public boardInfo: GroupData<GoPiece>;

    public ko: MGPOptional<Coord> = MGPOptional.empty();

    public last: MGPOptional<Coord> = MGPOptional.empty();

    public captures: Coord[]= [];

    public GoPiece: typeof GoPiece = GoPiece;

    public constructor() {
        super();
        this.setRulesAndNode('Go');
        this.aiConfig = {
            minimax: [{
                id: 'territory',
                name: $localize`Territory`,
                heuristic: (): GoHeuristic => new GoHeuristic(),
                moveGenerator: (): GoMoveGenerator => new GoMoveGenerator(),
                hash: GoComponent.hash,
            }],
            mcts: [{
                id: 'default',
                name: $localize`Default`,
                moveGenerator: (): GoMoveGenerator => new GoMoveGenerator(),
            }],
        };
        this.encoder = GoMove.encoder;
        this.canPass = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    private static hash(state: GoState): string {
        let board: string = '';
        for (const line of state.board) {
            for (const cell of line) {
                board += cell.toString();
            }
            board += '\n';
        }
        return `${state.turn % 2}-${state.phase.toString()}-${board}-${JSON.stringify(state.koCoord)}-${JSON.stringify(state.captured)}`;
    }

    public override async showLastMove(move: GoMove): Promise<void> {
        this.last = MGPOptional.of(move.coord);
        this.showCaptures();
    }

    public override hideLastMove(): void {
        this.captures = [];
        this.last = MGPOptional.empty();
    }

    @ClickHandler((coord: Coord) => '#click-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const resultlessMove: GoMove = new GoMove(coord.x, coord.y);
        return this.chooseMove(resultlessMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: GoState = this.getState();
        const phase: GoPhase = state.phase;

        this.board = state.getCopiedBoard();
        this.updateScores();

        this.ko = state.koCoord;
        this.canPass = phase.allowsPass();
        this.createHoshis();
    }

    private updateScores(): void {
        this.scores = MGPOptional.of(this.getState().captured);
    }

    protected override getScoreName(): ScoreName {
        return this.getState().phase.getScoreName();
    }

    private showCaptures(): void {
        const previousState: GoState = this.getPreviousState();
        this.captures = [];
        for (let y: number = 0; y < this.getHeight(); y++) {
            for (let x: number = 0; x < this.getWidth(); x++) {
                const coord: Coord = new Coord(x, y);
                const wasOccupied: boolean = previousState.getPieceAt(coord).isOccupied();
                const isEmpty: boolean = this.board[y][x] === GoPiece.EMPTY;
                const isNotKo: boolean = this.ko.equalsValue(coord) === false;
                if (wasOccupied && isEmpty && isNotKo) {
                    this.captures.push(coord);
                }
            }
        }
    }

    public override async pass(): Promise<MGPValidation> {
        const phase: GoPhase = this.getState().phase;
        if (phase.isPlaying() || phase.isPassed()) {
            return this.onClick(GoMove.PASS.coord);
        }
        Utils.assert(phase.isCounting() || phase.isAccept(),
                     'GoComponent: pass() must be called only in playing, passed, counting, or accept phases');
        return this.onClick(GoMove.ACCEPT.coord);
    }

    public getSpaceClass(coord: Coord): string {
        const state: GoState = this.getState();
        const piece: GoPiece = state.getPieceAt(coord);
        return this.getPlayerClass(piece.getOwner());
    }

    public spaceIsFull(coord: Coord): boolean {
        const state: GoState = this.getState();
        const piece: GoPiece = state.getPieceAt(coord);
        return piece !== GoPiece.EMPTY && this.isTerritory(coord) === false;
    }

    public isLastSpace(coord: Coord): boolean {
        return this.last.equalsValue(coord);
    }

    public isDead(coord: Coord): boolean {
        return this.getState().isDead(coord);
    }

    public isTerritory(coord: Coord): boolean {
        return this.getState().isTerritory(coord);
    }

}

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Coord } from '@everyboard/games';
import { Player, PlayerOrNone } from '@everyboard/games';
import { RulesFailure } from '@everyboard/games';
import { TeekoHeuristic } from '@everyboard/games';
import { TeekoDropMove, TeekoMove, TeekoTranslationMove } from '@everyboard/games';
import { TeekoMoveGenerator } from '@everyboard/games';
import { TeekoConfig, TeekoRules } from '@everyboard/games';
import { TeekoState } from '@everyboard/games';
import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-teeko',
    templateUrl: './teeko.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})

export class TeekoComponent extends RectangularGameComponent<TeekoRules,
                                                             TeekoMove,
                                                             TeekoState,
                                                             PlayerOrNone,
                                                             TeekoConfig>
{
    public selected: MGPOptional<Coord> = MGPOptional.empty();
    public last: MGPOptional<Coord> = MGPOptional.empty();
    public moved: Coord[] = [];
    public victory: Coord[] = [];

    public constructor() {
        super('Teeko');
        this.aiConfig = {
            minimax: [{
                id: 'Alignment',
                name: $localize`Alignment`,
                heuristic: (): TeekoHeuristic => new TeekoHeuristic(),
                moveGenerator: (): TeekoMoveGenerator => new TeekoMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`Default`,
                moveGenerator: (): TeekoMoveGenerator => new TeekoMoveGenerator(),
            }],
        };
        this.encoder = TeekoMove.encoder;
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.board = this.node.gameState.board;
    }

    protected override async showLastMove(move: TeekoMove): Promise<void> {
        this.last = MGPOptional.of(this.rules.getLastCoord(move));
        if (move instanceof TeekoTranslationMove) {
            this.moved = [move.getStart(), move.getEnd()];
        } else {
            this.moved = [];
        }
        this.victory = this.rules.getVictoryCoord(this.getState());
    }

    public override async hideLastMove(): Promise<void> {
        this.last = MGPOptional.empty();
        this.moved = [];
        this.victory = [];
    }

    public override cancelMoveAttempt(): void {
        this.selected = MGPOptional.empty();
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        if (this.getState().isInDropPhase()) {
            const move: TeekoDropMove = TeekoDropMove.from(clickedCoord);
            return this.chooseMove(move);
        } else {
            if (this.selected.isPresent()) {
                if (this.selected.equalsValue(clickedCoord)) {
                    return this.cancelMove();
                } else {
                    const move: TeekoTranslationMove =
                        TeekoTranslationMove.from(this.selected.get(), clickedCoord).get();
                    return this.chooseMove(move);
                }
            } else {
                const currentPlayer: Player = this.getState().getCurrentPlayer();
                const clickedPiece: PlayerOrNone = this.getState().getPieceAt(clickedCoord);
                if (clickedPiece === currentPlayer) {
                    this.selected = MGPOptional.of(clickedCoord);
                    return MGPValidation.SUCCESS;
                } else if (clickedPiece.isNone()) {
                    return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
                } else {
                    return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
                }
            }
        }
    }

    public getPieceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const playerClass: string = this.getPlayerClass(this.getState().getPieceAt(coord));
        const classes: string[] = [playerClass];
        if (this.victory.some((c: Coord) => c.equals(coord))) {
            classes.push('victory-stroke');
        } else if (this.last.equalsValue(coord)) {
            classes.push('last-move-stroke');
        } else if (this.selected.equalsValue(coord)) {
            classes.push('selected-stroke');
        }
        return classes;
    }

    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.moved.some((c: Coord) => c.equals(coord))) {
            return ['moved-fill'];
        } else {
            return [];
        }
    }

}

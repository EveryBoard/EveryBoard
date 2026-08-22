
import { Coord } from '@everyboard/games';
import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { AbstractReversiRules, ReversiConfig, ReversiLegalityInformation } from '@everyboard/games';
import { ReversiHeuristic } from '@everyboard/games';
import { ReversiMove } from '@everyboard/games';
import { ReversiMoveGenerator } from '@everyboard/games';
import { ReversiState } from '@everyboard/games';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../../components/game-components/rectangular-game-component/RectangularGameComponent';

export abstract class AbstractReversiComponent<R extends AbstractReversiRules>
    extends RectangularGameComponent<R,
                                     ReversiMove,
                                     ReversiState,
                                     PlayerOrNone,
                                     ReversiConfig,
                                     ReversiLegalityInformation>
{
    public lastMove: MGPOptional<Coord> = MGPOptional.empty();

    private captured: Coord[] = [];

    public constructor(urlName: string) {
        super(urlName);
        this.aiConfig = {
            minimax: [{
                id: 'Piece Count',
                name: $localize`Piece Count`,
                heuristic: (): ReversiHeuristic => new ReversiHeuristic(),
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

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const chosenMove: ReversiMove = new ReversiMove(x, y);
        return await this.chooseMove(chosenMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: ReversiState = this.getState();

        this.board = state.getCopiedBoard();

        this.scores = MGPOptional.of(state.countScore());
        this.canPass = this.rules.playerCanOnlyPass(state, this.getConfig());
    }

    protected override async showLastMove(move: ReversiMove): Promise<void> {
        this.lastMove = MGPOptional.of(move.coord);
        const player: Player = this.getState().getCurrentOpponent();
        this.captured = this.rules.getAllSwitchedCoords(move, player, this.getPreviousState(), this.getConfig());
    }

    public override hideLastMove(): void {
        this.captured = [];
        this.lastMove = MGPOptional.empty();
    }

    public getRectClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.captured.some((c: Coord) => c.equals(coord))) {
            return ['captured-fill'];
        } else if (this.lastMove.equalsValue(coord)) {
            return ['moved-fill'];
        } else {
            return [];
        }
    }

    public getPieceClass(x: number, y: number): string {
        return this.getPlayerClass(this.board[y][x]);
    }

    public override async pass(): Promise<MGPValidation> {
        Utils.assert(this.canPass, 'ReversiComponent: pass() can only be called if canPass is true');
        return this.onClick(ReversiMove.PASS.coord.x, ReversiMove.PASS.coord.y);
    }

}

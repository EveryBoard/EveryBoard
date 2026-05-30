import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { RectangularGameComponent } from '../../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from '../../../jscaip/Coord';
import { MCTS } from '../../../jscaip/AI/MCTS';
import { Ordinal } from '../../../jscaip/Ordinal';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';

import { ReversiConfig, ReversiLegalityInformation, AbstractReversiRules } from './AbstractReversiRules';
import { ReversiMinimax } from './ReversiMinimax';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';

export abstract class AbstractReversiComponent<R extends AbstractReversiRules>
    extends RectangularGameComponent<R,
                                     ReversiMove,
                                     ReversiState,
                                     PlayerOrNone,
                                     ReversiConfig,
                                     ReversiLegalityInformation>
{
    public lastMove: MGPOptional<Coord> = MGPOptional.empty();

    private capturedCoords: Coord[] = [];

    public constructor(urlName: string) {
        super();
        this.setRulesAndNode(urlName);
        this.availableAIs = [
            new ReversiMinimax(this.rules),
            new MCTS(
                $localize`MCTS`,
                new ReversiMoveGenerator(this.rules),
                this.rules,
            ),
        ];
        this.encoder = ReversiMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(2, 2));
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: ReversiMove = new ReversiMove(x, y);
        return await this.chooseMove(chosenMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: ReversiState = this.getState();

        this.board = state.getCopiedBoard();

        this.scores = MGPOptional.of(state.countScore());
        this.canPass = this.rules.playerCanOnlyPass(state, this.config);
    }

    public override async showLastMove(move: ReversiMove): Promise<void> {
        this.lastMove = MGPOptional.of(move.coord);
        const player: Player = this.getState().getCurrentPlayer();
        const opponent: Player = this.getState().getCurrentOpponent();
        const width: number = this.getState().getWidth();
        const height: number = this.getState().getHeight();
        for (const dir of Ordinal.ORDINALS) {
            let captured: Coord = move.coord.getNextToric(dir, width, height, 1);
            while (this.getState().hasPieceAt(captured, opponent) &&
                   this.getPreviousState().getPieceAt(captured) === player)
            {
                this.capturedCoords.push(captured);
                captured = captured.getNextToric(dir, width, height, 1);
            }
        }
    }

    public override hideLastMove(): void {
        this.capturedCoords = [];
        this.lastMove = MGPOptional.empty();
    }

    public getRectClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.capturedCoords.some((c: Coord) => c.equals(coord))) {
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

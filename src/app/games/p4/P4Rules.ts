import { Coord } from '../../jscaip/Coord';
import { GameNode } from '../../jscaip/AI/GameNode';
import { ConfigurableRules } from '../../jscaip/Rules';
import { P4State } from './P4State';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { P4Move } from './P4Move';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { P4Failure } from './P4Failure';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Debug } from 'src/app/utils/Debug';
import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';

export type P4Config = {
    width: number;
    height: number;
};

export class P4Node extends GameNode<P4Move, P4State> {}

@Debug.log
export class P4Rules extends ConfigurableRules<P4Move, P4State, P4Config> {

    private static singleton: MGPOptional<P4Rules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<P4Config> =
        new RulesConfigDescription<P4Config>({
            name: (): string => $localize`Four in a Row`,
            config: {
                width: new NumberConfig(7, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                height: new NumberConfig(6, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
            },
        });

    public static get(): P4Rules {
        if (P4Rules.singleton.isAbsent()) {
            P4Rules.singleton = MGPOptional.of(new P4Rules());
        }
        return P4Rules.singleton.get();
    }

    public readonly P4_HELPER: NInARowHelper<PlayerOrNone>;

    private constructor() {
        super();
        this.P4_HELPER = new NInARowHelper(Utils.identity, 4);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<P4Config>> {
        return MGPOptional.of(P4Rules.RULES_CONFIG_DESCRIPTION);
    }

    public override getInitialState(config: MGPOptional<P4Config>): P4State {
        const board: PlayerOrNone[][] = TableUtils.create(config.get().width,
                                                          config.get().height,
                                                          PlayerOrNone.NONE);
        return new P4State(board, 0);
    }

    public override applyLegalMove(move: P4Move, state: P4State, _config: MGPOptional<P4Config>, _info: void): P4State {
        const x: number = move.x;
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        const y: number = P4Rules.get().getLowestUnoccupiedSpace(board, x);

        const turn: number = state.turn;

        board[y][x] = state.getCurrentPlayer();

        const resultingState: P4State = new P4State(board, turn + 1);
        return resultingState;
    }

    public override isLegal(move: P4Move, state: P4State): MGPValidation {
        if (state.getPieceAtXY(move.x, 0).isPlayer()) {
            return MGPValidation.failure(P4Failure.COLUMN_IS_FULL());
        }
        return MGPValidation.SUCCESS;
    }

    public override getGameStatus(node: P4Node): GameStatus {
        const state: P4State = node.gameState;
        const victoriousCoord: Coord[] = this.P4_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        return state.turn === (width * height) ? GameStatus.DRAW : GameStatus.ONGOING;
    }

    public getVictoriousCoords(state: P4State): Coord[] {
        return this.P4_HELPER.getVictoriousCoord(state);
    }

    public getLowestUnoccupiedSpace(board: Table<PlayerOrNone>, x: number): number {
        let y: number = 0;
        const height: number = board.length;
        while (y < height && board[y][x].isNone()) {
            y++;
        }
        return y - 1;
    }

}

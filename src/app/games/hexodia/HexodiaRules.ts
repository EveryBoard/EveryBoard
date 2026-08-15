import { NumberConfig } from 'src/app/components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';

import { MGPValidation, MGPOptional, Utils, MGPMap } from '@everyboard/lib';

import { RulesConfigDescription } from '../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord, CoordFailure } from '../../jscaip/Coord';
import { DodecaHexaDirection } from '../../jscaip/DodecaHexaDirection';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { GameStatus } from '../../jscaip/GameStatus';
import { AbstractNInARowHelper } from '../../jscaip/NInARowHelper';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesConfig } from '../../jscaip/RulesConfigUtil';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TableUtils } from '../../jscaip/TableUtils';
import { FourStatePieceGameStateWithTable } from '../../jscaip/state/FourStatePieceGameStateWithTable';
import { MGPValidators } from '../../utils/MGPValidator';

import { HexodiaMove } from './HexodiaMove';

export type HexodiaConfig = RulesConfig & {

    size: number;

    nInARow: number;

    numberOfDrops: number;

};

export class HexodiaNode extends GameNode<HexodiaMove, FourStatePieceGameStateWithTable> {}

export class HexodiaRules extends ConfigurableRules<HexodiaMove, FourStatePieceGameStateWithTable, HexodiaConfig> {

    private static singleton: MGPOptional<HexodiaRules> = MGPOptional.empty();

    private static readonly helpers: MGPMap<number, AbstractNInARowHelper<FourStatePiece>> = new MGPMap();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<HexodiaConfig> =
        new RulesConfigDescription<HexodiaConfig>({
            name: (): string => $localize`Hexodia`,
            config: {
                size: new NumberConfig(12,
                                       RulesConfigDescriptionLocalizable.SIZE,
                                       MGPValidators.range(1, 99)),
                nInARow: new NumberConfig(6,
                                          RulesConfigDescriptionLocalizable.ALIGNMENT_SIZE,
                                          MGPValidators.range(1, 99)),
                numberOfDrops: new NumberConfig(2,
                                                RulesConfigDescriptionLocalizable.NUMBER_OF_DROPS,
                                                MGPValidators.range(1, 99)),
            },
        });

    public static get(): HexodiaRules {
        if (HexodiaRules.singleton.isAbsent()) {
            HexodiaRules.singleton = MGPOptional.of(new HexodiaRules());
        }
        return HexodiaRules.singleton.get();
    }

    public static getHexodiaHelper(config: HexodiaConfig): AbstractNInARowHelper<FourStatePiece> {
        return HexodiaRules.getHexodiaHelperBySize(config.nInARow);
    }

    public static getHexodiaHelperBySize(size: number): AbstractNInARowHelper<FourStatePiece> {
        if (HexodiaRules.helpers.get(size).isAbsent()) {
            const helper: AbstractNInARowHelper<FourStatePiece> =
                new AbstractNInARowHelper<FourStatePiece, DodecaHexaDirection>(
                    (piece: FourStatePiece) => piece.getPlayer(),
                    size,
                    DodecaHexaDirection.factory.all,
                );
            HexodiaRules.helpers.put(size, helper);
        }
        return HexodiaRules.helpers.get(size).get();
    }

    public static getVictoriousCoords(state: FourStatePieceGameStateWithTable, config: HexodiaConfig): Coord[] {
        return HexodiaRules.getHexodiaHelper(config).getVictoriousCoord(state);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<HexodiaConfig> {
        return HexodiaRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getInitialState(config: HexodiaConfig): FourStatePieceGameStateWithTable {
        const size: number = config.size;
        const boardSize: number = (size * 2) - 1;
        const maximumDiagonalIndex: number = (3 * size) - 2;
        const board: FourStatePiece[][] = TableUtils.create(boardSize, boardSize, FourStatePiece.UNREACHABLE);
        for (let y: number = 0; y < boardSize; y++) {
            for (let x: number = 0; x < boardSize; x++) {
                const diagonalIndex: number = x + y;
                if (size - 2 < diagonalIndex && diagonalIndex < maximumDiagonalIndex) {
                    board[y][x] = FourStatePiece.EMPTY;
                }
            }
        }
        return new FourStatePieceGameStateWithTable(board, 0);
    }

    public override applyLegalMove(move: HexodiaMove,
                                   state: FourStatePieceGameStateWithTable)
    : FourStatePieceGameStateWithTable
    {
        const player: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentPlayer());
        const newBoard: FourStatePiece[][] = state.getCopiedBoard();
        for (const coord of move.coords) {
            newBoard[coord.y][coord.x] = player;
        }
        return new FourStatePieceGameStateWithTable(newBoard, state.turn + 1);
    }

    public override isLegal(
        move: HexodiaMove,
        state: FourStatePieceGameStateWithTable,
        config: HexodiaConfig,
    ): MGPValidation {
        const numberOfDrops: number = move.coords.size();
        if (state.turn === 0) {
            Utils.assert(numberOfDrops === 1, 'HexodiaMove should only drop one piece at first turn');
        } else {
            const remainingSpaces: number = TableUtils.count(state.board, FourStatePiece.EMPTY);
            const requiredDrop: number = Math.min(remainingSpaces, config.numberOfDrops);
            Utils.assert(numberOfDrops === requiredDrop,
                         'HexodiaMove should have exactly ' + config.numberOfDrops+ ' drops (got ' + numberOfDrops + ')');
        }
        return this.isLegalDrop(move, state);
    }

    public isLegalDrop(move: HexodiaMove, state: FourStatePieceGameStateWithTable): MGPValidation {
        for (const coord of move.coords) {
            if (state.isNotOnBoard(coord)) {
                return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(coord));
            }
            if (state.getPieceAt(coord).isPlayer()) {
                return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            }
        }
        return MGPValidation.SUCCESS;
    }

    public override getGameStatus(node: HexodiaNode, config: HexodiaConfig): GameStatus {
        const state: FourStatePieceGameStateWithTable = node.gameState;
        const victoriousCoord: Coord[] = HexodiaRules.getVictoriousCoords(state, config);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
        if (TableUtils.contains(state.board, FourStatePiece.EMPTY)) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.DRAW;
        }
    }

}

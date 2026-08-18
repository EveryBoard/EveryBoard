import { ArrayUtils, MGPFallible, MGPMap, MGPOptional } from '@everyboard/lib';

import { NumberConfig } from '../../config/NumberConfig';
import { RulesConfigDescription } from '../../config/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../config/RulesConfigDescriptionLocalizable';
import { RulesConfig } from '../../config/RulesConfigUtil';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord } from '../../jscaip/Coord';
import { GameStatus } from '../../jscaip/GameStatus';
import { NInARowHelper } from '../../jscaip/NInARowHelper';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerMap } from '../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TableUtils } from '../../jscaip/TableUtils';
import { Debug } from '../../utils/Debug';
import { MGPValidators } from '../../utils/MGPValidator';

import { EncapsuleFailure } from './EncapsuleFailure';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { EncapsuleState, EncapsuleSpace, EncapsuleSizeToNumberMap, EncapsuleRemainingPieces } from './EncapsuleState';

export type EncapsuleConfig = RulesConfig & {

    nInARow: number;

    width: number;

    height: number;

    nbOfSizes: number;

    nbOfEachPiece: number;

};

export type EncapsuleLegalityInformation = EncapsuleSpace;

export class EncapsuleNode extends GameNode<EncapsuleMove, EncapsuleState> {}

@Debug.log
export class EncapsuleRules extends ConfigurableRules<EncapsuleMove,
                                                      EncapsuleState,
                                                      EncapsuleConfig,
                                                      EncapsuleLegalityInformation>
{
    private static singleton: MGPOptional<EncapsuleRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<EncapsuleConfig> =
        new RulesConfigDescription<EncapsuleConfig>({
            name: (): string => $localize`Encapsule`,
            config: {
                nInARow:
                    new NumberConfig(3, RulesConfigDescriptionLocalizable.ALIGNMENT_SIZE, MGPValidators.range(1, 99)),
                width:
                    new NumberConfig(3, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(3, 99)),
                height:
                    new NumberConfig(3, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(3, 99)),
                nbOfSizes:
                    new NumberConfig(3, () => $localize`Number of different piece sizes`, MGPValidators.range(1, 8)),
                nbOfEachPiece:
                    new NumberConfig(2, () => $localize`Number of pieces for each size`, MGPValidators.range(1, 9)),
            },
        });

    public static get(): EncapsuleRules {
        if (EncapsuleRules.singleton.isAbsent()) {
            EncapsuleRules.singleton = MGPOptional.of(new EncapsuleRules());
        }
        return EncapsuleRules.singleton.get();
    }

    public override getInitialState(config: EncapsuleConfig): EncapsuleState {
        const _: EncapsuleSpace = new EncapsuleSpace(new MGPMap());
        const startingBoard: EncapsuleSpace[][] = TableUtils.create(config.width, config.height, _);
        const initialPieces: EncapsuleRemainingPieces = this.getInitialEncapsulePieceMap(config);
        return new EncapsuleState(startingBoard, 0, initialPieces, config.nbOfSizes);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<EncapsuleConfig> {
        return EncapsuleRules.RULES_CONFIG_DESCRIPTION;
    }

    private getInitialEncapsulePieceMap(config: EncapsuleConfig): EncapsuleRemainingPieces {
        const playerZeroPiecesNumber: number[] = ArrayUtils.create(config.nbOfSizes, config.nbOfEachPiece);
        const playerOnePiecesNumber: number[] = ArrayUtils.create(config.nbOfSizes, config.nbOfEachPiece);
        return this.getEncapsulePieceMapFrom(playerZeroPiecesNumber, playerOnePiecesNumber);
    }

    public getEncapsulePieceMapFrom(playerZeroPiecesNumber: number[], playerOnePiecesNumber: number[])
    : EncapsuleRemainingPieces
    {
        const playerZero: EncapsuleSizeToNumberMap = this.getSizeToNumberMap(playerZeroPiecesNumber);
        const playerOne: EncapsuleSizeToNumberMap = this.getSizeToNumberMap(playerOnePiecesNumber);
        return PlayerMap.ofValues(playerZero, playerOne);
    }

    private getSizeToNumberMap(nbOfEachPieces: number[]): EncapsuleSizeToNumberMap {
        const map: EncapsuleSizeToNumberMap = new EncapsuleSizeToNumberMap();
        for (let i: number = 0; i < nbOfEachPieces.length; i++) {
            const size: number = i + 1;
            const nbOfEachPiece: number = nbOfEachPieces[i];
            map.set(size, nbOfEachPiece);
        }
        return map;
    }

    public getVictoriousCoords(state: EncapsuleState, config: EncapsuleConfig): Coord[] {
        const helper: NInARowHelper<EncapsuleSpace> = new NInARowHelper(
            (piece: EncapsuleSpace) => piece.getBiggest().getPlayer(),
            config.nInARow,
        );
        return helper.getVictoriousCoord(state);
    }

    public isVictory(state: EncapsuleState, config: EncapsuleConfig): MGPOptional<Player> {
        const victoriousCoords: Coord[] = this.getVictoriousCoords(state, config);
        if (victoriousCoords.length > 0) {
            const coord: Coord = victoriousCoords[0];
            return MGPOptional.of(state.getPieceAt(coord).getBiggest().getPlayer() as Player);
        } else {
            return MGPOptional.empty();
        }
    }

    public override isLegal(move: EncapsuleMove, state: EncapsuleState): MGPFallible<EncapsuleLegalityInformation> {
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            const owner: PlayerOrNone = movingPiece.getPlayer();
            if (owner.isNone()) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
            }
            if (owner === state.getCurrentOpponent()) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
            }
            if (state.isInRemainingPieces(movingPiece) === false) {
                return MGPFallible.failure(EncapsuleFailure.PIECE_OUT_OF_STOCK());
            }
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const startingSpace: EncapsuleSpace = state.getPieceAt(startingCoord);
            movingPiece = startingSpace.getBiggest();
            const owner: PlayerOrNone = movingPiece.getPlayer();
            if (owner.isNone()) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
            }
            if (owner === state.getCurrentOpponent()) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
            }
        }
        const landingSpace: EncapsuleSpace = state.getPieceAt(move.landingCoord);
        const superpositionResult: MGPOptional<EncapsuleSpace> = landingSpace.tryToSuperposePiece(movingPiece);
        if (superpositionResult.isPresent()) {
            return MGPFallible.success(superpositionResult.get());
        }
        return MGPFallible.failure(EncapsuleFailure.INVALID_PLACEMENT());
    }

    public override applyLegalMove(move: EncapsuleMove,
                                   state: EncapsuleState,
                                   _config: EncapsuleConfig,
                                   newLandingSpace: EncapsuleLegalityInformation)
    : EncapsuleState
    {
        const newBoard: EncapsuleSpace[][] = state.getCopiedBoard();
        const currentPlayer: Player = state.getCurrentPlayer();
        const newRemainingPiecesMap: EncapsuleRemainingPieces = state.getRemainingPiecesCopy();
        const newRemainingPiece: EncapsuleSizeToNumberMap = newRemainingPiecesMap.get(currentPlayer).getCopy();
        const newTurn: number = state.turn + 1;
        newBoard[move.landingCoord.y][move.landingCoord.x] = newLandingSpace;
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            newRemainingPiece.add(movingPiece.size, -1);
            newRemainingPiecesMap.put(currentPlayer, newRemainingPiece);
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const oldStartingSpace: EncapsuleSpace = newBoard[startingCoord.y][startingCoord.x];
            const removalResult: {removedSpace: EncapsuleSpace; removedPiece: EncapsulePiece} =
                oldStartingSpace.removeBiggest();
            newBoard[startingCoord.y][startingCoord.x] = removalResult.removedSpace;
            movingPiece = removalResult.removedPiece;
        }
        return new EncapsuleState(newBoard, newTurn, newRemainingPiecesMap, state.nbOfPieceSize);
    }

    public override getGameStatus(node: EncapsuleNode, config: EncapsuleConfig): GameStatus {
        const state: EncapsuleState = node.gameState;
        const winner: MGPOptional<Player> = this.isVictory(state, config);
        if (winner.isPresent()) {
            return GameStatus.getVictory(winner.get());
        } else {
            return GameStatus.ONGOING;
        }
    }

}

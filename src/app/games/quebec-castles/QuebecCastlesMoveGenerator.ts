import { MGPOptional } from '@everyboard/lib';

import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { QuebecCastlesDrop, QuebecCastlesMove } from './QuebecCastlesMove';
import { DropModeEnum, QuebecCastlesConfig, QuebecCastlesNode, QuebecCastlesRules } from './QuebecCastlesRules';
import { QuebecCastlesState } from './QuebecCastlesState';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';

export class QuebecCastlesMoveGenerator extends MoveGenerator<QuebecCastlesMove,
                                                              QuebecCastlesState,
                                                              QuebecCastlesConfig>
{

    public override getListMoves(node: QuebecCastlesNode, optionalConfig: MGPOptional<QuebecCastlesConfig>)
    : QuebecCastlesMove[]
    {
        const state: QuebecCastlesState = node.gameState;
        const config: QuebecCastlesConfig = optionalConfig.get();
        if (QuebecCastlesRules.get().isDropPhase(state, config)) {
            return this.getDropMoves(state, config);
        } else {
            return this.getNormalMoves(state, config);
        }
    }

    public getDropMoves(state: QuebecCastlesState, config: QuebecCastlesConfig): QuebecCastlesMove[] {
        const player: Player = state.getCurrentPlayer();
        const moves: QuebecCastlesMove[] = [];
        const rules: QuebecCastlesRules = QuebecCastlesRules.get();
        const nbOfDropAwaited: number = rules.getExpectedDropsThisTurn(state, config);
        const mustPlaceThrone: boolean = rules.mustPlaceThrone(state, config);
        if (config.dropMode === DropModeEnum.PIECE_BY_PIECE || mustPlaceThrone) {
            const coords: Coord[] = [];
            const validDropCoords: Coord[] = rules.getValidDropCoords(player, config);
            for (const dropCoord of validDropCoords) {
                const piece: PlayerOrNone = state.getPieceAt(dropCoord);
                if (piece.isNone() && state.thrones.get(player).equalsValue(dropCoord) === false) {
                    if (nbOfDropAwaited === 1) {
                        moves.push(QuebecCastlesDrop.of([dropCoord]));
                    } else {
                        coords.push(dropCoord);
                        if (nbOfDropAwaited === coords.length) {
                            return [QuebecCastlesDrop.of(coords)];
                        }
                    }
                }
            }
        } else {
            const initialCoords: Coord[] = QuebecCastlesRules.get().getInitialCoords(player, state, config);
            const move: QuebecCastlesMove = QuebecCastlesMove.drop(initialCoords);
            moves.push(move);
        }
        return moves;
    }

    public getNormalMoves(state: QuebecCastlesState, config: QuebecCastlesConfig): QuebecCastlesMove[] {
        const player: Player = state.getCurrentPlayer();
        const moves: QuebecCastlesMove[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content.equals(player)) {
                const movesForCoord: QuebecCastlesMove[] =
                    QuebecCastlesRules.get().getPossibleMovesFor(coordAndContent.coord, state);
                moves.push(...movesForCoord);
            }
        }
        return moves;
    }
}

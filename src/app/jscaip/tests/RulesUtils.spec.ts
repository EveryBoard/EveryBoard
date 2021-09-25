import { LegalityStatus } from '../LegalityStatus';
import { MGPNode } from '../MGPNode';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { NodeUnheritance } from '../NodeUnheritance';
import { Player } from '../Player';
import { GameStatus, Rules } from '../Rules';
import { GameState } from '../GameState';

export function expectToBeVictoryFor<M extends Move,
                                     S extends GameState,
                                     L extends LegalityStatus,
                                     U extends NodeUnheritance>(
    rules: Rules<M, S, L>,
    node: MGPNode<Rules<M, S, L>, M, S, L, U>,
    player: Player,
    minimaxes: Minimax<M, S>[])
: void
{
    expect(rules.getGameStatus(node)).toEqual(GameStatus.getVictory(player));
    for (const minimax of minimaxes) {
        expect(minimax.getBoardValue(node).value).toEqual(player.getVictoryValue());
    }
}

export function expectToBeDraw<M extends Move,
                               S extends GameState,
                               L extends LegalityStatus,
                               U extends NodeUnheritance>(
    rules: Rules<M, S, L>,
    node: MGPNode<Rules<M, S, L>, M, S, L, U>,
    minimaxes: Minimax<M, S>[])
: void
{
    expect(rules.getGameStatus(node)).toBe(GameStatus.DRAW);
    for (const minimax of minimaxes) {
        expect(minimax.getBoardValue(node).value).toBe(0);
    }
}


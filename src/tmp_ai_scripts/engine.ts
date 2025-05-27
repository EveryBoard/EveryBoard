/* eslint-disable max-lines-per-function */
import { MGPFallible, MGPOptional } from '@everyboard/lib';
import * as readline from 'readline';
import { GameStatus } from '../app/jscaip/GameStatus';
import { PlayerOrNone } from '../app/jscaip/Player';
import { TableUtils } from '../app/jscaip/TableUtils';
import { MancalaMove } from '../app/games/mancala/common/MancalaMove';
import { MancalaState } from '../app/games/mancala/common/MancalaState';
import { PlayerNumberMap } from '../app/jscaip/PlayerMap';
import { MancalaNode } from '../app/games/mancala/common/MancalaRules';
import { P4State } from '../app/games/p4/P4State';
import { P4Config, P4Node, P4Rules } from '../app/games/p4/P4Rules';
import { P4Move } from '../app/games/p4/P4Move';
import { P4MoveGenerator } from '../app/games/p4/P4MoveGenerator';

// compile with "npx tsc -p tsconfig.jscaip.json"
const rules: P4Rules = P4Rules.get();
const config: MGPOptional<P4Config> = rules.getDefaultRulesConfig();

interface Input {
    action: 'choose' | 'getGameStatus' | 'getLegalMoves' | 'getGameName' | 'getInitialState';
    gameState?: P4State;
    move?: number;
}

function getP4Node(input: Input): P4State {
    const board: PlayerOrNone[][] = TableUtils.map(
        input.gameState?.board,
        (p: PlayerOrNone) => PlayerOrNone.encoder.decode(p['value']),
    );
    const turn: number = input.gameState?.turn;
    return new P4State(board, turn);
}
function getMancalaNode(input: Input): MancalaNode {
    const board: number[][] = input.gameState?.board;
    const turn: number = input.gameState?.turn;
    const playerZeroValue: number = input.gameState?.scores.map.map[0].value;
    const playerOneValue: number = input.gameState?.scores.map.map[0].value;
    const scores: PlayerNumberMap = PlayerNumberMap.of(playerZeroValue, playerOneValue);
    const state: MancalaState = new MancalaState(board, turn, scores);
    return new MancalaNode(state);
}
function getMancalaMove(input: Input): MancalaMove {
    return MancalaMove.of(input.move!);
}
function getP4Move(input: Input): P4Move {
    return P4Move.of(input.move!);
}
const getGameState = getP4Node;

// Create readline interface for persistent communication
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

rl.on('line', (line: string) => {
    try {
        const input: Input = JSON.parse(line);
        let response: any;

        if (input.action === 'choose') {
            const gameState: P4State = getP4Node(input);
            let node: P4Node = new P4Node(gameState);
            const move: P4Move = getP4Move(input);
            const result: MGPFallible<P4Node> = rules.choose(node, move, config);
            if (result.isSuccess()) {
                node = result.get();
            }
            response = {
                success: result.isSuccess(),
                result: node.gameState,
            };
        } else if (input.action === 'getGameStatus') {
            const gameState: P4State = getGameState(input);
            const node: P4Node = new P4Node(gameState);
            const status: GameStatus = rules.getGameStatus(node);
            response = { status };
        } else if (input.action === 'getLegalMoves') {
            const gameState: P4State = getGameState(input);
            const node: P4Node = new P4Node(gameState);
            const moveGenerator: P4MoveGenerator = new P4MoveGenerator();
            const legalMoves: P4Move[] = moveGenerator.getListMoves(node, config);
            response = { legalMoves };
        } else if (input.action === 'getGameName') {
            response = { name: rules.constructor.name };
        } else if (input.action === 'getInitialState') {
            const initialNode: P4Node = rules.getInitialNode(config);
            response = { initialState: initialNode.gameState };
        }

        // Always send response as single line
        const stringResponse: string = JSON.stringify(response);
        console.log(stringResponse);
        // process.stdout.write(stringResponse);
    } catch (e: any) {
        const errorMessage: string = JSON.stringify({ error: e?.message || e?.toString?.() || 'Unknown error' });
        console.error(errorMessage);
        process.stdout.write(JSON.stringify({ success: false, error: errorMessage, line }) + '\n');
    }
});

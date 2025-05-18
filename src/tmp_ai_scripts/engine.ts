/* eslint-disable max-lines-per-function */ // TODO REMOVE AND CLEAN
// engine.ts
import { ArrayUtils, MGPFallible, MGPOptional } from '@everyboard/lib';
import * as readline from 'readline';
import { P4Config, P4Node, P4Rules } from '../app/games/p4/P4Rules';
import { GameStatus } from '../app/jscaip/GameStatus';
import { P4Move } from '../app/games/p4/P4Move';
import { P4State } from '../app/games/p4/P4State';
import { Coord } from '../app/jscaip/Coord';
import { Player, PlayerOrNone } from '../app/jscaip/Player';
import { TableUtils } from '../app/jscaip/TableUtils';

// compile with "npx tsc -p tsconfig.jscaip.json"
const rules: P4Rules = P4Rules.get();
const config: MGPOptional<P4Config> = P4Rules.get().getDefaultRulesConfig();

interface Input {
    action: 'choose' | 'status' | 'legalMoves' | 'getGameName' | 'getInitialNode';
    node?: P4Node;
    move?: P4Move;
}

const rl: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

let inputData: string = '';
rl.on('line', (line: string) => inputData += line);
rl.on('close', () => {
    try {
        const input: Input = JSON.parse(inputData);

        if (input.action === 'choose') {
            const move: P4Move = input.move!;
            const board: PlayerOrNone[][] = TableUtils.map(
                input.node?.gameState.board,
                (p: PlayerOrNone) => PlayerOrNone.encoder.decode(p['value']),
            );
            const turn: number = input.node?.gameState.turn;
            const state: P4State = new P4State(board, turn);
            let node: P4Node = new P4Node(state);
            const result: MGPFallible<P4Node> = rules.choose(node, move, config);
            if (result.isSuccess()) {
                node = result.get();
            }
            process.stdout.write(JSON.stringify({
                success: result.isSuccess(),
                result: node,
            }));
        } else if (input.action === 'status') {
            const board: PlayerOrNone[][] = TableUtils.map(
                input.node?.gameState.board,
                (p: PlayerOrNone) => PlayerOrNone.encoder.decode(p['value']),
            );
            const turn: number = input.node?.gameState.turn;
            const state: P4State = new P4State(board, turn);
            const node: P4Node = new P4Node(state);
            const status: GameStatus = rules.getGameStatus(node);
            process.stdout.write(JSON.stringify({ status }));
        } else if (input.action === 'legalMoves') {
            const state: P4State = Object.setPrototypeOf(input.node?.gameState, P4State.prototype);
            const node: P4Node = new P4Node(state);
            const legalMoves: P4Move[] = [];
            const move_: P4Move = input.move!;
            for (const move of [move_]) {
                const legality: MGPFallible<unknown> = rules.isLegal(move, node.gameState);
                if (legality.isSuccess()) {
                    legalMoves.push(move);
                }
            }
            process.stdout.write(JSON.stringify({ legalMoves }));
        } else if (input.action === 'getGameName') {
            process.stdout.write(JSON.stringify({ name: rules.constructor.name }));
        } else if (input.action === 'getInitialNode') {
            const initialNode: P4Node = rules.getInitialNode(config);
            process.stdout.write(JSON.stringify({ node: initialNode }));
        }
    } catch (e: unknown) {
        console.error('Error in engine:', e);
        const stringError: string = JSON.stringify(e);
        process.stderr.write('Error in engine: ' + stringError);
        process.exit(1);
    }
});

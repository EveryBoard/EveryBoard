/* eslint-disable max-lines-per-function */ // TODO REMOVE AND CLEAN
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
const config: MGPOptional<P4Config> = P4Rules.get().getDefaultRulesConfig();

interface Input {
    action: 'choose' | 'getGameStatus' | 'getLegalMoves' | 'getGameName' | 'getInitialState';
    gameState?: P4Node;
    move?: P4Move;
}

const rl: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});
function getP4Node(input: Input): P4State {
    const board: number[][] = TableUtils.map(
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
let inputData: string = '';
rl.on('line', (line: string) => inputData += line);
rl.on('close', () => {
    try {
        const input: Input = JSON.parse(inputData);

        if (input.action === 'choose') {
            const gameState: P4State = getGameState(input);
            let node: P4Node = new P4Node(gameState);
            const move: P4Move = getP4Move(input);
            const result: MGPFallible<P4Node> = rules.choose(node, move, config);
            if (result.isSuccess()) {
                node = result.get();
            }
            process.stdout.write(JSON.stringify({
                success: result.isSuccess(),
                result: node.gameState,
            }));
        } else if (input.action === 'getGameStatus') {
            const gameState: P4State = getGameState(input);
            const node: P4Node = new P4Node(gameState);
            const status: GameStatus = rules.getGameStatus(node, config);
            process.stdout.write(JSON.stringify({ status }));
        } else if (input.action === 'getLegalMoves') {
            const gameState: P4State = getGameState(input);
            const node: P4Node = new P4Node(gameState);
            const moveGenerator: P4MoveGenerator = new P4MoveGenerator();
            const legalMoves: P4Move[] = moveGenerator.getListMoves(node, config);
            process.stdout.write(JSON.stringify({ legalMoves }));
        } else if (input.action === 'getGameName') {
            process.stdout.write(JSON.stringify({ name: rules.constructor.name }));
        } else if (input.action === 'getInitialState') {
            const initialNode: P4Node = rules.getInitialNode(config);
            process.stdout.write(JSON.stringify({ initialState: initialNode.gameState }));
        }
    } catch (e: unknown) {
        console.error('Error in engine:', e);
        const stringError: string = JSON.stringify(e);
        process.stderr.write('Error in engine: ' + stringError);
        process.exit(1);
    }
});

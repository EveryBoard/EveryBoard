// engine.ts
import { MGPFallible, MGPOptional } from '@everyboard/lib';
import * as readline from 'readline';
import { P4Rules } from '../app/games/p4/P4Rules';
import { AbstractNode } from '../app/jscaip/AI/GameNode';
import { Move } from '../app/jscaip/Move';
import { AbstractRules } from '../app/jscaip/Rules';
import { RulesConfig } from '../app/jscaip/RulesConfigUtil';
import { GameStatus } from '../app/jscaip/GameStatus';
import '@angular/localize/init';

// compile with "npx tsc -p tsconfig.jscaip.json"
const rules: AbstractRules = P4Rules.get();
const config: MGPOptional<RulesConfig> = MGPOptional.empty();

interface Input {
    action: 'choose' | 'status' | 'legalMoves';
    node?: AbstractNode;
    move?: Move;
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
            const node: AbstractNode = input.node!;
            const move: Move = input.move!;
            const result: MGPFallible<AbstractNode> = rules.choose(node, move, config);
            process.stdout.write(JSON.stringify({
                success: result.isSuccess(),
                result,
            }));
        } else if (input.action === 'status') {
            const node: AbstractNode = input.node!;
            const status: GameStatus = rules.getGameStatus(node, config);
            process.stdout.write(JSON.stringify({ status }));
        } else if (input.action === 'legalMoves') {
            const node: AbstractNode = input.node!;
            const legalMoves: Move[] = [];
            const move_: Move = input.move!;
            for (const move of [move_]) {
                const legality: MGPFallible<unknown> = rules.isLegal(move, node.gameState, config);
                if (legality.isSuccess()) {
                    legalMoves.push(move);
                }
            }
            process.stdout.write(JSON.stringify({ legalMoves }));
        } else if (input.action === 'getGameName') {
            process.stdout.write(JSON.stringify({ name: rules.constructor.name }));
        } else if (input.action === 'getInitialNode') {
            const initialNode: AbstractNode = rules.getInitialNode(config);
            process.stdout.write(JSON.stringify({ node: initialNode }));
        }
    } catch (e: unknown) {
        const stringError: string = JSON.stringify(e);
        process.stderr.write('Error in engine: ' + stringError);
        process.exit(1);
    }
});

/* eslint-disable max-lines-per-function */
import { MGPFallible, MGPOptional } from '@everyboard/lib';
import * as readline from 'readline';
import { GameStatus } from '../app/jscaip/GameStatus';
import { PlayerOrNone } from '../app/jscaip/Player';
import { TableUtils } from '../app/jscaip/TableUtils';
import { MancalaMove } from '../app/games/mancala/common/MancalaMove';
import { MancalaState } from '../app/games/mancala/common/MancalaState';
import { PlayerNumberMap } from '../app/jscaip/PlayerMap';
import { P4State } from '../app/games/p4/P4State';
import { P4Config, P4Rules } from '../app/games/p4/P4Rules';
import { P4Move } from '../app/games/p4/P4Move';
import { P4MoveGenerator } from '../app/games/p4/P4MoveGenerator';
import { GameState } from '../app/jscaip/state/GameState';
import { GameNode } from '../app/jscaip/AI/GameNode';
import { Move } from '../app/jscaip/Move';
import { GameInfo } from '../app/components/normal-component/pick-game/game-info';
import { RulesConfig } from '../app/jscaip/RulesConfigUtil';
import { MoveGenerator } from '../app/jscaip/AI/AI';

// compile with "npx tsc -p tsconfig.jscaip.json"
globalThis.$localize = (string) => "localize(" + string + ")";
$localize = (string) => "localize(" + string + ")";

interface Input {
    action: 'choose' | 'getGameStatus' | 'getLegalMoves' | 'getGameName' | 'getInitialState';
    gameName: string;
    gameState?: GameState;
    move?: number;
}

function getP4State(input: Input): P4State {
    const board: PlayerOrNone[][] = TableUtils.map(
        input.gameState?.board,
        (p: PlayerOrNone) => PlayerOrNone.encoder.decode(p['value']),
    );
    const turn: number = input.gameState?.turn;
    return new P4State(board, turn);
}
function getMancalaState(input: Input): MancalaState {
    const board: number[][] = input.gameState?.board;
    const turn: number = input.gameState?.turn;
    const playerZeroValue: number = input.gameState?.scores.map.map[0].value;
    const playerOneValue: number = input.gameState?.scores.map.map[0].value;
    const scores: PlayerNumberMap = PlayerNumberMap.of(playerZeroValue, playerOneValue);
    return new MancalaState(board, turn, scores);
}
function getMancalaMove(input: Input): MancalaMove {
    return MancalaMove.of(input.move!);
}
function getP4Move(input: Input): P4Move {
    return P4Move.of(input.move!);
}

// Create readline interface for persistent communication
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

class ProcessApplier<S extends GameState, M extends Move> {

    public readonly gameInfo: GameInfo;

    public constructor(public readonly gameName: string,
                       public readonly moveMapper: (input: Input) => M,
                       public readonly gameStateMapper: (input: Input) => S,
                       public readonly moveGenerator: MoveGenerator<M, S, RulesConfig>,
    ) {
        this.gameInfo = GameInfo.getByUrlName(gameName).get();
    }
    private getResponse(input: Input): any { // TODO: CHANGE return name
        if (input.action === 'choose') {
            const gameState: S = this.gameStateMapper(input);
            let node: GameNode<M, S> = new GameNode<M, S>(gameState);
            const move: M = this.moveMapper(input);
            const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultConfig();
            const result: MGPFallible<GameNode<M, S>> = this.gameInfo.rules.choose(node, move, defaultConfig);
            if (result.isSuccess()) {
                node = result.get();
            }
            return {
                success: result.isSuccess(),
                result: node.gameState,
            };
        } else if (input.action === 'getGameStatus') {
            const gameState: S = this.gameStateMapper(input);
            const node: GameNode<M, S> = new GameNode<M, S>(gameState);
            const status: GameStatus = this.gameInfo.rules.getGameStatus(node);
            return { status };
        } else if (input.action === 'getLegalMoves') {
            const gameState: S = this.gameStateMapper(input);
            const node: GameNode<M, S> = new GameNode<M, S>(gameState);
            const moveGenerator: MoveGenerator<M, S, RulesConfig> = this.moveGenerator;
            const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultConfig();
            const legalMoves: M[] = moveGenerator.getListMoves(node, defaultConfig);
            return { legalMoves };
        } else if (input.action === 'getInitialState') {
            // const optGameStateProvider: MGPOptional<(config: MGPOptional<RulesConfig>) => GameState> =
                // GameInfo.getStateProvider(this.gameName);
            // const gameStateProvider: (config: MGPOptional<RulesConfig>) => GameState = optGameStateProvider.get();
            // const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultConfig();
            const initialState: GameState = this.gameInfo.rules.getInitialState();
            return { initialState };
        }
    }
    public applyRequest(input: Input): void {
        // Always send response as single line
        // const response: any = this.getResponse(input);
        // const stringResponse: string = JSON.stringify(response);
        // console.log(stringResponse + "\n");
        console.log("jaaaajentouk\n");
        // process.stdout.write(stringResponse);
    }
}
rl.on('line', (line: string) => {
    try {
        const input: Input = JSON.parse(line);
        switch (input.gameName) {
            case 'p4':
                const processApplier: ProcessApplier<P4State, P4Move> = new ProcessApplier(
                    'p4',
                    getP4Move,
                    getP4State,
                    new P4MoveGenerator(),
                );
                processApplier.applyRequest(input);
                break;
            default:
                throw new TypeError('Le sang de ta jaaj')
        }
    } catch (e: any) {
        const errorMessage: string = JSON.stringify({ error: e?.message || e?.toString?.() || 'Unknown error' });
        console.error(errorMessage);
        process.stdout.write(JSON.stringify({ success: false, error: errorMessage, line }) + '\n');
    }
});

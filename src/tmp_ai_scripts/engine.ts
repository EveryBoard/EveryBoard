/* eslint-disable dot-notation */
/* eslint-disable max-lines-per-function */
import { Encoder, JSONValue, MGPFallible, MGPOptional } from '@everyboard/lib';
import * as readline from 'readline';
import { GameStatus } from '../app/jscaip/GameStatus';
import { PlayerOrNone } from '../app/jscaip/Player';
import { TableUtils } from '../app/jscaip/TableUtils';
import { MancalaMove } from '../app/games/mancala/common/MancalaMove';
import { MancalaState } from '../app/games/mancala/common/MancalaState';
import { PlayerNumberMap } from '../app/jscaip/PlayerMap';
import { P4State } from '../app/games/p4/P4State';
import { P4Move } from '../app/games/p4/P4Move';
import { P4MoveGenerator } from '../app/games/p4/P4MoveGenerator';
import { GameState } from '../app/jscaip/state/GameState';
import { GameNode } from '../app/jscaip/AI/GameNode';
import { Move } from '../app/jscaip/Move';
import { GameInfo } from '../app/components/normal-component/pick-game/game-info';
import { RulesConfig } from '../app/jscaip/RulesConfigUtil';
import { AI, AIDepthLimitOptions, AIOptions, MoveGenerator } from '../app/jscaip/AI/AI';
import { AwaleMoveGenerator } from '../app/games/mancala/awale/AwaleMoveGenerator';
import { AIInfo } from '../app/components/normal-component/pick-game/ai-info';

// compile with "npx tsc -p tsconfig.jscaip.json"

type ActionType =
    | 'applyMove'
    | 'getGameStatus'
    | 'getLegalMoves'
    | 'getInitialState'
    | 'getAINameList'
    | 'letAIPlay'
interface Input {
    action: ActionType;
    gameName: string;
    gameState?: JSONValue;
    move?: JSONValue;
}

function getP4State(input: Input): P4State {
    const board: PlayerOrNone[][] = TableUtils.map(
        input.gameState?.['board'],
        (p: number) => PlayerOrNone.encoder.decode(p),
    );
    const turn: number = input.gameState?.['turn'];
    return new P4State(board, turn);
}
function getMancalaState(input: Input): MancalaState {
    const board: number[][] = input.gameState?.['board'];
    const turn: number = input.gameState?.['turn'];
    const playerZeroValue: number = input.gameState?.['scores'][0];
    const playerOneValue: number = input.gameState?.['scores'][1];
    const scores: PlayerNumberMap = PlayerNumberMap.of(playerZeroValue, playerOneValue);
    return new MancalaState(board, turn, scores);
}

// Create readline interface for persistent communication
const rl: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

type GenericAI = AI<Move, GameState, AIOptions, RulesConfig>;

class ProcessApplier<S extends GameState, M extends Move> {

    public readonly gameInfo: GameInfo;
    public readonly aiInfo: AIInfo;

    public constructor(public readonly gameName: string,
                       public readonly moveEncoder: Encoder<M>,
                       public readonly gameStateMapper: (input: Input) => S,
                       public readonly moveGenerator: MoveGenerator<M, S, RulesConfig>,
    ) {
        this.gameInfo = GameInfo.getByUrlName(gameName).get();
        this.aiInfo = AIInfo.getByUrlName(gameName).get();
    }

    private getResponse(input: Input): Record<string, any> { // TODO: CHANGE return name
        if (input.action === 'applyMove') {
            const gameState: S = this.gameStateMapper(input);
            let node: GameNode<M, S> = new GameNode<M, S>(gameState);
            const move: M = this.moveEncoder.decode(input.move as JSONValue);
            const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultRulesConfig();
            const result: MGPFallible<GameNode<M, S>> =
                this.gameInfo.rules.choose(node, move, defaultConfig) as MGPFallible<GameNode<M, S>>;
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
            const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultRulesConfig();
            const status: GameStatus = this.gameInfo.rules.getGameStatus(node, defaultConfig);
            return { status };
        } else if (input.action === 'getLegalMoves') {
            const gameState: S = this.gameStateMapper(input);
            const node: GameNode<M, S> = new GameNode<M, S>(gameState);
            const moveGenerator: MoveGenerator<M, S, RulesConfig> = this.moveGenerator;
            const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultRulesConfig();
            const legalMoves: M[] = moveGenerator.getListMoves(node, defaultConfig);
            const legalEncodedMoves: JSONValue[] = legalMoves.map(this.moveEncoder.encode);
            return { legalMoves: legalEncodedMoves };
        } else if (input.action === 'getInitialState') {
            const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultRulesConfig();
            const initialState: GameState = this.gameInfo.rules.getInitialState(defaultConfig);
            return { initialState };
        } else if (input.action === 'getAINameList') {
            const aiList: GenericAI[] = this.aiInfo.ais;
            const aiNameList: string[] = aiList.map((ai: GenericAI) => ai.name);
            return {
                aiNameList,
            };
        } else {
            if (input.action !== 'letAIPlay') {
                throw Error('Unknown action ' + input.action);
            }
            const aiList: GenericAI[] = this.aiInfo.ais;
            const optionalAI: GenericAI[] = aiList.filter((genericAI: GenericAI) => genericAI.name === input['aiName']);
            const ai: GenericAI = optionalAI[0];
            const gameState: S = this.gameStateMapper(input);
            const node: GameNode<M, S> = new GameNode<M, S>(gameState);
            const defaultConfig: MGPOptional<RulesConfig> = this.gameInfo.rules.getDefaultRulesConfig();
            const aiMove: Move = ai.chooseNextMove(node, input['aiOptions'], defaultConfig);
            const result: MGPFallible<GameNode<M, S>> =
                this.gameInfo.rules.choose(node, aiMove, defaultConfig) as MGPFallible<GameNode<M, S>>;
            if (result.isSuccess()) {
                return {
                    board: result.get().gameState,
                };
            } else {
                return {
                    failureReason: result.getReason(),
                };
            }
        }
    }
    public getRequestReponse(input: Input): string {
        // Always send response as single line
        const response: Record<string, any> = this.getResponse(input);
        const stringResponse: string = JSON.stringify(response) + '\n';
        return stringResponse;
    }
}
rl.on('line', (line: string) => {
    try {
        const input: Input = JSON.parse(line);
        switch (input.gameName) {
            case 'P4': {
                const processApplier: ProcessApplier<P4State, P4Move> = new ProcessApplier(
                    'P4',
                    P4Move.encoder,
                    getP4State,
                    new P4MoveGenerator(),
                );
                const response: string = processApplier.getRequestReponse(input);
                console.log(response);
                break;
            }
            case 'Awale': {
                const processApplier: ProcessApplier<MancalaState, MancalaMove> = new ProcessApplier(
                    'Awale',
                    MancalaMove.encoder,
                    getMancalaState,
                    new AwaleMoveGenerator(),
                );
                const response: string = processApplier.getRequestReponse(input);
                console.log(response);
                break;
            }
            default:
                throw new TypeError('Unknown Game ' + structuredClone(input.gameName));
        }
    } catch (e: any) {
        const message: string = e?.message || e?.toString?.() || 'Unknown error';
        const stackTrace: string = e?.stack || 'No stack trace available';

        const errorInfo = {
            error: message,
            stack: stackTrace,
        };

        const errorMessage: string = JSON.stringify(errorInfo);

        // Log to stderr and stdout
        console.error(errorMessage); // stderr (for debugging)
        console.log(errorMessage); // stdout (for communication, if needed)
    }
});

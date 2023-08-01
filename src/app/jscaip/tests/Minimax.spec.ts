
// TODO:
//     it('Minimax should prune when instructed to do so', () => {
//         const getBoardValueSpy: jasmine.Spy = spyOn(minimax, 'getBoardValue').and.callThrough();
//         const getListMovesSpy: jasmine.Spy = spyOn(minimax, 'getListMoves').and.callThrough();
//
//         // Given the number of moves of a minimax without alpha-beta pruning
//         let node: P4Node = rules.getInitialNode();
//         node.findBestMove(3, minimax, false, false);
//         const callsToGetBoardValueWithoutPruning: number = getBoardValueSpy.calls.count();
//         getBoardValueSpy.calls.reset();
//         const callsToGetListMovesWithoutPruning: number = getListMovesSpy.calls.count();
//         getListMovesSpy.calls.reset();
//
//         // When computing the same information with alpha-beta pruning enabled
//         node = new P4Node(P4State.getInitialState());
//         node.findBestMove(3, minimax, false, true);
//         const callsToGetBoardValueWithPruning: number = getBoardValueSpy.calls.count();
//         const callsToGetListMovesWithPruning: number = getListMovesSpy.calls.count();
//
//         // Then the number of calls is strictly lower
//         expect(callsToGetBoardValueWithPruning).toBeLessThan(callsToGetBoardValueWithoutPruning);
//         expect(callsToGetListMovesWithPruning).toBeLessThan(callsToGetListMovesWithoutPruning);
//     });

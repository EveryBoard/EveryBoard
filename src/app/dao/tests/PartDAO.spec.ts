import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { TestBed } from '@angular/core/testing';
import { PartDAO } from '../PartDAO';

// eslint-disable-next-line max-lines-per-function
describe('PartDAO', () => {

    let partDAO: PartDAO;

    beforeEach(async() => {
        await setupEmulators();
        partDAO = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(partDAO).toBeTruthy();
    });
    // TODO: move thoses tests in OCaml
    // describe('for verified user', () => {
    //     it('should forbid starting a part when setting playerZero to another user than chosenOpponent or creator', async() => {
    //         // Given a part ready to be started
    //         const partInfo: PartInfo = await preparePart();

    //         // When chosen opponents updates the part document but puts another user as playerOne
    //         const update: Partial<Part> = {
    //             playerZero: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
    //             playerOne: partInfo.candidate,
    //             playerOneElo: 0,
    //             turn: 0,
    //             beginning: serverTimestamp(),
    //         };
    //         const result: Promise<void> = partDAO.update(partInfo.id, update);

    //         // Then it should fail
    //         await expectPermissionToBeDenied(result);
    //     });
    //     it('should forbid starting a part when setting playerOne to another user than chosenOpponent or creator', async() => {
    //         // Given a part ready to be started
    //         const partInfo: PartInfo = await preparePart();

    //         // When chosen opponents updates the part document but puts another user as playerOne
    //         const update: Partial<Part> = {
    //             playerZero: partInfo.creator,
    //             playerOne: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
    //             playerOneElo: 0,
    //             turn: 0,
    //             beginning: serverTimestamp(),
    //         };
    //         const result: Promise<void> = partDAO.update(partInfo.id, update);

    //         // Then it should fail
    //         await expectPermissionToBeDenied(result);
    //     });
    // });
    // describe('for creator', () => {
    //     it('should forbid creator to change typeGame/playerZero/playerZeroElo/playerOne/playerOneElo/beginning once a part has started', async() => {
    //         // Given a part that has started (i.e., beginning is set), and a player (here creator)
    //         const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
    //         const partId: string = await partDAO.create({
    //             ...PartMocks.INITIAL,
    //             beginning: serverTimestamp(),
    //             playerZero: creator,
    //             playerZeroElo: 0,
    //             playerOne: UserMocks.OPPONENT_MINIMAL_USER,
    //             playerOneElo: 0,
    //         });

    //         const updates: Partial<Part>[] = [
    //             { typeGame: 'P4' }, // Compared to Quarto
    //             { playerZero: UserMocks.OPPONENT_MINIMAL_USER },
    //             { playerZeroElo: 9999 },
    //             { playerOne: creator },
    //             { playerOneElo: 1000 },
    //             { beginning: serverTimestamp() },
    //         ];
    //         for (const update of updates) {
    //             // When trying to change the field
    //             const result: Promise<void> = partDAO.update(partId, update);
    //             // Then it should fail
    //             await expectPermissionToBeDenied(result);
    //         }
    //     });
    // });
    // describe('for player', () => {
    //     async function createOngoingPart()
    //     : Promise<{ playerOne: MinimalUser, playerZero: MinimalUser, partId: string, part: Part }>
    //     {
    //         const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
    //         const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

    //         const part: Part = { ...PartMocks.STARTED, playerZero, playerOne, playerOneElo: 0 };
    //         const partId: string = await partDAO.create(part);
    //         return { playerZero, playerOne, partId, part };
    //     }
    //     async function updatePlayersElo(finishedPart: Part): Promise<void> {
    //         // TODO FOR REVIEW: ban casting of <T | null> to null but use getNonNullable instead, I almost forgot her!
    //         await userService.updateElo(finishedPart.typeGame,
    //                                     finishedPart.playerZero,
    //                                     Utils.getNonNullable(finishedPart.playerOne),
    //                                     'ONE');
    //     }
    //     describe('EndGame updates', () => {
    //         async function assertSuccessOrFailure(result: Promise<void>, eloAreUpdated: boolean): Promise<void> {
    //             if (eloAreUpdated) {
    //                 // Then it should succeed
    //                 await expectAsync(result).toBeResolvedTo();
    //             } else {
    //                 // Then it should fail
    //                 await expectPermissionToBeDenied(result);
    //             }
    //         }
    //         for (const eloAreUpdated of [true, false]) {
    //             it('should allow timeouting a part with a timed out user (or refuse if elo is not updated)', async() => {
    //                 // Given a part where one player has timed out
    //                 const { partId, part, playerOne, playerZero } = await createOngoingPart();
    //                 part.remainingMsForOne = 1;

    //                 // Wait 10ms to ensure the player has timed out
    //                 await new Promise((f: (value: unknown) => void) => setTimeout(f, 10));
    //                 if (eloAreUpdated) {
    //                     await updatePlayersElo(part);
    //                 }

    //                 // When setting the part as result as timed out
    //                 const result: Promise<void> = partDAO.update(partId, {
    //                     result: MGPResult.TIMEOUT.value,
    //                     winner: playerZero,
    //                     loser: playerOne,
    //                 });

    //                 // Then it depend on elo
    //                 await assertSuccessOrFailure(result, eloAreUpdated);
    //             });
    //             it('should allow resigning (or refuse if elo is not updated)', async() => {
    //                 // Given an ongoing part
    //                 const { partId, playerOne, playerZero, part } = await createOngoingPart();
    //                 if (eloAreUpdated) {
    //                     await updatePlayersElo(part);
    //                 }

    //                 // When resigning
    //                 const result: Promise<void> = partDAO.update(partId, {
    //                     result: MGPResult.RESIGN.value,
    //                     winner: playerOne, // we are resigning
    //                     loser: playerZero,
    //                 });

    //                 // Then it depend on elo
    //                 await assertSuccessOrFailure(result, eloAreUpdated);
    //             });
    //             it('should allow setting winner and loser (or refuse if elo is not updated)', async() => {
    //                 // Given an ongoing part where elo are up to date
    //                 const { partId, playerOne, playerZero, part } = await createOngoingPart();
    //                 if (eloAreUpdated) {
    //                     await updatePlayersElo(part);
    //                 }

    //                 // When setting the winner and loser along with a move
    //                 const result: Promise<void> = partDAO.update(partId, {
    //                     turn: 1,
    //                     result: MGPResult.VICTORY.value,
    //                     winner: playerZero,
    //                     loser: playerOne,
    //                 });

    //                 // Then it depend on elo
    //                 await assertSuccessOrFailure(result, eloAreUpdated);
    //             });
    //             it('should allow hard draw (or refuse if elo is not updated)', async() => {
    //                 // Given a part in 'ongoing' state
    //                 const { partId, part } = await createOngoingPart();
    //                 if (eloAreUpdated) {
    //                     await updatePlayersElo(part);
    //                 }

    //                 // When updating it to 'pre-finished' state
    //                 const result: Promise<void> = partDAO.update(partId, {
    //                     result: MGPResult.HARD_DRAW.value,
    //                 });

    //                 // Then it depend on elo
    //                 await assertSuccessOrFailure(result, eloAreUpdated);
    //             });
    //         }
    //     });
    //     it('should forbid setting a player both as winner and loser', async() => {
    //         // Given an ongoing part where players elo are up to date
    //         const { partId, playerZero, part } = await createOngoingPart();
    //         await updatePlayersElo(part);

    //         // When setting the winner and loser along with a move
    //         const result: Promise<void> = partDAO.update(partId, {
    //             turn: 1,
    //             result: MGPResult.VICTORY.value,
    //             winner: playerZero,
    //             loser: playerZero,
    //         });

    //         // Then it should fail
    //         await expectPermissionToBeDenied(result);
    //     });
    //     it('should forbid setting winner and loser without changing result', async() => {
    //         // Given an ongoing part
    //         const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
    //         const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

    //         const part: Part = { ...PartMocks.STARTED, playerZero, playerOne, playerOneElo: 0 };
    //         const partId: string = await partDAO.create(part);

    //         // When setting the winner and loser without changing part result
    //         const result: Promise<void> = partDAO.update(partId, {
    //             winner: playerZero,
    //             loser: playerOne,
    //         });

    //         // Then it should fail
    //         await expectPermissionToBeDenied(result);
    //     });
    // });
});

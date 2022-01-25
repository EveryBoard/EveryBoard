import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { assert, display, Utils } from 'src/app/utils/utils';
import { MGPValidation } from '../utils/MGPValidation';
import { MGPFallible } from '../utils/MGPFallible';
import { UserDAO } from '../dao/UserDAO';
import { User } from '../domain/User';
import { MGPOptional } from '../utils/MGPOptional';
import { serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { DatabaseReference, DataSnapshot, getDatabase, onDisconnect, onValue, ref, set } from 'firebase/database';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updateProfile, User as FirebaseUser, UserCredential } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export class RTDB {
    public static OFFLINE: ConnectivityStatus = {
        state: 'offline',
        last_changed: serverTimestamp(),
    };
    public static ONLINE: ConnectivityStatus = {
        state: 'online',
        last_changed: serverTimestamp(),
    };
    public static setOffline(uid: string): Promise<void> {
        return set(ref(getDatabase(), '/status/' + uid), RTDB.OFFLINE);
    }
    public static async updatePresence(uid: string): Promise<void> {
        const userStatusDatabaseRef: DatabaseReference = ref(getDatabase(), '/status/' + uid);
        onValue(ref(getDatabase(), '.info/connected'), async(snapshot: DataSnapshot) => {
            if (snapshot.val() === false) {
                return;
            }
            await onDisconnect(userStatusDatabaseRef).set(RTDB.OFFLINE).then(async() => {
                await set(userStatusDatabaseRef, RTDB.ONLINE);
            });
        });
    }
}

interface ConnectivityStatus {
    state: string,
    // eslint-disable-next-line camelcase
    last_changed: unknown,
}

export class AuthUser {
    /**
     * Represents the fact the user is not connected
     */
    public static NOT_CONNECTED: AuthUser = new AuthUser(MGPOptional.empty(), MGPOptional.empty(), false);

    /**
     * Constructs an AuthUser.
     * Requires:
     * - the email of the user, which may be null to represent that no user is connected
     * - the username of the user, which may be null if the user hasn't chosen a username yet
     * - a boolean indicating whether the user is verified
     */
    constructor(public email: MGPOptional<string>,
                public username: MGPOptional<string>,
                public verified: boolean) {
    }
    public isConnected(): boolean {
        return this.email.isPresent();
    }
}

@Injectable()
export class AuthenticationService implements OnDestroy {
    public static VERBOSE: boolean = false;

    public unsubscribeFromAuth: Unsubscribe; // public for testing purposes only

    /**
     * This is the current user, if there is one.
     * Components depending on an AccountGuard can safely assume it is defined and directly call .get() on it.
     * (This is because the guard can't activate if there is no user, so if the guard was activated, there is a user)
     */
    public user: MGPOptional<AuthUser>;

    private userRS: ReplaySubject<AuthUser>;

    private userObs: Observable<AuthUser>;

    private registrationInProgress: MGPOptional<Promise<MGPFallible<FirebaseUser>>> = MGPOptional.empty();

    constructor(private readonly userDAO: UserDAO) {
        display(AuthenticationService.VERBOSE, '1 authService subscribe to Obs<User>');

        this.userRS = new ReplaySubject<AuthUser>(1);
        this.userObs = this.userRS.asObservable();
        this.unsubscribeFromAuth = onAuthStateChanged(getAuth(), async(user: FirebaseUser) => {
            if (user == null) { // user logged out
                display(AuthenticationService.VERBOSE, 'User is not connected');
                this.userRS.next(AuthUser.NOT_CONNECTED);
            } else { // user logged in
                if (this.registrationInProgress.isPresent()) {
                    // We need to wait for the entire registration process to finish,
                    // otherwise we risk reading an empty username before the user is fully created
                    await this.registrationInProgress.get();
                    this.registrationInProgress = MGPOptional.empty();
                }
                await RTDB.updatePresence(user.uid);
                const userInDB: User = (await userDAO.read(user.uid)).get();
                display(AuthenticationService.VERBOSE, `User ${userInDB.username} is connected, and the verified status is ${this.emailVerified(user)}`);
                const userHasFinalizedVerification: boolean =
                    this.emailVerified(user) === true && userInDB.username !== null;
                if (userHasFinalizedVerification === true && userInDB.verified === false) {
                    // The user has finalized verification but isn't yet marked as so in the DB, so we mark it.
                    await userDAO.markVerified(user.uid);
                }
                const authUser: AuthUser = new AuthUser(MGPOptional.ofNullable(user.email),
                                                        MGPOptional.ofNullable(userInDB.username),
                                                        userHasFinalizedVerification);
                this.user = MGPOptional.of(authUser);
                this.userRS.next(authUser);
            }
        });
    }
    public emailVerified(user: FirebaseUser): boolean {
        // Only needed for mocking purposes
        return user.emailVerified;
    }
    public async sendPasswordResetEmail(email: string): Promise<MGPValidation> {
        try {
            await sendPasswordResetEmail(getAuth(), email);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    /**
     * Registers an user given its username, email, and password.
     * Returns the firebase user upon success, or a failure otherwise.
     */
    public async doRegister(username: string, email: string, password: string): Promise<MGPFallible<FirebaseUser>> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.doRegister(' + email + ')');
        if (await this.userDAO.usernameIsAvailable(username)) {
            this.registrationInProgress = MGPOptional.of(this.registerAfterUsernameCheck(username, email, password));
            return this.registrationInProgress.get();
        } else {
            return MGPFallible.failure($localize`This username is already in use.`);
        }
    }
    private async registerAfterUsernameCheck(username: string, email: string, password: string)
    : Promise<MGPFallible<FirebaseUser>>
    {
        try {
            const userCredential: UserCredential =
                await createUserWithEmailAndPassword(getAuth(), email, password);
            const user: FirebaseUser = Utils.getNonNullable(userCredential.user);
            await this.createUser(user.uid, username);
            return MGPFallible.success(user);
        } catch (e) {
            return MGPFallible.failure(this.mapFirebaseError(e));
        }
    }
    public mapFirebaseError(error: FirebaseError): string {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return $localize`This email address is already in use.`;
            case 'auth/invalid-email':
                return $localize`This email address is invalid.`;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                // In accordance with security best practices, we don't give too much details here
                return $localize`You have entered invalid credentials.`;
            case 'auth/invalid-credential':
                return $localize`The credential is invalid or has expired, please try again.`;
            case 'auth/weak-password':
                return $localize`Your password is too weak, please use a stronger password.`;
            case 'auth/too-many-requests':
                return $localize`There has been too many requests from your device. You are temporarily blocked due to unusual activity. Try again later.`;
            case 'auth/popup-closed-by-user':
                return $localize`You closed the authentication popup without finalizing your log in.`;
            default:
                Utils.handleError('Unsupported firebase error: ' + error.code + ' (' + error.message + ')');
                return error.message;
        }
    }
    public async sendEmailVerification(): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.sendEmailVerification()');
        const user: MGPOptional<FirebaseUser> = MGPOptional.ofNullable(getAuth().currentUser);
        if (user.isPresent()) {
            if (this.emailVerified(user.get()) === true) {
                // This should not be reachable from a component
                return Utils.handleError('Verified users should not ask email verification twice');
            }
            try {
                await sendEmailVerification(user.get());
                return MGPValidation.SUCCESS;
            } catch (e) {
                return MGPValidation.failure(this.mapFirebaseError(e));
            }
        } else {
            // This should not be reachable from a component
            return Utils.handleError('Unlogged users cannot request for email verification');
        }
    }

    /**
     * Logs in using an email and a password. Returns a validation to indicate
     * either success, or failure with a specific error.
     */
    public async doEmailLogin(email: string, password: string): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.doEmailLogin(' + email + ')');
        try {
            // Login through firebase. If the login is incorrect or fails for some reason, an error is thrown.
            await signInWithEmailAndPassword(getAuth(), email, password);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    /**
     * Create the user doc in firestore. Google accounts initially have no username.
     */
    public async createUser(uid: string, username?: string): Promise<void> {
        assert(await this.userDAO.exists(uid) === false, 'createUser should only be called for new users');
        if (username == null) {
            await this.userDAO.set(uid, { verified: false });
        } else {
            await this.userDAO.set(uid, { username, verified: false });
        }
    }
    public async doGoogleLogin(): Promise<MGPValidation> {
        this.registrationInProgress = MGPOptional.of(this.registerOrLoginWithGoogle());
        const result: MGPFallible<FirebaseUser> = await this.registrationInProgress.get();
        return MGPValidation.ofFallible(result);
    }
    private async registerOrLoginWithGoogle(): Promise<MGPFallible<FirebaseUser>> {
        try {
            const provider: GoogleAuthProvider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            const userCredential: UserCredential = await signInWithPopup(getAuth(), provider);
            const user: FirebaseUser = Utils.getNonNullable(userCredential.user);
            await this.createUser(user.uid);
            return MGPFallible.success(user);
        } catch (e) {
            return MGPFallible.failure(this.mapFirebaseError(e));
        }

    }
    public async disconnect(): Promise<MGPValidation> {
        const user: MGPOptional<FirebaseUser> = MGPOptional.ofNullable(getAuth().currentUser);
        if (user.isPresent()) {
            const uid: string = user.get().uid;
            await RTDB.setOffline(uid);
            await getAuth().signOut();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Cannot disconnect a non-connected user');
        }
    }
    public getUserObs(): Observable<AuthUser> {
        return this.userObs;
    }
    public async setUsername(username: string): Promise<MGPValidation> {
        if (username === '') {
            return MGPValidation.failure($localize`Your username may not be empty.`);
        }
        try {
            const available: boolean = await this.userDAO.usernameIsAvailable(username);
            if (available === false) {
                return MGPValidation.failure($localize`This username is already in use, please select a different one.`);
            }
            const currentUser: FirebaseUser = Utils.getNonNullable(getAuth().currentUser);
            await updateProfile(currentUser, { displayName: username });
            await this.userDAO.setUsername(currentUser.uid, username);
            // Only gmail accounts can set their username, and they become finalized once they do
            await this.userDAO.markVerified(currentUser.uid);
            // Reload the user to notify listeners that the user has changed
            await this.reloadUser();
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async setPicture(url: string): Promise<MGPValidation> {
        try {
            const currentUser: FirebaseUser = Utils.getNonNullable(getAuth().currentUser);
            await updateProfile(currentUser, { photoURL: url });
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async reloadUser(): Promise<void> {
        const currentUser: FirebaseUser = Utils.getNonNullable(getAuth().currentUser);
        await currentUser.getIdToken(true);
        await currentUser.reload();
    }
    public ngOnDestroy(): void {
        this.unsubscribeFromAuth();
    }

}

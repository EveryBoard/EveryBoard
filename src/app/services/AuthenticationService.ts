import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import { Observable, BehaviorSubject, Subscription, ReplaySubject } from 'rxjs';

import { display, Utils } from 'src/app/utils/utils';
import { IJoueur } from '../domain/iuser';
import { MGPValidation } from '../utils/MGPValidation';
import { MGPFallible } from '../utils/MGPFallible';
import { JoueursDAO } from '../dao/JoueursDAO';

interface ConnectivityStatus {
    state: string,
    // eslint-disable-next-line camelcase
    last_changed: unknown,
}
export interface AuthUser {
    username: string,
    verified: boolean,
}
@Injectable()
export class AuthenticationService implements OnDestroy {
    public static VERBOSE: boolean = false;

    /**
     * Represents the fact the user is not connected
     */
    public static NOT_CONNECTED: { username: string, verified: boolean } = { username: null, verified: null };

    private authSub: Subscription;

    private joueurRS: ReplaySubject<AuthUser>;

    private joueurObs: Observable<AuthUser>;

    constructor(public afAuth: AngularFireAuth,
                private afs: AngularFirestore,
                private userDAO: JoueursDAO) {
        display(AuthenticationService.VERBOSE, '1 authService subscribe to Obs<User>');

        this.joueurRS = new ReplaySubject<AuthUser>(1);
        this.joueurObs = this.joueurRS.asObservable();
        this.authSub = this.afAuth.authState.subscribe(async(user: firebase.User) => {
            if (user == null) { // user logged out
                display(AuthenticationService.VERBOSE, '2.B: User is not connected, according to fireAuth');
                this.joueurRS.next(AuthenticationService.NOT_CONNECTED);
            } else { // user logged in
                this.updatePresence();
                const username: string = await userDAO.getUsername(user.uid);
                display(AuthenticationService.VERBOSE, { userLoggedInAccordingToFireAuth: user });
                const verified: boolean = user.emailVerified;
                this.joueurRS.next({ username, verified });
            }
        });
    }
    /*
     * Registers an user given its username, email, and password.
     * Returns the firebase user upon success, or a failure otherwise.
     */
    public async doRegister(username: string, email: string, password: string): Promise<MGPFallible<firebase.User>> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.doRegister(' + email + ')');
        try {
            if (await this.userDAO.usernameIsAvailable(username)) {
                const userCredential: firebase.auth.UserCredential =
                    await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user: firebase.User = userCredential.user;
                await this.updateUserData({ ...user, displayName: username });
                return MGPFallible.success(userCredential.user);
            } else {
                return MGPFallible.failure($localize`This username is already in use.`);
            }
        } catch (e) {
            return MGPFallible.failure(this.mapFirebaseError(e));
        }
    }
    public mapFirebaseError(error: firebase.FirebaseError): string {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return $localize`This email address is already in use.`;
            case 'auth/invalid-email':
                return $localize`This email address is invalid.`;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                // In accordance with security best practices, we don't give too much details here
                return $localize`You have entered an invalid username or password.`;
            case 'auth/invalid-credential':
                return $localize`The credential is invalid or has expired, please try again.`;
            default:
                Utils.handleError('Unsupported firebase error: ' + error.code + ' (' + error.message + ')');
                return error.message;
        }
    }
    public async sendEmailVerification(): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.sendEmailVerification()');
        const user: firebase.User = firebase.auth().currentUser;
        if (user != null) {
            if (user.emailVerified === true) {
                return MGPValidation.failure('Verified users should not ask email verification twice');
            }
            user.sendEmailVerification();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Unlogged users cannot request for email verification');
        }
    }

    /*
     * Logs in using an email and a password. Returns a validation to indicate
     * either success, or failure with a specific error.
     */
    public async doEmailLogin(email: string, password: string): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.doEmailLogin(' + email + ')');
        try {
            // Login through firebase. If the login is incorrect or fails for some reason, an error is thrown.
            const userCredential: firebase.auth.UserCredential =
                await firebase.auth().signInWithEmailAndPassword(email, password);
            await this.updateUserData(userCredential.user);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public updateUserData({ uid, email, displayName, emailVerified }: firebase.User): Promise<void> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.updateUserData(' + email + ')');
        // Sets user data to firestore on login
        const userRef: AngularFirestoreDocument<Partial<IJoueur>> = this.afs.doc(`joueurs/${uid}`);

        const data: Partial<IJoueur> = {
            email,
            displayName,
            pseudo: displayName || email,
            emailVerified,
        };

        return userRef.set(data, { merge: true });
    }
    public async doGoogleLogin(): Promise<MGPValidation> {
        try {
            const provider: firebase.auth.GoogleAuthProvider =
                new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            const userCredential: firebase.auth.UserCredential =
                await this.afAuth.signInWithPopup(provider);
            await this.updateUserData(userCredential.user);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async disconnect(): Promise<MGPValidation> {
        const user: firebase.User = firebase.auth().currentUser;
        if (user) {
            const uid: string = user.uid;
            const isOfflineForDatabase: ConnectivityStatus = {
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            };
            await firebase.database().ref('/status/' + uid).set(isOfflineForDatabase);
            await this.afAuth.signOut();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Cannot disconnect a non-connected user');
        }
    }
    public getAuthenticatedUser(): AuthUser {
        return this.joueurBS.getValue();
    }
    public updatePresence(): void {
        const uid: string = firebase.auth().currentUser.uid;
        const userStatusDatabaseRef: firebase.database.Reference = firebase.database().ref('/status/' + uid);
        firebase.database().ref('.info/connected').on('value', function(snapshot: firebase.database.DataSnapshot) {
            if (snapshot.val() === false) {
                return;
            }
            const isOfflineForDatabase: ConnectivityStatus = {
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            };
            const isOnlineForDatabase: ConnectivityStatus = {
                state: 'online',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            };
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });
    }
    public ngOnDestroy(): void {
        if (this.authSub) this.authSub.unsubscribe();
    }
    public getJoueurObs(): Observable<AuthUser> {
        return this.joueurObs;
    }
}

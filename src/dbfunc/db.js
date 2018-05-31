// Import firebase libs
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import { store } from "@/store";

// Firebase service instances and config
let config = {
	apiKey: "AIzaSyBoZ7fgZiSHbsDfwk0hDIeDavqe3uNe_yw",
	authDomain: "myuedb.firebaseapp.com",
	databaseURL: "https://myuedb.firebaseio.com",
	projectId: "myuedb",
	storageBucket: "gs://myuedb.appspot.com",
	messagingSenderId: "523406585701"
};
let app = firebase.initializeApp(config);
let auth = firebase.auth(app);
let firestore = firebase.firestore(app);
firestore.settings({ timestampsInSnapshots: true });
let storage = firebase.storage();

// Functions
function signInWithGoogleAuthProvider() {
	let provider = new firebase.auth.GoogleAuthProvider();

	provider.addScope("email");
	provider.addScope("profile");

	return firebase.auth().signInWithRedirect(provider);
}

function signInWithFacebookAuthProvider() {
	let provider = new firebase.auth.FacebookAuthProvider();

	provider.addScope("email");
	provider.addScope("public_profile");
	provider.setCustomParameters({
		"display": "popup"
	});

	return firebase.auth().signInWithRedirect(provider);
}

function signInWithGithubAuthProvider() {
	let provider = new firebase.auth.GithubAuthProvider();

	provider.addScope("repo");

	return firebase.auth().signInWithRedirect(provider);
}

function signInWithTwitterAuthProvider() {
	let provider = new firebase.auth.TwitterAuthProvider();

	return firebase.auth().signInWithRedirect(provider);
}

function addUser(user, isAdmin, extproviderId) {
	return new Promise((resolve, reject) => {
		let userRef = firestore.collection("users").doc(user.uid);
		userRef
			.set({
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
				emailVerified: user.emailVerified,
				providerId: extproviderId !== undefined ? extproviderId : user.providerId,
				creationTime: user.metadata.creationTime,
				lastSignInTime: user.metadata.lastSignInTime,
				isAdmin: isAdmin
			})
			.then(() => {
				userRef.collection("logins").add({
					loginTime: user.metadata.lastSignInTime,
					emailVerified: user.emailVerified,
					providerId: extproviderId !== undefined ? extproviderId : user.providerId,
					userip: store.state.ip,
					country: store.state.ipdata !== null ? store.state.ipdata.country_name : null,
					city: store.state.ipdata !== null ? store.state.ipdata.city : null,
					timezone: store.state.ipdata !== null ? store.state.ipdata.timezone : null,
					utc_offset: store.state.ipdata !== null ? store.state.ipdata.utc_offset : null,
					latitude: store.state.ipdata !== null ? store.state.ipdata.latitude : null,
					longitude: store.state.ipdata !== null ? store.state.ipdata.longitude : null
				});
				resolve(userRef);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

function updateUserPhotoURL(uid, photoURL) {
	return firestore.collection("users").doc(uid).set(
		{
			photoURL: photoURL
		},
		{ merge: true }
	);
}

function updateUserDisplayName(uid, displayName) {
	return firestore.collection("users").doc(uid).set(
		{
			displayName: displayName
		},
		{ merge: true }
	);
}

function updateUserInfoWhenLogin(user, lastSignInTime, extproviderId) {
	return new Promise((resolve, reject) => {
		let userRef = firestore.collection("users").doc(user.uid);

		userRef
			.set(
				{
					emailVerified: user.emailVerified,
					lastSignInTime: lastSignInTime
				},
				{ merge: true }
			)
			.then(() => {
				userRef.collection("logins").add({
					loginTime: lastSignInTime,
					emailVerified: user.emailVerified,
					providerId: extproviderId !== undefined ? extproviderId : user.providerId,
					userip: store.state.ip,
					country: store.state.ipdata !== null ? store.state.ipdata.country_name : null,
					city: store.state.ipdata !== null ? store.state.ipdata.city : null,
					timezone: store.state.ipdata !== null ? store.state.ipdata.timezone : null,
					utc_offset: store.state.ipdata !== null ? store.state.ipdata.utc_offset : null,
					latitude: store.state.ipdata !== null ? store.state.ipdata.latitude : null,
					longitude: store.state.ipdata !== null ? store.state.ipdata.longitude : null
				});
				resolve(userRef);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

function deleteCollection(collectionPath, batchSize) {
	let collectionRef = firestore.collection(collectionPath);
	let query = collectionRef.limit(batchSize);

	return new Promise((resolve, reject) => {
		deleteQueryBatch(query, batchSize, resolve, reject);
	});
}

function deleteQueryBatch(query, batchSize, resolve, reject) {
	query.get()
		.then((snapshot) => {
			if (snapshot.size === 0) {
				return 0;
			}

			let batch = firestore.batch();
			snapshot.docs.forEach((doc) => {
				batch.delete(doc.ref);
			});

			return batch.commit().then(() => {
				return snapshot.size;
			});
		})
		.then((numDeleted) => {
			if (numDeleted === 0) {
				resolve();
				return;
			}

			process.nextTick(() => {
				deleteQueryBatch(query, batchSize, resolve, reject);
			});
		})
		.catch(reject);
}

// ------------------------------------- //
export default {
	firebase,
	auth,
	firestore,
	storage,

	// Functions
	signInWithGoogleAuthProvider,
	signInWithFacebookAuthProvider,
	signInWithGithubAuthProvider,
	signInWithTwitterAuthProvider,
	addUser,
	updateUserPhotoURL,
	updateUserDisplayName,
	updateUserInfoWhenLogin,
	deleteCollection,
	deleteQueryBatch
};

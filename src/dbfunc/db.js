// Import firebase libs
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/functions";

import { store } from "@/store";
import { config } from "@/dbfunc/firebaseconfig";

const app = firebase.initializeApp(config);
const auth = firebase.auth(app);
const firestore = firebase.firestore(app);
firestore.settings({ timestampsInSnapshots: true });
const storage = firebase.storage();
const firefunctions = firebase.functions();

// Functions
function signInWithGoogleAuthProvider() {
  const provider = new firebase.auth.GoogleAuthProvider();

  provider.addScope("email");
  provider.addScope("profile");

  return firebase.auth().signInWithRedirect(provider);
}

function signInWithFacebookAuthProvider() {
  const provider = new firebase.auth.FacebookAuthProvider();

  provider.addScope("email");
  provider.addScope("public_profile");
  provider.setCustomParameters({
    display: "popup"
  });

  return firebase.auth().signInWithRedirect(provider);
}

function signInWithGithubAuthProvider() {
  const provider = new firebase.auth.GithubAuthProvider();

  provider.addScope("repo");

  return firebase.auth().signInWithRedirect(provider);
}

function signInWithTwitterAuthProvider() {
  const provider = new firebase.auth.TwitterAuthProvider();

  return firebase.auth().signInWithRedirect(provider);
}

function addUser(user, isAdmin, extproviderId, byAdmin) {
  return new Promise((resolve, reject) => {
    const userRef = firestore.collection("users").doc(user.uid);
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
        isAdmin: isAdmin,
        disabled: false
      })
      .then(() => {
        if (byAdmin === false) {
          userRef.collection("logins").add({
            loginTime: user.metadata.lastSignInTime,
            emailVerified: user.emailVerified,
            providerId:
            extproviderId !== undefined ? extproviderId : user.providerId,
            userip: store.state.ip,
            country:
            store.state.ipdata !== null
              ? store.state.ipdata.country_name
              : null,
            city: store.state.ipdata !== null ? store.state.ipdata.city : null,
            timezone:
            store.state.ipdata !== null ? store.state.ipdata.timezone : null,
            utc_offset:
            store.state.ipdata !== null ? store.state.ipdata.utc_offset : null,
            latitude:
            store.state.ipdata !== null ? store.state.ipdata.latitude : null,
            longitude:
            store.state.ipdata !== null ? store.state.ipdata.longitude : null
          });
        }
        resolve(userRef);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function updateUserPhotoURL(uid, photoURL) {
  return firestore
    .collection("users")
    .doc(uid)
    .set(
      {
        photoURL: photoURL
      },
      { merge: true }
    );
}

function updateUserDisable(uid, isDisable) {
  return firestore
    .collection("users")
    .doc(uid)
    .set(
      {
        disabled: isDisable
      },
      { merge: true }
    );
}

function updateUserDisplayName(uid, displayName) {
  return firestore
    .collection("users")
    .doc(uid)
    .set(
      {
        displayName: displayName
      },
      { merge: true }
    );
}

function updateUserProviderId(uid, providerId) {
  return firestore
    .collection("users")
    .doc(uid)
    .set(
      {
        providerId: providerId
      },
      { merge: true }
    );
}

function updateUserInfoWhenLogin(user, lastSignInTime, extproviderId) {
  return new Promise((resolve, reject) => {
    const userRef = firestore.collection("users").doc(user.uid);

    userRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return addUser(user, store.state.confData.adminemail === user.email, extproviderId, false)
            .then((userRef) => {
              resolve(userRef);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
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
                providerId:
                  extproviderId !== undefined ? extproviderId : user.providerId,
                userip: store.state.ip,
                country:
                  store.state.ipdata !== null
                    ? store.state.ipdata.country_name
                    : null,
                city: store.state.ipdata !== null ? store.state.ipdata.city : null,
                timezone:
                  store.state.ipdata !== null ? store.state.ipdata.timezone : null,
                utc_offset:
                  store.state.ipdata !== null ? store.state.ipdata.utc_offset : null,
                latitude:
                  store.state.ipdata !== null ? store.state.ipdata.latitude : null,
                longitude:
                  store.state.ipdata !== null ? store.state.ipdata.longitude : null
              });
              resolve(userRef);
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function deleteCollection(collectionPath, batchSize) {
  const collectionRef = firestore.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(query, batchSize, resolve, reject) {
  query
    .get()
    .then((snapshot) => {
      if (snapshot.size === 0) {
        return 0;
      }

      const batch = firestore.batch();
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

function saveAuthModesToConfig(authmodes) {
  const googleProvider = authmodes.indexOf("Google") !== -1;
  const facebookProvider = authmodes.indexOf("Facebook") !== -1;
  const twitterProvider = authmodes.indexOf("Twitter") !== -1;
  const githubProvider = authmodes.indexOf("GitHub") !== -1;
  return firestore
    .collection("config")
    .doc("configDoc")
    .set({
      googleProvider: googleProvider,
      facebookProvider: facebookProvider,
      twitterProvider: twitterProvider,
      githubProvider: githubProvider
    }, { merge: true });
}

// ------------------------------------- //
export default {
  firebase,
  auth,
  firestore,
  storage,
  firefunctions,

  // Functions
  signInWithGoogleAuthProvider,
  signInWithFacebookAuthProvider,
  signInWithGithubAuthProvider,
  signInWithTwitterAuthProvider,
  addUser,
  updateUserPhotoURL,
  updateUserDisplayName,
  updateUserInfoWhenLogin,
  updateUserDisable,
  updateUserProviderId,
  deleteCollection,
  deleteQueryBatch,
  saveAuthModesToConfig
};

// Packages
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Init
admin.initializeApp();

// Inner functions
function deleteCollection(collectionPath, batchSize) {
  let collectionRef = admin.firestore().collection(collectionPath);
  let query = collectionRef.limit(batchSize);

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

      let batch = admin.firestore().batch();
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
        return true;
      } else {
        process.nextTick(() => {
          deleteQueryBatch(query, batchSize, resolve, reject);
        });
        return false;
      }
    })
    .catch(reject);
}

function listAllUsers(nextPageToken) {
  let users = [];

  return admin
    .auth()
    .listUsers(1000, nextPageToken)
    .then((listUsersResult) => {
      listUsersResult.users.forEach((userRecord) => {
        users.push(userRecord.toJSON());
      });
      if (listUsersResult.pageToken) {
        listAllUsers(listUsersResult.pageToken);
      }
      return users;
    })
    .catch((error) => {
      return error;
    });
}

// Functions to export
const deleteUserProfile = functions.https.onCall((data, context) => {
  return admin
    .auth()
    .deleteUser(data.uid)
    .then(() => {
      return deleteCollection(`/users/${data.uid}/logins`, 5).then(() => {
        return admin
          .firestore()
          .collection("users")
          .doc(data.uid)
          .delete();
      });
    })
    .catch((error) => {
      console.log("Error deleting user profile:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error deleting user profile: " + error.message
      );
    });
});

const modifyLockOfUser = functions.https.onCall((data, context) => {
  return admin
    .auth()
    .updateUser(data.uid, {
      disabled: data.disabled
    })
    .then(() => {
      const lockedStr = data.disabled ? "locked" : "unlocked";
      return { done: true, message: `Successfully ${lockedStr} the user` };
    })
    .catch((error) => {
      console.log("Error updating user:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error updating user: " + error.message
      );
    });
});

const getUsers = functions.https.onCall((data, context) => {
  return listAllUsers()
    .then((resUsers) => {
      return { users: resUsers };
    })
    .catch((error) => {
      console.log("Error listing users:", error);
      throw new functions.https.HttpsError("internal", "Error listing users: " + error.message);
    });
});

const createUser = functions.https.onCall((data, context) => {
  return admin
    .auth()
    .createUser({
      email: data.email,
      emailVerified: false,
      password: data.password,
      displayName: data.displayName,
      disabled: false
    })
    .then((userRecord) => {
      console.log("Successfully created new user:", userRecord.uid);
      return { done: true, message: `Successfully created new user: ${userRecord.uid}`, user: userRecord };
    })
    .catch((error) => {
      console.log("Error creating user:", error);
      throw new functions.https.HttpsError("internal", "Error creating user: " + error.message);
    });
});


// Exports
module.exports = {
  deleteUserProfile,
  modifyLockOfUser,
  getUsers,
  createUser
};

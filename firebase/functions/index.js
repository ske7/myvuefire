// Packages
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Init
admin.initializeApp(functions.config().firebase);

// Functions
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

const deleteProfile = functions.auth.user().onDelete((user) => {
	return deleteCollection(`/users/${user.uid}/logins`, 5)
		.then(() => {
			return admin.firestore().collection("users").doc(user.uid).delete();
		})
		.catch();
});

const modifyLockOfUser = functions.https.onCall((data, context) => {
	return admin
		.auth()
		.updateUser(data.uid, {
			disabled: data.disabled
		})
		.then((userRecord) => {
			const lockedStr = data.disabled ? "locked" : "unlocked";
			// console.log(`Successfully ${lockedStr} the user`, userRecord.toJSON());
			return { done: true, message: `Successfully ${lockedStr} the user` };
		})
		.catch((error) => {
			console.log("Error updating user:", error);
			return error;
		});
});

// Exports
module.exports = {
	deleteProfile,
	modifyLockOfUser
};

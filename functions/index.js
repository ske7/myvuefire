const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);


function deleteCollection(collectionPath, batchSize) {
	let collectionRef = admin.firestore().collection(collectionPath);
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
				return;
			}

			process.nextTick(() => {
					 deleteQueryBatch(query, batchSize, resolve, reject);
			});
		})
		.catch(reject);
}

exports.deleteProfile = functions.auth.user().onDelete(user => {
	deleteCollection(`/users/${user.uid}/logins`, 5)
		.then(() => {
			return admin.firestore().collection("users").doc(user.uid).delete();
		})
		.catch();
});

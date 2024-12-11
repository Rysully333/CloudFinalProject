const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const firestore = admin.firestore();

exports.scheduleCheckOut = () => {
  console.log("Scheduled check-out function called.");
}

// Cloud Function to delete expired check-ins
exports.scheduledCheckOut = functions.pubsub.schedule("every 1 hours")
    .onRun(async () => {
      const now = admin.firestore.Timestamp.now();
      const oneHourAgo = new admin.firestore
          .Timestamp(now.seconds - 36, now.nanoseconds);

      try {
        // Query locationReports for expired check-ins
        const expiredReports = await firestore.collection("locationReports")
            .where("timestamp", "<=", oneHourAgo)
            .get();

        const batch = firestore.batch();

        for (const doc of expiredReports.docs) {
          const diningHallId = doc.data().diningHall;
          const userEmail = doc.data().userEmail;

          // Decrement occupancy for the respective dining hall
          const diningHallRef = firestore.collection("diningHalls")
              .doc(diningHallId);
          batch.update(diningHallRef, {
            occupancy: admin.firestore.FieldValue.increment(-1),
          });

          // Query user by email to get their document
          const userSnapsot = await firestore.collection("users")
          .where("email", "==", userEmail)
          .get();

          userSnapshot.forEach((userDoc) => {
            const userRef = firestore.collection("users").doc(userDoc.id);
            batch.update(iserRef, {
              currentLocation: "none",
            });
          });

          // Update user's current location to "none"
          // const userRef = firestore.collection("users")
          //     .where("email", "==", userEmail);
          // batch.update(userRef, {
          //   currentLocation: "none",
          // });

          // Delete the expired check-in
          batch.delete(doc.ref);
        }

        await batch.commit();
        console.log(`${expiredReports.size} expired check-ins removed.`);
      } catch (error) {
        console.error("Error during scheduled checkout:", error);
      }
      return null;
    });
// exports.scheduledCheckOut = functions.pubsub.schedule("every 1 hours")
//     .onRun(async () => {
//       const now = admin.firestore.Timestamp.now();
//       const oneHourAgo = new admin.firestore
//           .Timestamp(now.seconds - 3600, now.nanoseconds);

//       try {
//         // Query locationReports for expired check-ins
//         const expiredReports = await firestore.collection("locationReports")
//             .where("timestamp", "<=", oneHourAgo)
//             .get();

//         // const batch = firestore.batch();

//         // expiredReports.forEach((doc) => {
//         //   const diningHallId = doc.data().diningHall;
//         //   const userEmail = doc.data().userEmail;

//         //   // Decrement occupancy for the respective dining hall
//         //   const diningHallRef = firestore.collection("diningHalls")
//         //       .doc(diningHallId);
//         //   batch.update(diningHallRef, {
//         //     occupancy: admin.firestore.FieldValue.increment(-1),
//         //   });

//           // // Update user's current location to "none"
//           // const userQuery = firestore.collection("users").where("email", "==", userEmail);
//           // const userSnapshot = await userQuery.get();
//           // if (!userSnapshot.empty) {
//           //     const userDocRef = userSnapshot.docs[0].ref;
//           //     batch.update(userDocRef, {
//           //         currentLocation: "none",
//           //     });
//           // } else {
//           //     console.error("User not found with the given email");
//           // }
          
//           // Delete the expired check-in
//         //   batch.delete(doc.ref);
//         // });

//         // await batch.commit();
//         console.log(`${expiredReports.size} expired check-ins removed.`);
//       } catch (error) {
//         console.error("Error during scheduled checkout:", error);
//       }
//       return null;
//     });

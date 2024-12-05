const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const firestore = admin.firestore();

// Cloud Function to delete expired check-ins
exports.scheduledCheckOut = functions.pubsub.schedule("every 1 hours")
    .onRun(async () => {
      const now = admin.firestore.Timestamp.now();
      const oneHourAgo = new admin.firestore
          .Timestamp(now.seconds - 3600, now.nanoseconds);

      try {
        // Query locationReports for expired check-ins
        const expiredReports = await firestore.collection("locationReports")
            .where("timestamp", "<=", oneHourAgo)
            .get();

        // const batch = firestore.batch();

        // expiredReports.forEach((doc) => {
        //   const diningHallId = doc.data().diningHall;
        //   const userEmail = doc.data().userEmail;

        //   // Decrement occupancy for the respective dining hall
        //   const diningHallRef = firestore.collection("diningHalls")
        //       .doc(diningHallId);
        //   batch.update(diningHallRef, {
        //     occupancy: admin.firestore.FieldValue.increment(-1),
        //   });

          // // Update user's current location to "none"
          // const userQuery = firestore.collection("users").where("email", "==", userEmail);
          // const userSnapshot = await userQuery.get();
          // if (!userSnapshot.empty) {
          //     const userDocRef = userSnapshot.docs[0].ref;
          //     batch.update(userDocRef, {
          //         currentLocation: "none",
          //     });
          // } else {
          //     console.error("User not found with the given email");
          // }
          
          // Delete the expired check-in
        //   batch.delete(doc.ref);
        // });

        // await batch.commit();
        console.log(`${expiredReports.size} expired check-ins removed.`);
      } catch (error) {
        console.error("Error during scheduled checkout:", error);
      }
      return null;
    });

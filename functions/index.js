/**
 *   https://task-firebase.firebaseapp.com/
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const faker = require("faker");
const express = require("express");
const app = express();

admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();

const cors = require("cors")({ origin: true });
app.use(cors);

app.post("/fights", async (request, response) => {
  try {
    const { winner, loser, title } = request.body;
    const data = {
      winner,
      loser,
      title
    };
    const fightRef = await firestore.collection("fights").add(data);
    const fight = await fightRef.get();

    response.json({
      id: fightRef.id,
      data: fight.data()
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/fights/:id", async (request, response) => {
  try {
    const fightId = request.params.id;

    if (!fightId) throw new Error("Fight ID is required");

    const fight = await firestore
      .collection("fights")
      .doc(fightId)
      .get();

    if (!fight.exists) {
      throw new Error("Fight doesnt exist.");
    }

    response.json({
      id: fight.id,
      data: fight.data()
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/fights", async (request, response) => {
  try {
    const fightQuerySnapshot = await firestore.collection("fights").get();
    const fights = [];
    fightQuerySnapshot.forEach(doc => {
      fights.push({
        id: doc.id,
        data: doc.data()
      });
    });

    response.json(fights);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.put("/fights/:id", async (request, response) => {
  try {
    const fightId = request.params.id;
    const title = request.body.title;

    if (!fightId) throw new Error("id is blank");

    if (!title) throw new Error("Title is required");

    const data = {
      title
    };
    const fightRef = await firestore
      .collection("fights")
      .doc(fightId)
      .set(data, { merge: true });

    response.json({
      id: fightId,
      data
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete("/fights/:id", async (request, response) => {
  try {
    const fightId = request.params.id;

    if (!fightId) throw new Error("id is blank");

    await firestore
      .collection("fights")
      .doc(fightId)
      .delete();

    response.json({
      id: fightId
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

exports.api = functions.https.onRequest(app);

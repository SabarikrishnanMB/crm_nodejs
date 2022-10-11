const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv").config();
const URL = process.env.DB;
const DB = "newdatabase";

// Middleweare
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", function (req, res) {
  res.json({ message: "Success..." });
});

app.post("/login", async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);
    // Select the DB
    const db = connection.db(DB);
    // Select the Collection
    let users = await db
      .collection("users")
      .findOne({ email: req.body.email });
    if (users) {
      let compare = await bcrypt.compare(req.body.password, users.password);
      if (compare) {
        res.json({ message: "Successfully Logged In" });
      } else {
        res.status(401).json({ message: "User Credidential Wrong" });
      }
    } else {
      res.status(401).json({ message: "User Credidential Wrong" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Error",
    });
  }
});

app.post("/register", async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);
    // Select the DB
    const db = connection.db(DB);
    // Select the Collection
    let salt = await bcrypt.genSalt(10);
    console.log(salt);
    let hash = await bcrypt.hash(req.body.password, salt);
    console.log(hash);
    req.body.password = hash;

    await db.collection("users").insertOne(req.body);
    // Close the connection
    await connection.close();
    res.json({
      message: "Successfully Registered",
    });
  } catch (error) {
    res.json({
      message: "Error",
    });
  }
});

app.post("/servicereq", async function (req, res) {
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db(DB);
    await db.collection("request").insertOne(req.body);
    await connection.close();
    res.json({
      message: "Successfully Requested",
    });
  } catch (error) {
    res.json({
      message: "Error",
    });
  }
});

app.get("/service", async function (req, res) {
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db(DB);
    let student = await db.collection("users").find().toArray();
    await connection.close();
    res.json(student);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Error",
    });
  }
});

app.get("/register/:id", async function (req, res) {
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db(DB);
    let student = await db
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    await connection.close();
    res.json(student);
  } catch (error) {
    res.json({
      message: "Error",
    });
  }
});

app.listen(process.env.PORT || 3001);

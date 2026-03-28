const express = require("express");
const State = require("../models/states");
const City = require("../models/city");

const router = express.Router();

router.get("/states", async (req, res) => {
  const states = await State.find();
  res.json(states);
});

router.get("/cities/:stateId", async (req, res) => {
  const cities = await City.find({ state: req.params.stateId });
  res.json(cities);
});

module.exports = router;
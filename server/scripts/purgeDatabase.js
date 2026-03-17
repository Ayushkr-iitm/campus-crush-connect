require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Crush = require("../models/Crush");
const Match = require("../models/Match");
const Message = require("../models/Message");
const Report = require("../models/Report");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log("Connected. Purging collections...");

  await Promise.all([
    Report.deleteMany({}),
    Message.deleteMany({}),
    Match.deleteMany({}),
    Crush.deleteMany({}),
    User.deleteMany({})
  ]);

  // eslint-disable-next-line no-console
  console.log("Done. All users/matches/messages/reports deleted.");
  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


const mongoose = require("mongoose");
const DEFAULT_AVATAR = "https://yourcdn.com/default-avatar.png";

/* ---------------------------------------------
   SUB-SCHEMA: Connected Apps
---------------------------------------------- */
const connectedAppSchema = new mongoose.Schema({
  appName: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

/* ---------------------------------------------
   LOCATION Format
---------------------------------------------- */
const locationSchema = new mongoose.Schema({
  country: String,
  state: String,
  city: String,
  latitude: Number,
  longitude: Number,
});

/* ---------------------------------------------
   USER MAIN SCHEMA
---------------------------------------------- */
const userSchema = new mongoose.Schema({
  avatarUrl: { type: String, default: DEFAULT_AVATAR },

  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },

  nightMail: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },

  verificationToken: String,
  verificationTokenExpires: Date,     // We'll store expiry time here
  verified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },

  dob: { type: Date, required: true },
  location: locationSchema,

  // Grouped data
  data: {
    appsConnected: [connectedAppSchema],
    lastLogins: [{ type: Date }],
  },
});

/* ---------------------------------------------
   TTL INDEX (DELETE unverified users after 30 min)
---------------------------------------------- */

// Delete user 30 minutes after `verificationTokenExpires`
userSchema.index(
  { verificationTokenExpires: 1 },
  {
    expireAfterSeconds: 0,              // expires at the exact timestamp
    partialFilterExpression: { verified: false } // only unverified deleted
  }
);

module.exports = mongoose.model("User", userSchema);





































































// const mongoose = require("mongoose");
// const DEFAULT_AVATAR = "https://yourcdn.com/default-avatar.png";

// /* ---------------------------------------------
//    SUB-SCHEMA: Connected Apps
// ---------------------------------------------- */
// const connectedAppSchema = new mongoose.Schema({
//   appName: { type: String, required: true },
//   verified: { type: Boolean, default: false },
// });
// /* ---------------------------------------------
//    LOCATION Format
// ---------------------------------------------- */
// const locationSchema = new mongoose.Schema({
//   country: String,
//   state: String,
//   city: String,
//   latitude: Number,
//   longitude: Number,
// });

// /* ---------------------------------------------
//    USER MAIN SCHEMA
// ---------------------------------------------- */
// const userSchema = new mongoose.Schema({
  
//   avatarUrl: { type: String, default: DEFAULT_AVATAR },
//   email: { type: String, unique: true, required: true },
//   // phone: { type: String, unique: true, sparse: true }, // currently no number logi so need email      

//   username: { type: String, unique: true , required: true },
//   gender: { type: String, enum: ["male", "female"] , required: true },

//   nightMail: { type: String, unique: true , required: true},
//   passwordHash: { type: String, required: true },

//   verificationToken: String,
//   verificationTokenExpires: Date,
//   verified: { type: Boolean, default: false },

//   createdAt: { type: Date, default: Date.now },

//   dob: { type: Date , required: true},
//   location: locationSchema,

//   // Data Group
//   data: {
//     appsConnected: [connectedAppSchema],
//     lastLogins: [{ type: Date }],
//   },
// });

// module.exports = mongoose.model("User", userSchema);
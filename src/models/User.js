const mongoose = require("mongoose");

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
  avatarUrl: { type: String  },

  email: { type: String, unique: true },
  username: { type: String },

  gender: { type: String, enum: ["male", "female"]},

  nightMail: { type: String, unique: true , sparse: true },
  passwordHash: { type: String },

  createdAt: { type: Date, default: Date.now },

  dob: { type: Date },
  location: locationSchema,

  // Grouped data
  data: {
    appsConnected: [connectedAppSchema],
    lastLogins: [{ type: Date }],
  },

  isCompleted: {type: Boolean , default: false}
});

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
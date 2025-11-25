/* ============================================
   NOTIFICATION CONTROLLER (CommonJS)
=============================================== */

let io = null; // socket instance holder

// This is REQUIRED for server.js → setSocketIoInstance(io)
function setSocketIoInstance(ioInstance) {
  io = ioInstance;
}

const Notification = require("../models/Notification");
const User = require("../models/User");

/* ============================================================
   SEND NOTIFICATION TO A SINGLE USER
============================================================ */
const sendToUser = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const notification = await Notification.create({
      owner: userId,
      title,
      message,
      type: type || "info",
    });

    // 🔥 Emit through injected Socket.IO
    if (io) {
      io.to(userId.toString()).emit("new-notification", notification);
    }

    res.json({ success: true, notification });

  } catch (error) {
    console.log("Send Notification Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   SEND NOTIFICATION TO MULTIPLE USERS
============================================================ */
const sendToMany = async (req, res) => {
  try {
    const { userIds, title, message, type } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds must be an array" });
    }

    const notifications = userIds.map((id) => ({
      owner: id,
      title,
      message,
      type: type || "info",
    }));

    const saved = await Notification.insertMany(notifications);

    if (io) {
      userIds.forEach((id) => {
        io.to(id.toString()).emit("new-notification", {
          title,
          message,
          type,
        });
      });
    }

    res.json({ success: true, notifications: saved });
  } catch (error) {
    console.log("Send Notification Many Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   GET MY NOTIFICATIONS
============================================================ */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, read, limit = 30 } = req.query;

    const filter = { owner: userId };

    if (type) filter.type = type;
    if (read === "true") filter.read = true;
    if (read === "false") filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, notifications });

  } catch (error) {
    console.log("Get Notifications Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   MARK AS READ
============================================================ */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const noti = await Notification.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { read: true },
      { new: true }
    );

    if (!noti) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, notification: noti });

  } catch (error) {
    console.log("Mark Read Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   MARK ALL AS READ
============================================================ */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { owner: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: "All marked as read" });

  } catch (error) {
    console.log("Mark All Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   DELETE ONE
============================================================ */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, message: "Deleted successfully" });

  } catch (error) {
    console.log("Delete One Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   DELETE ALL
============================================================ */
const deleteAll = async (req, res) => {
  try {
    await Notification.deleteMany({ owner: req.user._id });

    res.json({ success: true, message: "All notifications deleted" });

  } catch (error) {
    console.log("Delete All Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================================================
   EXPORT ALL
============================================================ */
module.exports = {
  setSocketIoInstance,
  sendToUser,
  sendToMany,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAll,
};































// const Notification = require("../models/Notification.js");
// const User = require("../models/User.js");

// /* ============================================================
//    SEND NOTIFICATION TO A SINGLE USER
// ============================================================ */
// const sendToUser = async (req, res) => {
//   try {
//     const { userId, title, message, type } = req.body;

//     if (!userId || !title || !message) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Ensure user exists
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const notification = await Notification.create({
//       owner: userId,
//       title,
//       message,
//       type: type || "info",
//     });

//     // 🔥 Emit real-time notification (socket.io)
//     const io = req.app.get("io");
//     if (io) {
//       io.to(userId.toString()).emit("new-notification", notification);
//     }

//     res.json({ success: true, notification });
//   } catch (error) {
//     console.log("Send Notification Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ============================================================
//    SEND NOTIFICATION TO MULTIPLE USERS
// ============================================================ */
// const sendToMany = async (req, res) => {
//   try {
//     const { userIds, title, message, type } = req.body;

//     if (!userIds || !Array.isArray(userIds)) {
//       return res.status(400).json({ error: "userIds must be an array" });
//     }

//     const notifications = userIds.map((id) => ({
//       owner: id,
//       title,
//       message,
//       type: type || "info",
//     }));

//     const saved = await Notification.insertMany(notifications);

//     const io = req.app.get("io");
//     if (io) {
//       userIds.forEach((id) => {
//         io.to(id.toString()).emit("new-notification", {
//           title,
//           message,
//           type,
//         });
//       });
//     }

//     res.json({ success: true, notifications: saved });
//   } catch (error) {
//     console.log("Send Notification Many Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ============================================================
//    GET USER NOTIFICATIONS (WITH FILTERS)
// ============================================================ */
// const getMyNotifications = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { type, read, limit = 30 } = req.query;

//     const filter = { owner: userId };

//     if (type) filter.type = type;
//     if (read === "true") filter.read = true;
//     if (read === "false") filter.read = false;

//     const notifications = await Notification.find(filter)
//       .sort({ createdAt: -1 })
//       .limit(Number(limit));

//     res.json({ success: true, notifications });
//   } catch (error) {
//     console.log("Get Notifications Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ============================================================
//    MARK ONE NOTIFICATION AS READ
// ============================================================ */
// const markAsRead = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const noti = await Notification.findOneAndUpdate(
//       { _id: id, owner: req.user._id },
//       { read: true },
//       { new: true }
//     );

//     if (!noti) {
//       return res.status(404).json({ error: "Notification not found" });
//     }

//     res.json({ success: true, notification: noti });
//   } catch (error) {
//     console.log("Mark Read Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ============================================================
//    MARK ALL AS READ
// ============================================================ */
// const markAllAsRead = async (req, res) => {
//   try {
//     await Notification.updateMany(
//       { owner: req.user._id, read: false },
//       { read: true }
//     );

//     res.json({ success: true, message: "All marked as read" });
//   } catch (error) {
//     console.log("Mark All Read Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ============================================================
//    DELETE NOTIFICATION
// ============================================================ */
// const deleteNotification = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deleted = await Notification.findOneAndDelete({
//       _id: id,
//       owner: req.user._id,
//     });

//     if (!deleted) {
//       return res.status(404).json({ error: "Notification not found" });
//     }

//     res.json({ success: true, message: "Deleted successfully" });
//   } catch (error) {
//     console.log("Delete Notification Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ============================================================
//    DELETE ALL NOTIFICATIONS
// ============================================================ */
// const deleteAll = async (req, res) => {
//   try {
//     await Notification.deleteMany({ owner: req.user._id });

//     res.json({ success: true, message: "All notifications deleted" });
//   } catch (error) {
//     console.log("Delete All Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ============================================================
//    EXPORT ALL FUNCTIONS
// ============================================================ */
// module.exports = {
//   sendToUser,
//   sendToMany,
//   getMyNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification,
//   deleteAll,
// };

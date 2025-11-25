const express = require("express");

const {
  sendToUser,
  sendToMany,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAll,
} = require("../controllers/notificationController.js");

const isAuthenticated = require("../middlewares/isAuthenticated.js");

const router = express.Router();

// Admin / system actions
router.post("/send/user", sendToUser);
router.post("/send/many", sendToMany);

// User actions
router.get("/me", isAuthenticated, getMyNotifications);
router.put("/read/:id", isAuthenticated, markAsRead);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.delete("/:id", isAuthenticated, deleteNotification);
router.delete("/", isAuthenticated, deleteAll);

module.exports = router;

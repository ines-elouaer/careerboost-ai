const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// @desc    Récupérer mes notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("jobOffer", "title company")
    .populate("application", "status");

  res.json(notifications);
});

// @desc    Marquer une notification comme lue
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);

  if (!notif) {
    res.status(404);
    throw new Error("Notification non trouvée");
  }

  // sécurité : on ne peut toucher qu'à ses propres notifs
  if (notif.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Accès refusé");
  }

  notif.isRead = true;
  await notif.save();

  res.json(notif);
});

// @desc    Marquer toutes mes notifications comme lues
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ message: "Toutes les notifications ont été marquées comme lues" });
});
// @desc    Nombre de notifications non lues
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ count });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};


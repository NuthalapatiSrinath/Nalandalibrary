const reportService = require("../services/reportService");

exports.getReports = async (req, res) => {
  try {
    const topBooks = await reportService.getMostBorrowedBooks();
    const activeMembers = await reportService.getActiveMembers();
    const availability = await reportService.getBookAvailability();

    res.json({
      mostBorrowedBooks: topBooks,
      activeMembers,
      availability: availability[0] || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

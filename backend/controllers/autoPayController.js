const AutoPayMandate = require("../models/AutoPayMandate");

const getAutoPays = async (req, res) => {
  try {
    const mandates = await AutoPayMandate.find({ userId: req.userId }).lean();
    res.json({ success: true, mandates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAutoPay = async (req, res) => {
  try {
    const { title, amount, billerName, frequency } = req.body;
    const mandate = await AutoPayMandate.create({
      userId: req.userId,
      title,
      amount: Number(amount),
      billerName,
      frequency: frequency || "MONTHLY",
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    });
    res.status(201).json({ success: true, mandate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleAutoPay = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const mandate = await AutoPayMandate.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { status },
      { new: true }
    );
    res.json({ success: true, mandate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAutoPays, createAutoPay, toggleAutoPay };

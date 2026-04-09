const User = require('../models/User');
const Task = require('../models/Task');

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users/:userId/tasks
exports.getUserTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { createdBy: req.params.userId };
    if (status) filter.status = status;
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:userId/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể khoá tài khoản admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `Tài khoản đã ${user.isActive ? 'được mở khoá' : 'bị khoá'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:userId
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể xoá admin' });

    await Task.deleteMany({ createdBy: user._id });
    await user.deleteOne();
    res.json({ success: true, message: 'Đã xoá user và toàn bộ dữ liệu' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalTasks, byStatus, byCategory] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
    ]);

    const statusMap   = { todo: 0, in_progress: 0, done: 0, overdue: 0 };
    const categoryMap = { work: 0, study: 0, personal: 0, other: 0 };
    byStatus.forEach(s   => { statusMap[s._id]   = s.count; });
    byCategory.forEach(c => { categoryMap[c._id] = c.count; });

    res.json({ success: true, data: { totalUsers, totalTasks, byStatus: statusMap, byCategory: categoryMap } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
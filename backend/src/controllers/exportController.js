const Task    = require('../models/Task');
const ExcelJS = require('exceljs');
const PDFDoc  = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = require('docx');

const getTasks = async (req) => {
  const filter = req.user.role === 'admin' && req.query.userId
    ? { createdBy: req.query.userId }
    : { createdBy: req.user._id };
  return Task.find(filter).sort({ createdAt: -1 });
};

// GET /api/export/json
exports.exportJSON = async (req, res) => {
  try {
    const tasks = await getTasks(req);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.json');
    res.json({ exportedAt: new Date(), total: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/export/excel
exports.exportExcel = async (req, res) => {
  try {
    const tasks    = await getTasks(req);
    const workbook = new ExcelJS.Workbook();
    const sheet    = workbook.addWorksheet('Nhiệm vụ');

    sheet.columns = [
      { header: 'STT',        key: 'stt',       width: 6  },
      { header: 'Tiêu đề',    key: 'title',      width: 35 },
      { header: 'Trạng thái', key: 'status',     width: 14 },
      { header: 'Danh mục',   key: 'category',   width: 14 },
      { header: 'Ưu tiên',    key: 'priority',   width: 12 },
      { header: 'Deadline',   key: 'deadline',   width: 16 },
      { header: 'Ngày tạo',   key: 'createdAt',  width: 16 },
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF185FA5' } };
    });

    tasks.forEach((task, i) => {
      sheet.addRow({
        stt:      i + 1,
        title:    task.title,
        status:   task.status,
        category: task.category,
        priority: task.priority,
        deadline: task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Chưa đặt',
        createdAt: new Date(task.createdAt).toLocaleDateString('vi-VN')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/export/pdf
exports.exportPDF = async (req, res) => {
  try {
    const tasks = await getTasks(req);
    const doc   = new PDFDoc({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.pdf');
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('DANH SACH NHIEM VU', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Xuat luc: ${new Date().toLocaleString('vi-VN')} | Tong so: ${tasks.length} nhiem vu`, { align: 'center' });
    doc.moveDown(1);

    tasks.forEach((task, i) => {
      doc.fontSize(12).font('Helvetica-Bold').text(`${i + 1}. ${task.title}`);
      doc.fontSize(10).font('Helvetica')
        .text(`   Trang thai: ${task.status}  |  Uu tien: ${task.priority}  |  Danh muc: ${task.category}`)
        .text(`   Deadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Chua dat'}`);
      if (task.description) doc.text(`   Mo ta: ${task.description}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/export/word
exports.exportWord = async (req, res) => {
  try {
    const tasks = await getTasks(req);

    const headerCells = ['STT', 'Tieu de', 'Trang thai', 'Uu tien', 'Deadline'].map(t =>
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })
    );

    const dataRows = tasks.map((task, i) =>
      new TableRow({
        children: [
          `${i + 1}`, task.title, task.status, task.priority,
          task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Chua dat'
        ].map(text => new TableCell({ children: [new Paragraph(text)] }))
      })
    );

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ children: [new TextRun({ text: 'Danh sach Nhiem vu', bold: true, size: 32 })] }),
          new Paragraph(''),
          new Table({ rows: [new TableRow({ children: headerCells }), ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.docx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
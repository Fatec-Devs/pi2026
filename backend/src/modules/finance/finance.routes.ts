import { Router, Request, Response } from 'express';
import { FinancialEntryModel } from '../../database/models/financialEntry.model';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware, requireRole('ADMIN'));

// GET /finance/summary
router.get('/summary', async (_req: Request, res: Response, next) => {
  try {
    const summary = await FinancialEntryModel.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const income = summary.find((entry) => entry._id === 'INCOME')?.total ?? 0;
    const expense = summary.find((entry) => entry._id === 'EXPENSE')?.total ?? 0;

    res.json({
      income,
      expense,
      balance: income - expense,
    });
  } catch (err) { next(err); }
});

// GET /finance/entries
router.get('/entries', async (req: Request, res: Response, next) => {
  try {
    const { type } = req.query;

    if (type && type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Tipo de lançamento inválido',
      });
    }

    const filter = type ? { type: String(type) } : {};
    const entries = await FinancialEntryModel.find(filter).sort({ date: -1, createdAt: -1 });

    res.json({
      entries,
      total: entries.length,
    });
  } catch (err) { next(err); }
});

// POST /finance/entries
router.post('/entries', async (req: Request, res: Response, next) => {
  try {
    const { serviceOrderId, type, description, amount, date, category } = req.body;

    if (!type || !description || amount === undefined || !category) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Tipo, descrição, valor e categoria são obrigatórios',
      });
    }

    const entry = await FinancialEntryModel.create({
      serviceOrderId,
      type,
      description,
      amount,
      date,
      category,
    });

    res.status(201).json(entry);
  } catch (err) { next(err); }
});

export default router;

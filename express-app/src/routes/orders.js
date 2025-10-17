import express from 'express';
import { Order, Cart } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const order = await Order.create({
    userId: req.userId,
    items,
    total,
    shippingAddress
  });
  
  await Cart.findOneAndDelete({ userId: req.userId });
  res.status(201).json(order);
}));

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(orders);
}));

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}));

router.patch('/:id/status', authMiddleware, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}));

export default router;

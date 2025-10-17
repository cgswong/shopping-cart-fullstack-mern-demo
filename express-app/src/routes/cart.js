import express from 'express';
import { Cart } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId }) || { items: [] };
  res.json(cart);
}));

router.post('/items', authMiddleware, asyncHandler(async (req, res) => {
  const { productId, quantity, price } = req.body;
  let cart = await Cart.findOne({ userId: req.userId });
  
  if (!cart) {
    cart = await Cart.create({ userId: req.userId, items: [{ productId, quantity, price }] });
  } else {
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price });
    }
    cart.updatedAt = Date.now();
    await cart.save();
  }
  
  res.json(cart);
}));

router.put('/items/:productId', authMiddleware, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  
  const item = cart.items.find(item => item.productId.toString() === req.params.productId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  item.quantity = quantity;
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
}));

router.delete('/items/:productId', authMiddleware, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  
  cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
}));

router.delete('/', authMiddleware, asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.userId });
  res.json({ message: 'Cart cleared' });
}));

export default router;

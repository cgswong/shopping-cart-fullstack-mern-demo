import express from 'express';
import { Product } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  const products = await Product.find(filter);
  res.json(products);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}));

router.post('/', asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}));

router.patch('/:id/stock', asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { stock: quantity } },
    { new: true }
  );
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}));

export default router;

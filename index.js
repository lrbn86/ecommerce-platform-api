import express from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import morgan from 'morgan';
import crypto from 'node:crypto';

const db = {
  users: [],
  products: [
    {
      id: crypto.randomUUID(),
      name: "Apple iPhone",
      price: 865.99
    },
    {
      id: crypto.randomUUID(),
      name: "Android",
      price: 165.99
    },
    {
      id: crypto.randomUUID(),
      name: "Roomba",
      price: 200.99
    },
  ],
  orders: [],
  cart: {
    items: []
  },
};

const app = express();
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

const secretKey = crypto.randomBytes(20).toString('hex');

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.users.push(user);
  return res.status(201).json(user);
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(user, secretKey, { expiresIn: '5m' });
  return res.status(200).json({ token });
});

app.use(authenticate);

app.post('/products', async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add products' });
  }
  const product = {
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return res.status(201).json({ message: 'Product created' });
});

app.get('/products', async (req, res) => {
  return res.status(200).json({ products: db.products });
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);
  return res.status(200).json({ product });
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);
  const newProduct = { ...req.body, ...product };
  newProduct.updatedAt = new Date();
  return res.status(200).json({ product: newProduct });
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);
  product.deleted = true;
  product.updatedAt = new Date();
  return res.sendStatus(204);
});

app.post('/cart/items', async (req, res) => {
  // TODO: How to determine if we are adding things from products to cart?
  return res.status(201).json({ cart: db.cart.items });
});

app.get('/cart', async (req, res) => {
  return res.status(200).json({ cart: db.cart.items });
});

app.put('/cart/items/:id', async (req, res) => {
  const { id } = req.params;
  const item = db.cart.items.find(i => i.id === id);
  item.updatedAt = new Date();
  return res.status(200).json({ cart: db.cart.items });
});

app.delete('/cart/items/:id', async (req, res) => {
  const { id } = req.params;
  const item = db.cart.items.find(i => i.id === id);
  item.updatedAt = new Date();
  return res.sendStatus(204);
});

app.post('/orders', async (req, res) => {
  return res.status(201).json({ message: 'Created order' });
});

app.post('/orders/:id/pay', async (req, res) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id === id);
  order.paid = true;
  return res.status(200).json({ message: 'Paid order' });
});

app.get('/orders', async (req, res) => {
  return res.status(200).json({ orders: db.orders });
});

app.get('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id === id);
  return res.status(200).json({ order });
});

app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id === id);
  order.deleted = true;
  return res.sendStatus(204);
});

app.use((req, res, next) => {
  return res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.log(err.message);
  return res.status(500).json({ error: 'Something went wrong!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }
  try {
    const user = jwt.verify(token, secretKey);
    req.user = user;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  next();
}

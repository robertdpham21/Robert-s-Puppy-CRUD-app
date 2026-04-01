import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import { createRemoteJWKSet, jwtVerify } from 'jose';

dotenv.config();

const DB_SCHEMA = process.env.DB_SCHEMA || 'app';
const useSsl = process.env.PGSSLMODE === 'require';
const ASGARDEO_ORG = process.env.ASGARDEO_ORG || 'abel';

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
  define: { schema: DB_SCHEMA },
});

const Puppies = sequelize.define('puppies', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.TEXT, allowNull: false },
  breed: { type: DataTypes.TEXT, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.STRING, allowNull: false },
}, {
  schema: DB_SCHEMA,
  tableName: 'puppies',
  timestamps: false,
});

// ------Auth Middleware------
const JWKS = createRemoteJWKSet(
  new URL(`https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/jwks`)
);

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Apply auth middleware to all /puppies routes
app.use('/puppies', authMiddleware);

// ------Routes------
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// GET all puppies 
app.get('/puppies', async (req, res) => {
  try {
    const puppies = await Puppies.findAll({ where: { user_id: req.userId } });
    res.json(puppies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single puppy by id
app.get('/puppies/:id', async (req, res) => {
  try {
    const puppy = await Puppies.findByPk(req.params.id);
    if (!puppy) return res.status(404).json({ error: 'Puppy not found' });
    if (puppy.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    res.json(puppy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — attach logged in user's id
app.post('/puppies', async (req, res) => {
  try {
    console.log('req.userId:', req.userId)
    console.log('req.body:', req.body)
    const { name, breed, age } = req.body;
    const puppy = await Puppies.create({ name, breed, age, user_id: req.userId });
    res.status(201).json(puppy);
  } catch (err) {
    console.error('POST error:', err.message) 
    res.status(500).json({ error: err.message });
  }
});

// PUT 
app.put('/puppies/:id', async (req, res) => {
  try {
    const puppy = await Puppies.findByPk(req.params.id);
    if (!puppy) return res.status(404).json({ error: 'Puppy not found' });
    if (puppy.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    const { name, breed, age } = req.body;
    await puppy.update({ name, breed, age });
    res.json(puppy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE 
app.delete('/puppies/:id', async (req, res) => {
  try {
    const puppy = await Puppies.findByPk(req.params.id);
    if (!puppy) return res.status(404).json({ error: 'Puppy not found' });
    if (puppy.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    await puppy.destroy();
    res.json({ message: `Puppy ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await Puppies.sync({ alter: true });
    console.log(`Puppies model synced in schema "${DB_SCHEMA}".`);
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error('Error: ', err);
    process.exit(1);
  }
};

startServer();
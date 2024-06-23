import express from 'express';
import cors from 'cors';
import knex from 'knex';
import { registerHandler } from './controllers/register.js';
import { rootHandler } from './controllers/root.js';
import { signInHandler } from './controllers/sign-in.js';
import { profileHandler } from './controllers/profile.js';
import { imageHandler } from './controllers/image.js';

const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'smart-brain',
  },
});
app.use(cors());

app.use(express.json());

app.get('/', rootHandler(db));

app.post('/signin', signInHandler(db));

app.post('/register', registerHandler(db));

app.get('/profile/:id', profileHandler(db));

app.put('/image', imageHandler(db));

app.listen(3001, () => {
  console.log('Server is running on port 3001: http://localhost:3001/');
});

import { Request, Response } from 'express';
import knex from 'knex';
import bcrypt from 'bcrypt';

export const registerHandler =
  (db: knex.Knex<any, unknown[]>) => async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const existingUser = await db('users')
        .select('*')
        .where('email', '=', email);

      if (existingUser.length) {
        return res.status(409).json('Email already in use');
      }

      const hash = bcrypt.hashSync(password, 10);

      await db.transaction(async (trx) => {
        const loginEmail = await trx
          .insert({
            hash: hash,
            email: email,
          })
          .into('login')
          .returning('email');

        const user = await trx('users').returning('*').insert({
          email: loginEmail[0].email,
          name: name,
          joined: new Date(),
        });

        res.json(user[0]);
      });
    } catch (err) {
      res.status(400).json('unable to register');
    }
  };

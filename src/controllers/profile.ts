import { TUser } from '@/types/schema';
import { Request, Response } from 'express';
import knex from 'knex';

export const profileHandler =
  (db: knex.Knex<any, unknown[]>) => (req: Request, res: Response) => {
    const { id } = req.params;
    db.select('*')
      .from('users')
      .where({ id })
      .then((user: TUser[]) => {
        if (user.length) {
          res.json(user[0]);
        } else {
          res.status(400).json('Not found');
        }
      })
      .catch((err) => res.status(400).json('error getting user'));
  };

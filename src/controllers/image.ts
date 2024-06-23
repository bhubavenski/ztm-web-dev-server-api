import { Request, Response } from 'express';
import knex from 'knex';

type bodyProps = {
  id: string;
};

export const imageHandler =
  (db: knex.Knex<any, unknown[]>) => (req: Request, res: Response) => {
    const { id }: bodyProps = req.body;
    db('users')
      .where('id', '=', id)
      .increment('entries', 1)
      .returning('entries')
      .then((entries) => res.json(entries[0].entries))
      .catch((err) => res.status(400).json('unable to get entries'));
  };

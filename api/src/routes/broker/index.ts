import { Router } from 'express';
import { accountsRouter } from './account';
import { fundingRouter } from './funding';

export const brokerRouter = Router();

brokerRouter.use('/accounts', accountsRouter);
brokerRouter.use('/funding', fundingRouter);


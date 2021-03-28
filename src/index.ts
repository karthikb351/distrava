import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';
import { verifyKeyMiddleware } from "discord-interactions";
import * as express from 'express';

const getAllUsers: HttpFunction = (req, res) => {
  // TODO: Get users from a database
  res.send(['Alice', 'Bob']);
};

const getUser: HttpFunction = (req, res) => {
  // TODO: Get user details
  res.send({name: 'Alice', location: 'LAX'});
};

const getDefault: HttpFunction = (req, res) => {
  res.status(404).send('Bad URL');
};

// Create an Express object and routes (in order)
const app = express();
app.use(verifyKeyMiddleware('3aa4149e26f777c952202ba6b5673d52bef199b129bd6e273f012f9988280b8b'));

app.use('/users/:id', getUser);
app.use('/users/', getAllUsers);
app.use(getDefault);

// Set our GCF handler to our Express app.
exports.distrava = app;

import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import * as express from 'express';

// Create an Express object and routes (in order)
const app = express();

app.post(
  '/interactions',
  verifyKeyMiddleware(
    '3aa4149e26f777c952202ba6b5673d52bef199b129bd6e273f012f9988280b8b'
  ),
  (req, res) => {
    const interaction = req.body;
    if (
      interaction &&
      interaction.type === InteractionType.APPLICATION_COMMAND
    ) {
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `You used: ${interaction.data.name}`,
        },
      });
    } else {
      res.send({
        type: InteractionResponseType.PONG,
      });
    }
  }
);

// Set our GCF handler to our Express app.
exports.distrava = app;

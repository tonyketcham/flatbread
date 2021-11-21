import express from 'express';
import type { Request, Response } from 'express';
import {
  getGraphQLParameters,
  processRequest,
  sendResult,
  renderGraphiQL,
} from 'graphql-helix';
import { altairExpress } from 'altair-express-middleware';
import { schema } from './schema';

const app = express();

export const start = () => {
  app.use(express.json());

  app.use('/graphql', async (req, res) => {
    const request = {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
    };

    const { operationName, query, variables } = getGraphQLParameters(request);

    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
    });

    sendResult(result, res);
  });

  const graphQLEditor = 'altair';
  // const customGQLEditor = undefined;
  const defaultQuery = `query Song {
  song {
    firstVerse
    secondVerse
  }
}`;

  const editorPick = (() => {
    switch (graphQLEditor) {
      // case 'custom':
      //   return customGQLEditor;
      case 'altair':
        return altairExpress({
          endpointURL: '/graphql',
          initialQuery: defaultQuery,
        });
      default:
        return async (req: Request, res: Response) => {
          res.send(
            renderGraphiQL({
              endpoint: '/graphql',
              defaultQuery: defaultQuery,
            })
          );
        };
    }
  })();

  app.use('/explore', editorPick);

  const port = process.env.PORT || 5555;

  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.group();
    console.info('\n%cOyu GraphQL server\n', 'color: green');
    console.log('%cgraphql: ' + url, 'opacity: 0.5');
    console.groupEnd();
    /**
     * If the process was spawned with an IPC channel, send a message to the parent process that the server is ready.
     * This allows the parent process to wait for the server to be ready before continuing, like when you want the GraphQL server to be ready before starting the build process.
     * @see https://nodejs.org/api/process.html#processsendmessage-sendhandle-options-callback
     */
    process.send && process.send('oyu-gql-ready');
  });
};
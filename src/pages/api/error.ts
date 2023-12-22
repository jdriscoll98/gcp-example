import { ErrorReporting } from '@google-cloud/error-reporting';
import convertSourceMap from 'convert-source-map';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ErrorObject, serializeError } from 'serialize-error';
import { SourceMapConsumer } from 'source-map-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body: ErrorObject = req.body;
  const serviceAccountStr = process.env.IS_STAGING
    ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON_STAGING
    : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountStr) {
    try {
      const serviceAccountKey = JSON.parse(serviceAccountStr);
      const errors = new ErrorReporting({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        credentials: serviceAccountKey,
      });
      const stack =
        body.name === 'FirebaseError'
          ? body.stack
          : await getStackTrace(body.stack);
      const errorEvent = errors.event();
      errorEvent.setUserAgent(req.headers['user-agent']);
      errorEvent.setMessage(body.message);
      errorEvent.setServiceContext(req.body.id ?? 'unknown');
      errorEvent.setFilePath(stack);
      const ipAddress =
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      errorEvent.setRemoteIp(ipAddress.toString());
      if (req.cookies?.auth) errorEvent.setUser(parseJWT(req.cookies.auth));
      if (req.headers.referer) errorEvent.setUrl(req.headers.referer);
      await new Promise((resolve) =>
        errors.report(errorEvent, undefined, undefined, resolve)
      );
      res.json({ stack });
    } catch (e) {
      res.json(serializeError(e));
    }
  } else {
    res.json({ message: 'No service' });
  }
}

const parseJWT = (token: string) => {
  try {
    const str = Buffer.from(token.split('.')[1], 'base64').toString();
    const obj = JSON.parse(str);
    if (obj?.sub) return obj.sub as string;
  } catch (_e) {}
  return token;
};

const getStackTrace = async (stack?: string) => {
  if (!stack) return 'No Stack';
  const match = stack.match(/(?:https?:\/\/)[^\s)]+/);
  if (!match) return 'No Url';
  const split = match[0].split(':');
  const sourceMapFile = split[0] + ':' + split[1] + '.map';
  console.log('sourceMapFile: ', sourceMapFile);
  const sourceMapContent = await fetch(sourceMapFile).then((res) => res.text());
  const sourceMap = convertSourceMap.fromJSON(sourceMapContent);
  if (sourceMap) {
    const consumer = new SourceMapConsumer(sourceMap.sourcemap);
    const sourceLocation = consumer.originalPositionFor({
      line: parseInt(split[2], 10),
      column: parseInt(split[3], 10),
    });
    const parsed = `${sourceLocation.source}:${sourceLocation.line}:${sourceLocation.column}`;
    return parsed + '\n' + stack;
    // const stackFrames = stack.split('\n').map((frame, i) => {
    //   const match = frame.match(/(.*):\d+:\d+$/);
    //   if (!match) return frame;
    //   const sourceLocation = consumer.originalPositionFor({
    //     line: parseInt(match[1], 10),
    //     column: 0,
    //   });
    //   return `${match[1]}:${sourceLocation.line}:${sourceLocation.column}`;
    // });
    // return stackFrames.join('\n');
  }
  return 'No Source Map';
};

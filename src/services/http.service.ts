import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import 'express-async-errors';

import { ConfigService } from './config.service';
import { LogService } from './log.service';
import { IConfig } from '../config';

export class HttpService {
    private readonly app: express.Application;

    constructor(
        private readonly logService: LogService,
        private readonly configService: ConfigService<IConfig>,
        private readonly apiRouter: express.Router,
    ) {
        this.app = express();
        this.app.use(helmet());

        this.handleError = this.handleError.bind(this);
    }

    static newRouter(): express.Router {
        return express.Router();
    }

    handleError(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        this.logService.error(err);

        res.status(500).json({
            error: 'Internal Server Error',
            code: 500,
        });
    }

    start(cb?: () => void): void {
        const port = this.configService.get('http.port');

        this.app.use('/', this.apiRouter);
        this.app.use(this.handleError);

        this.app.listen(
            port,
            cb
                ? cb
                : () =>
                      this.logService.info(
                          `Http server listening on port ${port}`,
                      ),
        );
    }
}

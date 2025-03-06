export = corsMiddleware;
/**
 * CORS middleware configuration
 */
declare const corsMiddleware: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
import cors = require("cors");
//# sourceMappingURL=cors.d.ts.map
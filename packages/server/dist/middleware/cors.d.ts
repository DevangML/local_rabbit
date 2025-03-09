export = corsMiddleware;
/**
 * CORS middleware configuration
 */
declare const corsMiddleware: (req: cors.CorsRequest, res: {
    statusCode?: number;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
import cors = require("cors");

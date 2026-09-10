import type { FeedbackSentiment } from '../types/database.types.js';
declare const router: import("express-serve-static-core").Router;
export declare function analyzeSentiment(text: string): {
    sentiment: FeedbackSentiment;
    score: number;
    positiveMatches: string[];
    negativeMatches: string[];
};
export default router;
//# sourceMappingURL=feedback.routes.d.ts.map
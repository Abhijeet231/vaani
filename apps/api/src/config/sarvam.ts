import { SarvamAIClient } from "sarvamai";
import { env } from "./env";


export const sarvamClient = new SarvamAIClient({
    apiSubscriptionKey: env.sarvamApi
});





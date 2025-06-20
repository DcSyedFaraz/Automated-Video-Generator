import { EventEmitter } from "events";

export const progressEmitter = new EventEmitter({ captureRejections: true });

import type { APIError, ObjectStorageBucket } from "@linode/api-v4";

// Transform keys for the dimension filter value transform function
export type TransformKey =
  | 'capitalize'
  | 'lowercase'
  | 'original'
  | 'uppercase';

export type TransformFunction = (value: string) => string;

export type TransformFunctionMap = Record<TransformKey, TransformFunction>;

// Obj storage bucket for cloud pulse
export interface CloudPulseObjectStorageBucket extends ObjectStorageBucket {
  error?: APIError[];
}

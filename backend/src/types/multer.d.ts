declare module 'multer' {
  import type { Request } from 'express';

  export interface File {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
  }

  export function diskStorage(options: {
    destination?: string | ((req: Request, file: File, cb: (err: Error | null, dest: string) => void) => void);
    filename?: (req: Request, file: File, cb: (err: Error | null, name: string) => void) => void;
  }): unknown;
}

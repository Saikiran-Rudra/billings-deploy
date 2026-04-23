import "express";
import { Request } from "express";
import { Multer, File as MulterFile } from "multer";
import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IUser;
      license?: any;
    }
  }
}

export interface File extends MulterFile {
  file?:MulterFile;
}


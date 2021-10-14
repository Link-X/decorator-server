declare module '@root/walk' {
  type cbType = (err: any, path: string, dirent: any) => void;
  export function walk(path: string, cb: cbType): any;
}

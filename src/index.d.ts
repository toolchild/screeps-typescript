// add objects to `global` here
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

interface Memory {
  uuid: number;
  log: any;
}

interface Creep {
  hi: number;
}

declare const __REVISION__: string;

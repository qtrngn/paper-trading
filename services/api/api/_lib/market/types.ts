export type AlpacaQuote = {
  ap: number;
  as: number;
  ax: string;
  bp: number;
  bs: number;
  bx: string;
  c: string[];
  t: string;
  z: string;
};

export type AlpacaTrade = {
    c: string[];
    p: number;
    s: number;
    t: string;
    x: string;
}

export type AlpacaBar = {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};
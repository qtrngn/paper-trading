export type Bar = {
    t : string;    // timestamp
    o: number;     // open
    h: number;     // high
    l: number;     // low
    c: number;     // close
    v: number;     // volume

}

export type Quote = {
    bp: number;     // bid price
    bs: number;     // bid size
    ap: number;     // ask price
    as: number;     // ask size  
    t: string;      // timestamp
}

export type SearchSuggestions = {
    symbol: string;
    name: string;
}
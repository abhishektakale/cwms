/** Neon pooler drops long interactive txs (P2028). Keep them short; rollup after commit. */
export const SHORT_TX = { maxWait: 10_000, timeout: 20_000 } as const;

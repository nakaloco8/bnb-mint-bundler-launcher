/**
 * THE CHAIN FILE. Everything the pages, cards and "?" texts need to know about the chain lives here: its name, its native
 * coin, how addresses look, where things are seen, the launch's fee and gas numbers, and which extras exist. Client-safe
 * (no node imports). The pages (app/*), the components and lib/help.tsx read this file and never say "SOL" or "pump.fun"
 * themselves, so another chain (the pons starter on Robinhood Chain, any EVM chain) is mostly a new copy of this file.
 * See PORTING.md for the rest (the API client, the launch executor, the signer).
 */
import type { Launchpad } from "./launchpad"

export type ChainConfig = {
  /** the chain, as people say it ("Solana", "Robinhood Chain") */
  name: string
  /** the native coin ("SOL", "ETH") */
  symbol: string
  /** the launchpad people know the coins from ("pump.fun", "pons") */
  launchpad: string
  /** the app's name in the header and the tab title ("pump.fun launcher") */
  appName: string
  /** which product of the Aeon Launcher suite this is (an id in lib/suite.ts): the suite bar marks it "you are here" */
  suiteId: string
  /** logos, as paths under public/ (public/logos/ holds Solana, Robinhood, Ethereum, BNB, Base, pump.fun, pons, …) */
  logo: string
  launchpadLogo: string
  /** the block explorer the address and transaction links open */
  explorer: { name: string; logo: string }
  /** the query / body field a coin travels in on this app's routes */
  coinParam: "mint" | "token"
  coinNoun: string
  keyNoun: string
  isAddress: (s: string) => boolean
  isCoin: (s: string) => boolean
  short: (s: string) => string
  /** a native amount for a table cell */
  fmt: (n: number | null | undefined) => string
  /** how many decimals a native amount shows in the cost panel (SOL 4, ETH 5: its amounts are ten times smaller) */
  decimals: number
  explorerAddress: (address: string) => string
  explorerTx: (sig: string) => string
  /** where a coin can be seen: the launchpad, terminals, the explorer; `icon` is the site's logo (public/logos/) */
  coinLinks: (coin: string) => Array<{ label: string; href: string; icon: string }>
  /** GMGN's embeddable candle chart (gmgn.cc is their widget host; gmgn.ai refuses to be framed), or null when the chain has none */
  chartUrl: (coin: string, theme: "dark" | "light") => string | null
  /** the launch-log stream of this app, and one entry of it read into a common shape (the pump.fun and pons routes differ) */
  launchLog: { path: (id: string) => string; read: (e: Record<string, unknown>) => { stage: string; message: string; done: boolean; error: boolean } }
  /** the "Set every amount to" pills, in the native coin */
  pills: string[]
  /** the default of the "Amount each" input (funding) and of a buy */
  defaultEach: string
  defaultBuy: string
  /** Launch page: the dev-buy chips, the buyer-amount chips and the volume maker's default budget, in the native coin */
  devBuyChips: string[]
  buyChips: string[]
  defaultDevBuy: string
  defaultVolumeBudget: string
  /**
   * What every buyer wallet gets on top of its buy. lib/core/launch.ts funds wallets with exactly these, and the cost
   * panel shows them, so they never disagree: the API fee on each buy (0.005 = 0.5 %) and a gas buffer per wallet.
   */
  apiFeeRate: number
  gasBuffer: number
  /**
   * What creating the coin costs the dev wallet on top of its buy: the rent of the coin's new accounts (mint, metadata,
   * curve, token accounts) and the network fees. Counted in the plan, the funding and the cost panel, so a fresh dev
   * wallet keeps its gas buffer for selling later.
   */
  createCost: number
  /** what createCost pays for, in a few words (the cost panel's note) */
  createCostNote: string
  /** The least a wallet must hold to send any trade (the network fee + the priority fee + what the chain keeps in an account). */
  minGas: number
  /** the most bundle buyers one launch can carry */
  maxBundle: number
  /** the tip that carries a same-block bundle ("Jito tip"), or null when the chain has none */
  tipName: string | null
  /** one line on how the first buyers land, for the "?" of First buyers */
  bundleHelp: string
  /** a vanity address suffix the launchpad uses ("pump"), or null */
  vanitySuffix: string | null
  /**
   * EVM chains only (absent on Solana): where the API serves the chain and what its launchpad needs. The EVM core
   * (lib/launch-api.ts, lib/core/*) reads this, so another EVM chain is mostly a new copy of this file.
   */
  evm?: {
    /** the API prefix: "/api/rh", "/api/bnb", "/api/elysium", "/api/base" */
    api: string
    chainId: number
    /** the API streams this chain's trades on a websocket (wss://…<api>/data); otherwise the app polls GET <api>/trades */
    ws: boolean
    /** the launchpad a create goes to (the API's `venue`) */
    createVenue?: string
    /** the launchpad lets the creator name wallets that skip its launch-window tax (pons, up to 31) */
    exemptList: boolean
    /** the smallest buy the launchpad takes, in the native coin */
    minBuy: number
    /** the coin's supply, for the market cap (price × supply) when the API does not say */
    totalSupply: number
    /** the chain's name on POST /api/transfer (exchange-routed funding) */
    transferChain: string
    /** seconds after the create before any other buy (a launchpad that taxes its first seconds, e.g. Clanker's 20 s anti-snipe) */
    launchQuietS?: number
  }
  /** the launchpads a launch can go to (lib/launchpad.ts); the first is the default */
  launchpads: Launchpad[]
  features: {
    /** Solana: empty token accounts hold rent that "Close empty token accounts" recovers */
    tokenAccounts: boolean
    /** the launchpad pays the creator a share of the trading fees */
    creatorFees: boolean
    /** pump.fun Mayhem coins: a buy past the remaining supply needs `partial fill` */
    mayhem: boolean
    /** bundle buyers can land in the same block as the create ("When: Same block / Right after") */
    sameBlock: boolean
    /** coins can be paired with something other than the native coin (USDC, stocks, …) */
    pairs: boolean
    /** the creator fee can go to the holders instead */
    holderRewards: boolean
  }
}

const ADDR = /^0x[0-9a-fA-F]{40}$/
const BSCSCAN = "https://bscscan.com"

export const chain: ChainConfig = {
  name: "BNB Chain",
  symbol: "BNB",
  launchpad: "Flap",
  appName: "BNB launcher",
  suiteId: "bnb",
  logo: "/logos/chains/bnb.svg",
  launchpadLogo: "/logos/chains/bnb.svg",
  explorer: { name: "BscScan", logo: "/logos/terminals/explorer.svg" },
  coinParam: "token",
  coinNoun: "token address",
  keyNoun: "0x private key",
  isAddress: (s) => ADDR.test(s.trim()),
  isCoin: (s) => ADDR.test(s.trim()),
  short: (s) => (s.length > 13 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s),
  fmt: (n) => (n === null || n === undefined ? "–" : Number(n).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 5 })),
  decimals: 5,
  explorerAddress: (a) => `${BSCSCAN}/address/${a}`,
  explorerTx: (hash) => `${BSCSCAN}/tx/${hash}`,
  coinLinks: (token) => [
    { label: "Flap", href: `https://flap.sh/token/${token}`, icon: "/logos/launchpads/flap.png" },
    { label: "GMGN", href: `https://gmgn.ai/bsc/token/${token}`, icon: "/logos/terminals/gmgn.png" },
    { label: "DEX Screener", href: `https://dexscreener.com/bsc/${token}`, icon: "/logos/terminals/dexscreener.png" },
    { label: "BscScan", href: `${BSCSCAN}/token/${token}`, icon: "/logos/terminals/explorer.svg" },
  ],
  chartUrl: (token, theme) => `https://www.gmgn.cc/kline/bsc/${token}?theme=${theme}&interval=1S`,
  launchLog: {
    path: (id) => `/api/launch/${id}/events`,
    read: (e) => ({ stage: String(e.stage ?? ""), message: String(e.message ?? ""), done: e.stage === "done" || e.stage === "error", error: e.stage === "error" }),
  },
  pills: ["0.005", "0.01", "0.05", "0.1", "0.5"],
  defaultEach: "0.01",
  defaultBuy: "0.01",
  devBuyChips: ["0.01", "0.05", "0.1", "0.25", "0.5"],
  buyChips: ["0.005", "0.01", "0.05", "0.1", "0.25"],
  defaultDevBuy: "0.05",
  defaultVolumeBudget: "0.05",
  apiFeeRate: 0.005,
  // BSC gas is cheap (a swap ~0.00002 BNB today): the buffer covers the approve + sell + fee transfers with room to spare
  gasBuffer: 0.0005,
  // Flap's launch fee is 0 today; the create (a deploy + the dev buy) costs ~0.0005 BNB of gas
  createCost: 0.001,
  createCostNote: "Flap's launch fee + gas",
  minGas: 0.0002,
  maxBundle: 16,
  tipName: null,
  bundleHelp: "BNB Chain has no Jito: the first buys all go out the moment the create confirms, usually landing in the next block (a block is ~0.5 s). Flap coins are tax tokens: every buy and sell pays the coin's tax, and your share comes back as creator fees.",
  vanitySuffix: null,
  evm: { api: "/api/bnb", chainId: 56, ws: false, createVenue: "flap", exemptList: false, minBuy: 0.0001, totalSupply: 1_000_000_000, transferChain: "bnb" },
  // creator fees: the Flap tax processor pays the creator share; collectCreatorFee builds its dispatch()
  launchpads: [
    { id: "flap", name: "Flap", logo: "/logos/launchpads/flap.png", site: "https://flap.sh", note: "bonding curve → PancakeSwap, tax token (…7777): every buy and sell pays the tax, your share comes back as creator fees", body: { venue: "flap" }, coinUrl: (t) => `https://flap.sh/token/${t}`,
      settings: [
        { field: "tax.buyTaxBps", label: "Buy tax", kind: "number", default: "5", unit: "%", min: 1, max: 10, scale: 100, help: "1–10 %, fixed forever" },
        { field: "tax.sellTaxBps", label: "Sell tax", kind: "number", default: "5", unit: "%", min: 1, max: 10, scale: 100, help: "1–10 %, fixed forever" },
      ] },
    { id: "four-meme", name: "four.meme", logo: "/logos/launchpads/fourmeme.png", site: "https://four.meme", note: "bonding curve → PancakeSwap at 18 BNB", body: { venue: "four-meme" }, coinUrl: (t) => `https://four.meme/token/${t}`, creatorFees: false, disabled: "four.meme blocks the region our API runs in (Cloudflare 403 on its create API); trading four.meme coins works", feeNote: "four.meme pays the tax recipient on every trade: nothing to claim" },
  ],
  features: { tokenAccounts: false, creatorFees: true, mayhem: false, sameBlock: false, pairs: false, holderRewards: false },
}

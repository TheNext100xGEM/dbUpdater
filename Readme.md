# DB FETCHERS

Fetchers to find new launches and to continuously update them in a db.

```
interface Gempad {
  _id: ObjectId;
  presaleAddress: string;
  presaleLink: string;
  startTime: number;
  endTime: number;
  createdAt: number;
  softCap: number;
  hardCap: number;
  saleToken: string;
  telegramLink: string;
  twitterLink: string;
  status: number;
  tier: string;
  saleTokenLink: string;
  tokenSymbol: string;
  tokenName: string;
  chain: number;
  kyc: boolean;
  audit: boolean;
  poolType: string;
  websiteLink: string;
  submittedDescription: string;
  githubLink: string;
  launchpad: string;
  source: string;
  auditLink: string;
  baseSymbol: string;
  telegramMemberCount: number | null;
  telegramOnlineCount: number | null;
  uniqueKey: string;
}
```

```
interface Pinksale {
  _id: ObjectId;
  presaleAddress: string;
  tokenName: string;
  tokenSymbol: string;
  baseSymbol: string;
  saleToken: string;
  audit: boolean;
  auditLink: string | undefined;
  kyc: boolean;
  safu: boolean;
  softCap: number;
  hardCap: number | null;
  amountRaised: number;
  telegramLink: string | undefined;
  twitterLink: string | undefined;
  websiteLink: string | undefined;
  submittedDescription: string | undefined;
  githubLink: string | undefined;
  redditLink: string | undefined;
  startTime: number;
  endTime: number;
  createdAt: number;
  poolType: string;
  chain: number;
  status: number;
  telegramMemberCount: number | null;
  telegramOnlineCount: number | null;
  launchpad: string;
  source: string;
  uniqueKey: string;
}
```
```
interface Cryptorank {
  _id: ObjectId;
  uniqueKey: string;
  tokenName: string;
  tokenSymbol: string;
  websiteLink: string;
  twitterLink: string;
  whitepaperLink: string | null;
  telegramLink: string | null;
  githubLink: string | null;
  gitbookLink: string | null;
  submittedDescription: string;
  status: number;
  initialMarketCap: number;
  athMarketCap: number | null;
  logoLink: string | null;
  source: string;
}
```
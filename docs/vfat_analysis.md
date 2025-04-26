
# VFAT Position Analysis: Pools, Impermanent Loss, Profitability, Strategies

---

## 1. Pools Analyzed

Analysis was conducted across VFAT's top pools:

- **wS/USDC.e** — 14,076 positions
- **wS/stS** — 3,074 positions
- **wS/WETH** — 2,820 positions
- **SHADOW/stS** — 2,240 positions
- **USDC.e/WETH** — 879 positions
- **USDC.e/USDT** — 607 positions
- **USDC.e/scUSD** — 211 positions
- **WBTC/WETH** — 137 positions

These are the most active pools by number of positions on VFAT.

---

## 2. Impermanent Loss: How Dangerous It Is

- In 50% of all positions, impermanent loss = 0%.
- The average impermanent loss across the dataset ≈ 15.6% (distorted by rare catastrophic cases).
- Main risks observed in:
  - **wS/stS** — many cases of 100% impermanent loss.
  - **USDC.e/WETH** — several critical cases.
  - Partially — **wS/USDC.e**.
- Reason: auto-rebalance strategies on very short timeframes (<2 hours).

Other pools generally show stable behavior.

---

## 3. Most Profitable and Stable Pools

Average **APR (30d)** by pool:

- **SHADOW/stS** — 19.4% (high APR but volatile)
- **wS/WETH** — 5.92% (stable and profitable)
- **USDC.e/WETH** — 5.69% (balanced profitability)
- **WBTC/WETH** — 5.66% (solid performance)
- **USDC.e/scUSD** — 2.94% (stable, stablecoin pair)
- **wS/stS** — 0.66% (low APR, high impermanent loss risk)
- **USDC.e/USDT** — 0.26% (very low profitability)
- **wS/USDC.e** — 0% (no meaningful profitability recorded)

⚡ **Most stable pools:** **wS/WETH**, **USDC.e/WETH**, **WBTC/WETH**.

---

## 4. Auto-Rebalance vs Non-Rebalance

|                               | With Auto-Rebalance | Without Auto-Rebalance |
|-------------------------------|---------------------|-------------------------|
| Number of Positions           | 19,628               | 4,416                   |
| Average APR (30d)              | 2.07%                | 6.36%                   |
| Average Impermanent Loss (%)   | 0.16%                | 0.14%                   |

**Conclusion:**  
Across all pools, **positions without auto-rebalance achieve 3x higher APR**.

---

## 5. Best Strategy Settings

For auto-rebalance strategies:

- Best cutoff: **~887272**
- Best buffer: **50–100 ticks**

These settings provide the best profitability.  
Too large or negative buffers significantly reduce performance.

---

## 6. How VFAT Positions Are Configured

Grouped all VFAT position-settings by **cutoff** and **buffer**:

- Most strategies **monitor the entire Uniswap price range** without restrictions (`cutoff ≈ 887272`).
- Very often, **zero buffer** and **auto-rebalance** are enabled.

Meaning:
- The system **reacts instantly** when the price moves out of range.
- This leads to frequent rebalances and higher risks of impermanent loss during sudden market moves.

---

## Final Summary

- Most stable pools: **wS/WETH**, **USDC.e/WETH**, **WBTC/WETH**.
- Highest impermanent loss risks: **wS/stS**, partly **USDC.e/WETH**.
- **Non-auto-rebalance** strategies are significantly more profitable.
- Best auto-rebalance settings: **cutoff ~887272**, **buffer 50–100**.
- Current VFAT strategies are very sensitive to price movements due to lack of buffer.

Fine-tuning strategy settings can greatly improve overall profitability and stability.

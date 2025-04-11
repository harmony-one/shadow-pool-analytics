# Shadow Monitoring

A project for monitoring and analyzing liquidity positions in Uniswap V3 pools.

## Features

- Liquidity position analysis
- Impermanent loss calculation
- APR/APY calculation
- Position efficiency analysis
- Wallet-based grouping
- Statistics export in CSV and JSON formats

## Key Metrics

- **Impermanent Loss**: Loss calculation considering:
  - Initial and final prices
  - Position price range
  - Time interval
  - Real prices from swap history

- **APR/APY**: Annual yield calculation including:
  - Collected fees
  - Rewards
  - Position duration

- **Position Efficiency**:
  - Time in range percentage
  - Number of swaps in range
  - Average deposit amount
  - Total profit in USD

## Usage

1. Install dependencies:
```bash
npm install
```

2. Run analysis:
```bash
npm run start
```

## Project Structure

- `src/rewards-dist/` - Core code for analysis and statistics generation
- `src/loaders/` - Data loaders from various sources
- `export/` - Directory for analysis results export

## Data Formats

### Positions
- Position ID
- Owner
- Price range (tickLower, tickUpper)
- Deposit amounts (token0, token1)
- Collected fees
- Timestamps (open/close)

### Swaps
- Timestamp
- Price
- Token volumes
- Fees

### Rewards
- Position ID
- Reward token
- Reward amount
- Timestamp

## Export

Analysis results are exported to:
- CSV files for spreadsheet analysis
- JSON files for further processing

## Requirements

- Node.js
- npm
- Access to RPC node (configured in settings)

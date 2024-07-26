# WalletPage Component

## Issues Identified

### 1. Interface Definition

```typescript
❌ Bad
interface WalletBalance {
    currency: string;
    amount: number;
}
interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}
...
const balancePriority = getPriority(balance.blockchain);
```

### 2. Missing Interface Extension

```typescript
❌ Bad
interface Props extends BoxProps {
    // Missing
}
const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
```

### 3. Undeclared Variable

```typescript
❌ Bad
const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
    const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) { ... }  // undeclared variable
    });
}, [balances, prices]);
...
return (
  <WalletRow
    className={classes.row} // undeclared variable
    key={index}
    amount={balance.amount}
    usdValue={usdValue}
    formattedAmount={balance.formatted}
  />
)
```

### 4. Unused Variable

```
  const { children, ...rest, classes } = props; // unused children
```

### 5. Unused Dependency

```typescript
❌ Bad
const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  if (lhsPriority > -99) {
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
}, [balances, prices]); // unused dependency
```

### 6. Data Structure Inconsistency

```typescript
❌ Bad
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

// sortedBalances is typed as WalletBalance[]. It should be typed as FormattedWalletBalance[]
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
})
```

### 7. Missing Variable Check

```typescript
const usdValue = prices[balance.currency] * balance.amount
```

# Revised Code

```typescript
interface WalletBalance {
	currency: string
	amount: number
	formatted?: string
	blockchain: 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo'
}

interface Props extends BoxProps {
	classes: {
		row: string
		component: string
	}
}

const WalletPage: React.FC<Props> = (props: Props) => {
	const { children, ...rest, classes } = props
	const balances = useWalletBalances()
	const prices = usePrices()

	const getPriority = (blockchain: WalletBalance['blockchain']): number => {
		switch (blockchain) {
			case 'Osmosis':
				return 100
			case 'Ethereum':
				return 50
			case 'Arbitrum':
				return 30
			case 'Zilliqa':
				return 20
			case 'Neo':
				return 20
			default:
				return -99
		}
	}

	const sortedBalances = useMemo(() => {
		return balances
			.filter((balance: WalletBalance) => {
				const balancePriority = getPriority(balance.blockchain)
				if (balancePriority > -99) {
					if (balance.amount <= 0) {
						return true
					}
				}
				return false
			})
			.sort((lhs: WalletBalance, rhs: WalletBalance) => {
				const leftPriority = getPriority(lhs.blockchain)
				const rightPriority = getPriority(rhs.blockchain)
				if (leftPriority > rightPriority) {
					return -1
				} else if (rightPriority > leftPriority) {
					return 1
				}
			})
	}, [balances])

	const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
		return {
			...balance,
			formatted: balance.amount.toFixed()
		}
	})

	const rows = formattedBalances.map(
		(balance: WalletBalance, index: number) => {
			const usdValue = (prices[balance.currency] ?? '0') * balance.amount
			return (
				<WalletRow
					className={classes.row}
					key={index}
					amount={balance.amount}
					usdValue={usdValue}
					formattedAmount={balance.formatted}
				/>
			)
		}
	)

	return (
		<div {...rest}>
			{rows}
			{children}
		</div>
	)
}
```

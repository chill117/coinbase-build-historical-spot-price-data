# coinbase-build-historical-spot-price-data

Uses the [get-spot-price API end-point](https://developers.coinbase.com/api/v2#get-spot-price) of Coinbase to build a CSV file of daily spot prices.

This repository already includes a CSV file for the BTC-USD pair starting from January 2nd, 2014.

Example usage:
```bash
node index.js "2018-04-25" "BTC-USD"
```

Outputs data to a new file named `data.csv` in the current working directory. Example output:
```csv
2018-04-25,9209.28
2018-04-26,8881.02
2018-04-27,9214.40
2018-04-28,9233.92
2018-04-29,9344.26
2018-04-30,9293.89
```

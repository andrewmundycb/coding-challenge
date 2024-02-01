import { useState } from "react";
import apiData from "../../api-data.json";
import "./ActivityStats.scss";

type ActivityData = {
  type: string;
  count: number;
  fiat_currency: string;
  amount_fiat: string;
  crypto_currency: string;
  amount_crypto: number;
};

type CombinedData = {
  type: string;
  count: number;
  fiat_currency: string;
  amount_fiat: number;
  crypto_currencies: Set<string>;
  amount_crypto: number;
};

const ActivityRow = ({ rowData }: { rowData: CombinedData }) => {
  const { type, count, fiat_currency, amount_fiat, crypto_currencies } =
    rowData;
  return (
    <div className="activity__summary__row" role="listitem">
      <div>Total {type}s</div>
      <div>{formatCurrency(amount_fiat, fiat_currency)}</div>
      <div>
        {crypto_currencies.size === 1
          ? `${Array.from(crypto_currencies)[0]}`
          : `${Array.from(crypto_currencies)[0]} + ${
              crypto_currencies.size - 1
            } others`}
      </div>
      <div>
        {count} Transaction{count > 1 ? "s" : ""}
      </div>
    </div>
  );
};

const ActivityStats = () => {
  const [activityData] = useState<Map<string, CombinedData>>(() => {
    return combineDataRows(apiData.activity_summary);
  });

  console.log(activityData);

  return (
    <>
      <div className="activity__header">
        <h2>Transactions</h2>
        <button type="button" aria-label="Opens full report in a modal">
          View Report
        </button>
      </div>
      {activityData ? (
        <div className="activity__summary" role="list">
          {Array.from(activityData.entries()).map(([type, info]) => {
            return <ActivityRow key={type} rowData={info} />;
          })}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

const formatCurrency = (amount: number | string, currency: string) => {
  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });

  return currencyFormat.format(Number(amount));
};

const combineDataRows = (data: ActivityData[]): Map<string, CombinedData> => {
  const combinedData = new Map();

  data.forEach(
    ({ type, count, amount_fiat, fiat_currency, crypto_currency }) => {
      if (combinedData.has(type)) {
        // Add to existing if already exists
        const prevData = combinedData.get(type);

        const newCombined = {
          ...prevData,
          count: prevData.count + count,
          amount_fiat: prevData.amount_fiat + Number(amount_fiat),
          crypto_currencies: prevData.crypto_currencies.has(crypto_currency)
            ? prevData.crypto_currencies
            : prevData.crypto_currencies.add(crypto_currency),
        };
        combinedData.set(type, newCombined);
      } else {
        combinedData.set(type, {
          count,
          amount_fiat: Number(amount_fiat),
          fiat_currency,
          crypto_currencies: new Set([crypto_currency]),
          type,
        });
      }
    }
  );

  console.log(combinedData);
  return combinedData;
};

export default ActivityStats;

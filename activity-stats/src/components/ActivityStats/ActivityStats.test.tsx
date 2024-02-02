import React from "react";
import { render, screen } from "@testing-library/react";
import ActivityStats, {
  ActivityRow,
  formatCurrency,
  combineDataRows,
} from "./ActivityStats";

describe("ActivityRow", () => {
  const mockData = {
    type: "Buy",
    count: 2,
    fiat_currency: "USD",
    amount_fiat: 200.0,
    crypto_currencies: new Set(["BTC"]),
    amount_crypto: 0.005,
  };

  it("should render an Activity Row", () => {
    render(<ActivityRow rowData={mockData} />);
    expect(screen.getByRole("listitem")).toBeInTheDocument();
    expect(screen.getByText(/total buys/i)).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText(/2 transactions/i)).toBeInTheDocument();
  });
});

describe("formatCurrency", () => {
  it("correctly formats USD currency", () => {
    const result = formatCurrency(1234.56, "USD");
    expect(result).toBe("$1,234.56");
  });

  it("correctly formats EUR Currency", () => {
    const result = formatCurrency(1234.56, "EUR");
    expect(result).toBe("€1,234.56");
  });
});

describe("combineDataRows", () => {
  it("correctly combines rows of data", () => {
    const mockData = [
      {
        type: "Buy",
        count: 1,
        amount_fiat: "100",
        fiat_currency: "USD",
        crypto_currency: "BTC",
        amount_crypto: 0.002,
      },
      {
        type: "Buy",
        count: 2,
        amount_fiat: "200",
        fiat_currency: "USD",
        crypto_currency: "ETH",
        amount_crypto: 0.1,
      },
      {
        type: "Sell",
        count: 1,
        amount_fiat: "300",
        fiat_currency: "USD",
        crypto_currency: "BTC",
        amount_crypto: 0.005,
      },
    ];

    const expected = new Map([
      [
        "Buy",
        {
          count: 3,
          amount_fiat: 300, // Note: Assumes the function converts to number correctly
          fiat_currency: "USD",
          type: "Buy",
          crypto_currencies: new Set(["BTC", "ETH"]),
        },
      ],
      [
        "Sell",
        {
          count: 1,
          amount_fiat: 300,
          fiat_currency: "USD",
          type: "Sell",
          crypto_currencies: new Set(["BTC"]),
        },
      ],
    ]);

    const result = combineDataRows(mockData);

    // Compare size first to quickly catch any large discrepancies
    expect(result.size).toBe(expected.size);

    // Detailed check for equality
    expected.forEach((value, key) => {
      expect(result.get(key)).toEqual(value);
    });
  });
});

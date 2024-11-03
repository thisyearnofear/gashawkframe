import { Button, Frog, TextInput } from "frog";
import { neynar } from "frog/hubs";
import axios from "axios";

// Interfaces
interface Transaction {
  gasUsed: string;
  gasPrice: string;
}

// Constants
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
const EXAMPLE_ADDRESS = "0xD7029BDEa1c17493893AAfE29AAD69EF892B8ff2";

// ENS Resolution Function
const resolveENSNameFallback = async (input: string): Promise<string> => {
  // If input is already an Ethereum address, return it
  if (input.match(/^0x[a-fA-F0-9]{40}$/i)) {
    return input;
  }

  // If input ends with .eth, try to resolve it
  if (input.endsWith(".eth")) {
    try {
      const response = await fetch(`https://api.ensdata.net/${input}`);
      if (!response.ok) {
        throw new Error(`ENS resolution failed: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.address) {
        throw new Error("No address found for this ENS name");
      }
      return data.address;
    } catch (error) {
      console.error(`Error resolving ENS name ${input}:`, error);
      throw new Error(`Could not resolve ENS name: ${input}`);
    }
  }

  throw new Error(
    "Invalid input: Please enter a valid Ethereum address or ENS name"
  );
};

// Initialize Frog app
export const app = new Frog({
  basePath: "/api",
  title: "GasHawk Savings Calculator",
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY || "" }),
  secret: process.env.FROG_SECRET || "",
  browserLocation: "https://app.gashawk.io",
  verify: true,
});

// Main frame logic
app.frame("/", async (c) => {
  const { buttonValue, inputText, status } = c;

  // Initial welcome screen
  if (status === "initial") {
    return c.res({
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a1a",
            width: "100%",
            height: "100%",
            padding: "40px",
            color: "white",
            fontFamily: "Inter",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            GasHawk 🦅 Keep Your ETH
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a0a0a0",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            Slash Up to 95% Gas Fee Costs Optimizing Your Transactions
          </div>
        </div>
      ),
      intents: [
        <Button value="learn">Learn How It Works</Button>,
        <Button value="calculate">Calculate Your Savings</Button>,
      ],
    });
  }

  // Calculate flow - Input screen
  if (buttonValue === "calculate") {
    return c.res({
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a1a",
            width: "100%",
            height: "100%",
            padding: "40px",
            color: "white",
            fontFamily: "Inter",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Enter Your Address 🔍
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a0a0a0",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            ETH address or ENS name
          </div>
        </div>
      ),
      intents: [
        <TextInput placeholder="vitalik.eth or 0x..." />,
        <Button value="check">Check Savings</Button>,
        <Button value="example">Use Example Address</Button>,
      ],
    });
  }

  // Handle address resolution
  let resolvedAddress: string | null = null;

  if (buttonValue === "example") {
    resolvedAddress = EXAMPLE_ADDRESS;
  } else if (buttonValue === "check" && inputText) {
    try {
      resolvedAddress = await resolveENSNameFallback(inputText);
    } catch (error) {
      return c.res({
        image: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1a1a1a",
              width: "100%",
              height: "100%",
              padding: "40px",
              color: "white",
              fontFamily: "Inter",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                color: "#ef4444",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Invalid Address or ENS
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#a0a0a0",
                textAlign: "center",
              }}
            >
              {error instanceof Error
                ? error.message
                : "Please enter a valid Ethereum address or ENS name"}
            </div>
          </div>
        ),
        intents: [<Button.Reset>Try Again</Button.Reset>],
      });
    }
  }

  // Calculate savings if we have a resolved address
  if (
    (buttonValue === "check" || buttonValue === "example") &&
    resolvedAddress
  ) {
    try {
      const txResponse = await axios.get(ETHERSCAN_API_URL, {
        params: {
          module: "account",
          action: "txlist",
          address: resolvedAddress.toLowerCase(),
          startblock: 12965000,
          endblock: "latest",
          sort: "desc",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      const transactions = txResponse.data.result;
      const totalGasSpent = transactions.reduce(
        (acc: number, tx: Transaction) => {
          const gasUsed = parseFloat(tx.gasUsed);
          const gasPrice = parseFloat(tx.gasPrice);
          return acc + (gasUsed * gasPrice) / 1e18;
        },
        0
      );

      const ethPriceResponse = await axios.get(
        `${COINGECKO_API_URL}/simple/price`,
        {
          params: {
            ids: "ethereum",
            vs_currencies: "usd",
          },
        }
      );

      const ethPrice = ethPriceResponse.data.ethereum.usd;
      const estimatedSavings = totalGasSpent * 0.318;
      const savingsUSD = (estimatedSavings * ethPrice).toFixed(2);

      return c.res({
        image: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1a1a1a",
              width: "100%",
              height: "100%",
              padding: "40px",
              color: "white",
              fontFamily: "Inter",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                color: "#666666",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {inputText?.endsWith(".eth")
                ? `${inputText} (${resolvedAddress})`
                : resolvedAddress}
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#a0a0a0",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {`You spent ${totalGasSpent.toFixed(4)} ETH in ${
                transactions.length
              } transactions`}
            </div>
            <div
              style={{
                fontSize: "36px",
                color: "#22c55e",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {`You could have saved ${estimatedSavings.toFixed(
                4
              )} ETH with GasHawk`}
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#a0a0a0",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {`That's US$${savingsUSD} at current ETH price ($${ethPrice.toFixed(
                2
              )})`}
            </div>
            <div
              style={{
                fontSize: "16px",
                color: "#666666",
                textAlign: "center",
                maxWidth: "80%",
              }}
            >
              Results limited to last 10k TX since EIP-1559. Savings based on
              GasHawk's 31.8% average over past 30 days.
            </div>
          </div>
        ),
        intents: [
          <Button.Link href={`https://etherscan.io/address/${resolvedAddress}`}>
            View Transactions
          </Button.Link>,
          <Button.Link href="https://app.gashawk.io/#/setup?refCode=JQW-AWY">
            Try GasHawk
          </Button.Link>,
          <Button.Reset>Check Another Address</Button.Reset>,
        ],
      });
    } catch (error) {
      console.error("API Error:", error);
      return c.res({
        image: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1a1a1a",
              width: "100%",
              height: "100%",
              padding: "40px",
              color: "white",
              fontFamily: "Inter",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                color: "#ef4444",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Error calculating savings
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#a0a0a0",
                textAlign: "center",
              }}
            >
              Please try again with a valid address
            </div>
          </div>
        ),
        intents: [<Button.Reset>Try Again</Button.Reset>],
      });
    }
  }

  // Default fallback
  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a1a",
          width: "100%",
          height: "100%",
          padding: "40px",
          color: "white",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{ fontSize: "36px", color: "#ef4444", textAlign: "center" }}
        >
          Please enter a valid address
        </div>
      </div>
    ),
    intents: [<Button.Reset>Try Again</Button.Reset>],
  });
});

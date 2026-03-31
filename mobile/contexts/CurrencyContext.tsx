import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";

// ---------------- CONFIG ----------------
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

// ---------------- TYPES ----------------
type Rates = Record<string, number>;

interface CurrencyContextType {
  currency: string;
  changeCurrency: (newCurrency: string) => Promise<void>;
  rates: Rates;
  convertAmount: (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => number;
}

interface CurrencyProviderProps {
  children: ReactNode;
}

// ---------------- CONTEXT ----------------
export const CurrencyContext = createContext<
  CurrencyContextType | undefined
>(undefined);

// ---------------- PROVIDER ----------------
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  children,
}) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("CurrencyProvider must be used inside AuthProvider");
  }

  const { user } = auth;

  const [currency, setCurrency] = useState<string>("GBP");
  const [rates, setRates] = useState<Rates>({ GBP: 1 });

  // 🔹 Get token from storage
  const getToken = async () => {
    return await AsyncStorage.getItem("access_token");
  };

  // ---------------- FETCH RATES ----------------
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get(
          "https://open.er-api.com/v6/latest/GBP"
        );
        setRates(res.data.rates);
      } catch (err) {
        console.error("Failed to fetch currency rates:", err);
      }
    };

    fetchRates();
  }, []);

  // ---------------- FETCH USER CURRENCY ----------------
  useEffect(() => {
    const fetchCurrency = async () => {
      if (!user) return;

      try {
        const storedCurrency = await AsyncStorage.getItem(`@currency_${user.id}`);
        if (storedCurrency) {
          setCurrency(storedCurrency);
        } else {
          setCurrency("GBP");
        }
      } catch (err) {
        console.error("Failed to fetch currency from storage:", err);
      }
    };

    fetchCurrency();
  }, [user]);

  // ---------------- CHANGE CURRENCY ----------------
  const changeCurrency = async (newCurrency: string) => {
    setCurrency(newCurrency);

    if (!user) return;

    try {
      await AsyncStorage.setItem(`@currency_${user.id}`, newCurrency);
    } catch (err) {
      console.error("Failed to save currency locally:", err);
    }
  };


  const convertAmount = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
) => {
  if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
    return amount;
  }

  const baseAmount = amount / rates[fromCurrency];
  return baseAmount * rates[toCurrency];
};

  // ---------------- PROVIDER ----------------
  return (
    <CurrencyContext.Provider
      value={{ currency, changeCurrency, rates, convertAmount }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};


export const useCurrency = () => {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }

  return context;
};
// components/CurrencyConverter.jsx
import React, { useState, useContext } from 'react';
import { FiGlobe, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import { CurrencyContext } from '../../context/CurrencyContext';

const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  RUB: '₽',
  TRY: '₺',
  BRL: 'R$',
  MXN: '$',
  AED: 'د.إ',
  SAR: 'ر.س',
  ZAR: 'R'
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  KRW: 'South Korean Won',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  ZAR: 'South African Rand'
};

const POPULAR_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'CAD', 'AUD', 'INR'];

const CurrencyConverter = ({ 
  selectedCurrency, 
  onCurrencyChange, 
  totalBudget,
  rates,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);
  
  // Calculate converted total budget
  const calculateConvertedTotal = () => {
    if (!totalBudget || !rates || !selectedCurrency) return 0;
    
    let totalInSelectedCurrency = 0;
    
    Object.entries(totalBudget).forEach(([currencyCode, amount]) => {
      if (rates[currencyCode] && rates[selectedCurrency]) {
        const amountInGBP = amount / rates[currencyCode];
        const convertedAmount = amountInGBP * rates[selectedCurrency];
        totalInSelectedCurrency += convertedAmount;
      }
    });
    
    return totalInSelectedCurrency;
  };
  
  const convertedTotal = calculateConvertedTotal();
  
  // Filter currencies based on search
  const filteredCurrencies = Object.keys(CURRENCY_SYMBOLS).filter(currencyCode => {
    if (!searchTerm) return true;
    return (
      currencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CURRENCY_NAMES[currencyCode]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const formatCurrency = (amount, currencyCode) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
    
    return `${symbol}${formattedAmount}`;
  };

  if (compact) {
    return (
      <div className="brand-currency-converter-compact">
        <button 
          className="brand-currency-toggle-compact"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FiGlobe size={16} />
          <span className="brand-currency-symbol">
            {CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency}
          </span>
          <span className="brand-currency-code">{selectedCurrency}</span>
          <FiChevronDown size={14} className={isOpen ? 'brand-rotate-180' : ''} />
        </button>
        
        {isOpen && (
          <div className="brand-currency-dropdown brand-drop-shadow">
            <div className="brand-currency-search">
              <FiSearch size={14} />
              <input
                type="text"
                placeholder="Search currency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="brand-currency-search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="brand-clear-search"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            
            {/* Popular currencies */}
            <div className="brand-currency-section">
              <div className="brand-currency-section-title">Popular</div>
              <div className="brand-currency-grid">
                {POPULAR_CURRENCIES.map(currencyCode => (
                  <button
                    key={currencyCode}
                    className={`brand-currency-option ${selectedCurrency === currencyCode ? 'brand-currency-selected' : ''}`}
                    onClick={() => {
                      onCurrencyChange(currencyCode);
                      setIsOpen(false);
                    }}
                  >
                    <span className="brand-currency-option-symbol">
                      {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                    </span>
                    <span className="brand-currency-option-code">{currencyCode}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* All currencies */}
            <div className="brand-currency-section">
              <div className="brand-currency-section-title">
                All Currencies
                <button 
                  className="brand-show-all-btn"
                  onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                >
                  {showAllCurrencies ? 'Show Less' : 'Show All'}
                </button>
              </div>
              <div className="brand-currency-list">
                {(showAllCurrencies ? filteredCurrencies : filteredCurrencies.slice(0, 10)).map(currencyCode => (
                  <button
                    key={currencyCode}
                    className={`brand-currency-option ${selectedCurrency === currencyCode ? 'brand-currency-selected' : ''}`}
                    onClick={() => {
                      onCurrencyChange(currencyCode);
                      setIsOpen(false);
                    }}
                  >
                    <span className="brand-currency-option-symbol">
                      {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                    </span>
                    <div className="brand-currency-option-details">
                      <span className="brand-currency-option-code">{currencyCode}</span>
                      <span className="brand-currency-option-name">
                        {CURRENCY_NAMES[currencyCode] || currencyCode}
                      </span>
                    </div>
                    {rates && rates[currencyCode] && (
                      <span className="brand-currency-rate">
                        1 GBP = {(rates[currencyCode]).toFixed(2)} {currencyCode}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="brand-currency-converter">
      <div className="brand-currency-header">
        <div className="brand-currency-display">
          <div className="brand-currency-label">
            <FiGlobe size={14} />
            <span>Display Currency:</span>
          </div>
          <div className="brand-currency-selector">
            <button 
              className="brand-currency-toggle"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="brand-currency-symbol">
                {CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency}
              </span>
              <span className="brand-currency-code">{selectedCurrency}</span>
              <FiChevronDown size={16} className={isOpen ? 'brand-rotate-180' : ''} />
            </button>
            
            {isOpen && (
              <div className="brand-currency-dropdown brand-drop-shadow">
                <div className="brand-currency-search">
                  <FiSearch size={14} />
                  <input
                    type="text"
                    placeholder="Search currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="brand-currency-search-input"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="brand-clear-search"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
                
                {/* Popular currencies */}
                <div className="brand-currency-section">
                  <div className="brand-currency-section-title">Popular</div>
                  <div className="brand-currency-grid">
                    {POPULAR_CURRENCIES.map(currencyCode => (
                      <button
                        key={currencyCode}
                        className={`brand-currency-option ${selectedCurrency === currencyCode ? 'brand-currency-selected' : ''}`}
                        onClick={() => {
                          onCurrencyChange(currencyCode);
                          setIsOpen(false);
                        }}
                      >
                        <span className="brand-currency-option-symbol">
                          {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                        </span>
                        <span className="brand-currency-option-code">{currencyCode}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* All currencies */}
                <div className="brand-currency-section">
                  <div className="brand-currency-section-title">
                    All Currencies
                    <button 
                      className="brand-show-all-btn"
                      onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                    >
                      {showAllCurrencies ? 'Show Less' : 'Show All'}
                    </button>
                  </div>
                  <div className="brand-currency-list">
                    {(showAllCurrencies ? filteredCurrencies : filteredCurrencies.slice(0, 10)).map(currencyCode => (
                      <button
                        key={currencyCode}
                        className={`brand-currency-option ${selectedCurrency === currencyCode ? 'brand-currency-selected' : ''}`}
                        onClick={() => {
                          onCurrencyChange(currencyCode);
                          setIsOpen(false);
                        }}
                      >
                        <span className="brand-currency-option-symbol">
                          {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                        </span>
                        <div className="brand-currency-option-details">
                          <span className="brand-currency-option-code">{currencyCode}</span>
                          <span className="brand-currency-option-name">
                            {CURRENCY_NAMES[currencyCode] || currencyCode}
                          </span>
                        </div>
                        {rates && rates[currencyCode] && (
                          <span className="brand-currency-rate">
                            1 GBP = {(rates[currencyCode]).toFixed(2)} {currencyCode}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {totalBudget && (
          <div className="brand-converted-total">
            <div className="brand-converted-label">Total Budget:</div>
            <div className="brand-converted-value">
              {formatCurrency(convertedTotal, selectedCurrency)}
            </div>
            {Object.keys(totalBudget || {}).length > 1 && (
              <div className="brand-multi-currency-hint">
                (Combined from {Object.keys(totalBudget || {}).length} currencies)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
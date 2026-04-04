'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// Country code -> ISO 4217 currency code mapping (ALL countries worldwide)
const COUNTRY_TO_CURRENCY = {
    // Asia
    IN: 'INR', CN: 'CNY', JP: 'JPY', KR: 'KRW', HK: 'HKD', TW: 'TWD',
    SG: 'SGD', MY: 'MYR', TH: 'THB', ID: 'IDR', PH: 'PHP', VN: 'VND',
    BD: 'BDT', PK: 'PKR', LK: 'LKR', NP: 'NPR', BT: 'BTN', MM: 'MMK',
    KH: 'KHR', LA: 'LAK', MN: 'MNT', AF: 'AFN', IR: 'IRR', IQ: 'IQD',
    KW: 'KWD', BH: 'BHD', QA: 'QAR', OM: 'OMR', AE: 'AED', SA: 'SAR',
    YE: 'YER', JO: 'JOD', SY: 'SYP', LB: 'LBP', IL: 'ILS', PS: 'ILS',
    TR: 'TRY', AZ: 'AZN', AM: 'AMD', GE: 'GEL', KZ: 'KZT', UZ: 'UZS',
    TM: 'TMT', KG: 'KGS', TJ: 'TJS', MV: 'MVR', UZ: 'UZS', BN: 'BND',
    TL: 'USD',
    // Europe
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', PT: 'EUR',
    BE: 'EUR', AT: 'EUR', FI: 'EUR', IE: 'EUR', GR: 'EUR', LU: 'EUR',
    SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', MT: 'EUR',
    CY: 'EUR', HR: 'EUR', GB: 'GBP', CH: 'CHF', NO: 'NOK', SE: 'SEK',
    DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN',
    UA: 'UAH', RS: 'RSD', BA: 'BAM', MK: 'MKD', AL: 'ALL', ME: 'EUR',
    XK: 'EUR', MD: 'MDL', BY: 'BYN', RU: 'RUB', IS: 'ISK', LI: 'CHF',
    MC: 'EUR', SM: 'EUR', VA: 'EUR', AD: 'EUR', GL: 'DKK',
    // Americas
    US: 'USD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP',
    CO: 'COP', PE: 'PEN', VE: 'VES', EC: 'USD', UY: 'UYU', PY: 'PYG',
    BO: 'BOB', GY: 'GYD', SR: 'SRD', FK: 'FKP', TT: 'TTD', JM: 'JMD',
    BB: 'BBD', LC: 'XCD', VC: 'XCD', GD: 'XCD', AG: 'XCD', DM: 'XCD',
    KN: 'XCD', BS: 'BSD', BZ: 'BZD', GT: 'GTQ', HN: 'HNL', SV: 'USD',
    NI: 'NIO', CR: 'CRC', PA: 'USD', CU: 'CUP', DO: 'DOP', HT: 'HTG',
    PR: 'USD', AW: 'AWG', CW: 'ANG', GP: 'EUR', MQ: 'EUR', GF: 'EUR',
    PM: 'EUR', BM: 'BMD', KY: 'KYD', TC: 'USD', VG: 'USD', VI: 'USD',
    // Africa
    ZA: 'ZAR', NG: 'NGN', EG: 'EGP', KE: 'KES', GH: 'GHS', ET: 'ETB',
    TZ: 'TZS', UG: 'UGX', SD: 'SDG', DZ: 'DZD', MA: 'MAD', TN: 'TND',
    LY: 'LYD', CM: 'XAF', SN: 'XOF', CI: 'XOF', ML: 'XOF', BF: 'XOF',
    NE: 'XOF', GN: 'GNF', BJ: 'XOF', TG: 'XOF', MR: 'MRU', GW: 'XOF',
    SL: 'SLL', LR: 'LRD', GM: 'GMD', CV: 'CVE', ST: 'STN', GQ: 'XAF',
    CF: 'XAF', GA: 'XAF', CG: 'XAF', CD: 'CDF', TD: 'XAF', AO: 'AOA',
    ZM: 'ZMW', ZW: 'ZWL', MW: 'MWK', MZ: 'MZN', MG: 'MGA', RE: 'EUR',
    KM: 'KMF', SC: 'SCR', MU: 'MUR', YT: 'EUR', SO: 'SOS', DJ: 'DJF',
    ER: 'ERN', SS: 'SSP', RW: 'RWF', BI: 'BIF', TZ: 'TZS', MZ: 'MZN',
    BW: 'BWP', NA: 'NAD', SZ: 'SZL', LS: 'LSL',
    // Oceania
    AU: 'AUD', NZ: 'NZD', FJ: 'FJD', PG: 'PGK', SB: 'SBD', VU: 'VUV',
    WS: 'WST', TO: 'TOP', TV: 'AUD', NR: 'AUD', KI: 'AUD', FM: 'USD',
    MH: 'USD', PW: 'USD', CK: 'NZD', NU: 'NZD', NC: 'XPF', PF: 'XPF',
    WF: 'XPF',
};

const CURRENCY_SYMBOLS = {
    // Major
    INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
    CHF: 'Fr ', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', HKD: 'HK$', SGD: 'S$',
    // Asia
    KRW: '₩', TWD: 'NT$', MYR: 'RM ', THB: '฿', IDR: 'Rp ', PHP: '₱',
    VND: '₫', BDT: '৳', PKR: '₨', LKR: 'Rs ', NPR: 'Rs ', BTN: 'Nu ',
    MMK: 'K ', KHR: '₭', LAK: '₭', MNT: '₮', AFN: '؋', IRR: '﷼',
    IQD: 'IQD ', KWD: 'KD ', BHD: 'BD ', QAR: 'QR ', OMR: 'OMR ',
    AED: 'AED ', SAR: 'SR ', YER: '﷼', JOD: 'JD ', LBP: 'LL ', ILS: '₪',
    TRY: '₺', AZN: '₼', AMD: '֏', GEL: '₾', KZT: '₸', UZS: 'UZS ',
    TMT: 'T ', KGS: 'KGS ', TJS: 'SM ', MVR: 'Rf ', BND: 'B$',
    // Europe
    NOK: 'kr ', SEK: 'kr ', DKK: 'kr ', PLN: 'zł', CZK: 'Kč', HUF: 'Ft ',
    RON: 'lei ', BGN: 'lv ', UAH: '₴', RSD: 'din ', BAM: 'KM ', MKD: 'ден',
    ALL: 'L ', MDL: 'L ', BYN: 'Br ', RUB: '₽', ISK: 'kr ',
    // Americas
    MXN: 'MX$', BRL: 'R$', ARS: '$', CLP: 'CLP$', COP: 'COP$', PEN: 'S/',
    VES: 'Bs.S', UYU: '$U ', PYG: '₲', BOB: 'Bs.', GYD: 'G$', SRD: 'SR$',
    FKP: 'FK£', TTD: 'TT$', JMD: 'J$', BBD: 'Bds$', XCD: 'EC$',
    BSD: 'B$', BZD: 'BZ$', GTQ: 'Q ', HNL: 'L ', NIO: 'C$', CRC: '₡',
    CUP: '$', DOP: 'RD$', HTG: 'G ', AWG: 'Afl ', ANG: 'NAf ', BMD: '$',
    KYD: 'CI$',
    // Africa
    ZAR: 'R ', NGN: '₦', EGP: 'E£', KES: 'KSh ', GHS: 'GH₵', ETB: 'Br ',
    TZS: 'TSh ', UGX: 'USh ', SDG: 'SDG ', DZD: 'DA ', MAD: 'MAD ',
    TND: 'DT ', LYD: 'LD ', XAF: 'CFA ', XOF: 'CFA ', GNF: 'FG ',
    SLL: 'Le ', LRD: 'L$', GMD: 'D ', CVE: 'Esc ', STN: 'Db ',
    AOA: 'Kz ', ZMW: 'ZK ', ZWL: 'Z$', MWK: 'MK ', MZN: 'MT ',
    MGA: 'Ar ', KMF: 'CF ', SCR: 'SR ', MUR: 'Rs ', SOS: 'Sh ',
    DJF: 'Fdj ', ERN: 'Nkf ', SSP: '£', RWF: 'RF ', BIF: 'Fr ',
    BWP: 'P ', NAD: 'N$', SZL: 'L ', LSL: 'L ', CDF: 'FC ',
    // Oceania
    FJD: 'FJ$', PGK: 'K ', SBD: 'SI$', VUV: 'VT ', WST: 'WS$',
    TOP: 'T$', XPF: 'F ',
};

const CurrencyContext = createContext({
    currencyCode: 'INR',
    conversionRate: 1,
    symbol: '₹',
    formatPrice: (amountInINR) => `₹${Number(amountInINR).toLocaleString('en-IN')}`,
    isLoading: true,
});

export function CurrencyProvider({ children }) {
    const [currencyCode, setCurrencyCode] = useState('INR');
    const [conversionRate, setConversionRate] = useState(1);
    const [symbol, setSymbol] = useState('₹');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const detectAndLoad = async () => {
            try {
                // 1. Detect user country via IP geolocation
                let countryCode = 'IN';
                try {
                    const geoRes = await fetch('https://ipapi.co/json/');
                    const geoData = await geoRes.json();
                    countryCode = geoData.country_code || 'IN';
                } catch (_) {
                    // If geolocation fails, stay with INR
                }

                const detectedCurrency = COUNTRY_TO_CURRENCY[countryCode] || 'USD';

                // If user is in India, no conversion needed
                if (detectedCurrency === 'INR') {
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch exchange rates from our own cached API
                const ratesRes = await fetch('/api/currency');
                const ratesData = await ratesRes.json();

                if (ratesData.success && ratesData.rates[detectedCurrency]) {
                    const rate = ratesData.rates[detectedCurrency];
                    setCurrencyCode(detectedCurrency);
                    setConversionRate(rate);
                    setSymbol(CURRENCY_SYMBOLS[detectedCurrency] || detectedCurrency + ' ');
                }
            } catch (error) {
                console.error('Currency detection error:', error);
                // Fall back to INR silently
            } finally {
                setIsLoading(false);
            }
        };

        detectAndLoad();
    }, []);

    const formatPrice = (amountInINR) => {
        const converted = Number(amountInINR) * conversionRate;
        // For currencies with large values (like JPY, IDR), show no decimals
        const noDecimalCurrencies = ['JPY', 'IDR', 'PKR', 'BDT'];
        const decimals = noDecimalCurrencies.includes(currencyCode) ? 0 : 2;
        return `${symbol}${converted.toLocaleString('en-US', {
            minimumFractionDigits: currencyCode === 'INR' ? 0 : decimals,
            maximumFractionDigits: currencyCode === 'INR' ? 0 : decimals,
        })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currencyCode, conversionRate, symbol, formatPrice, isLoading }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}

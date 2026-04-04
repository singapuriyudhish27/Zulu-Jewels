import { NextResponse } from "next/server";

// Simple in-memory cache (valid for 24 hours per server instance)
let ratesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
    try {
        const now = Date.now();

        // Return cached rates if still fresh
        if (ratesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION_MS) {
            return NextResponse.json({ success: true, rates: ratesCache, cached: true });
        }

        // Fetch from exchangerate-api — free tier, no API key needed for INR base
        const res = await fetch("https://open.er-api.com/v6/latest/INR", {
            next: { revalidate: 86400 }, // Next.js cache for 24h
        });

        if (!res.ok) {
            throw new Error("Exchange rate fetch failed");
        }

        const data = await res.json();

        if (data.result !== "success") {
            throw new Error("Exchange rate API returned error");
        }

        // Keep all currencies that are used by COUNTRY_TO_CURRENCY map
        const TARGET_CURRENCIES = [
            // Major
            'INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'AUD', 'CAD', 'NZD',
            // Asia
            'HKD', 'SGD', 'KRW', 'TWD', 'MYR', 'THB', 'IDR', 'PHP', 'VND',
            'BDT', 'PKR', 'LKR', 'NPR', 'BTN', 'MMK', 'KHR', 'LAK', 'MNT',
            'AFN', 'IRR', 'IQD', 'KWD', 'BHD', 'QAR', 'OMR', 'AED', 'SAR',
            'YER', 'JOD', 'SYP', 'LBP', 'ILS', 'TRY', 'AZN', 'AMD', 'GEL',
            'KZT', 'UZS', 'TMT', 'KGS', 'TJS', 'MVR', 'BND',
            // Europe
            'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'UAH',
            'RSD', 'BAM', 'MKD', 'ALL', 'MDL', 'BYN', 'RUB', 'ISK',
            // Americas
            'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN', 'VES', 'UYU', 'PYG',
            'BOB', 'GYD', 'SRD', 'FKP', 'TTD', 'JMD', 'BBD', 'XCD',
            'BSD', 'BZD', 'GTQ', 'HNL', 'NIO', 'CRC', 'CUP', 'DOP', 'HTG',
            'AWG', 'ANG', 'BMD', 'KYD',
            // Africa
            'ZAR', 'NGN', 'EGP', 'KES', 'GHS', 'ETB', 'TZS', 'UGX', 'SDG',
            'DZD', 'MAD', 'TND', 'LYD', 'XAF', 'XOF', 'GNF', 'SLL', 'LRD',
            'GMD', 'CVE', 'STN', 'AOA', 'ZMW', 'ZWL', 'MWK', 'MZN', 'MGA',
            'KMF', 'SCR', 'MUR', 'SOS', 'DJF', 'ERN', 'SSP', 'RWF', 'BIF',
            'BWP', 'NAD', 'SZL', 'LSL', 'CDF', 'MRU',
            // Oceania
            'FJD', 'PGK', 'SBD', 'VUV', 'WST', 'TOP', 'XPF',
        ];

        const filteredRates = {};
        for (const code of TARGET_CURRENCIES) {
            if (data.rates[code]) {
                filteredRates[code] = data.rates[code];
            }
        }

        ratesCache = filteredRates;
        cacheTimestamp = now;

        return NextResponse.json({ success: true, rates: filteredRates, cached: false });
    } catch (error) {
        console.error("Currency API Error:", error);
        // Fallback approximate rates from INR (as of early 2024)
        return NextResponse.json({
            success: true,
            rates: {
                INR: 1,
                USD: 0.01201,
                EUR: 0.01106,
                GBP: 0.00944,
                AED: 0.04411,
                SGD: 0.01618,
                AUD: 0.01853,
                CAD: 0.01640,
                JPY: 1.83000,
                CHF: 0.01085,
                MYR: 0.05701,
                HKD: 0.09370,
                ZAR: 0.22180,
                SAR: 0.04505,
                THB: 0.41800,
                NZD: 0.01996,
            },
            cached: false,
            fallback: true,
        });
    }
}

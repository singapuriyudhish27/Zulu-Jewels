'use client';
import { useCurrency } from '@/context/CurrencyContext';

/**
 * PriceDisplay
 * Converts and renders a price from INR to the user's local currency.
 *
 * @param {number} amountInINR  - The price in Indian Rupees (base currency in DB).
 * @param {string} className    - Optional CSS class for the wrapping span.
 * @param {object} style        - Optional inline style for the wrapping span.
 */
export default function PriceDisplay({ amountInINR, className, style }) {
    const { formatPrice, isLoading } = useCurrency();

    if (isLoading) {
        // Show a subtle skeleton / retain INR display while detecting
        return (
            <span className={className} style={style}>
                ₹{Number(amountInINR).toLocaleString('en-IN')}
            </span>
        );
    }

    return (
        <span className={className} style={style}>
            {formatPrice(amountInINR)}
        </span>
    );
}

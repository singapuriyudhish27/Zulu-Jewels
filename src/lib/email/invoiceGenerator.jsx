import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    renderToBuffer,
} from '@react-pdf/renderer';

// ─── Color Palette (Light & Premium) ─────────────────────────────────────────
const GOLD        = '#C9A84C';
const GOLD_LIGHT  = '#F5EDD6';
const NEAR_BLACK  = '#1A1A1A';
const DARK_TEXT   = '#2C2C2C';
const MUTED_TEXT  = '#9B8B6E';
const WARM_BG     = '#FAFAF8';
const WHITE       = '#FFFFFF';
const BORDER      = '#E8E0D0';
const LIGHT_BORDER= '#F0EBE3';
const GREEN       = '#4A8C5C';
const RED         = '#B05050';

const styles = StyleSheet.create({
    page: {
        backgroundColor: WARM_BG,
        paddingHorizontal: 48,
        paddingVertical: 48,
        fontFamily: 'Helvetica',
        color: DARK_TEXT,
        fontSize: 10,
    },

    // ── Header ────────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    brandSection: {},
    brandName: {
        color: GOLD,
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 4,
    },
    brandTagline: {
        color: MUTED_TEXT,
        fontSize: 8,
        letterSpacing: 2,
        marginTop: 3,
    },
    goldLine: {
        width: 32,
        height: 1,
        backgroundColor: GOLD,
        marginTop: 8,
    },
    invoiceSection: {
        alignItems: 'flex-end',
    },
    invoiceLabel: {
        color: MUTED_TEXT,
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    invoiceNumber: {
        color: GOLD,
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1,
        marginTop: 2,
    },
    invoiceDate: {
        color: MUTED_TEXT,
        fontSize: 9,
        marginTop: 3,
    },

    // ── Meta Cards Row ────────────────────────────────────────────────────────
    metaRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    metaCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 3,
        padding: 12,
        borderWidth: 1,
        borderColor: LIGHT_BORDER,
    },
    metaLabel: {
        color: MUTED_TEXT,
        fontSize: 7,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    metaValue: {
        color: DARK_TEXT,
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    metaValueGold: {
        color: GOLD,
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
    },
    metaValueGreen: {
        color: GREEN,
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    metaValueRed: {
        color: RED,
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },

    // ── Address Cards ─────────────────────────────────────────────────────────
    addressRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    addressCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 3,
        padding: 14,
        borderWidth: 1,
        borderColor: LIGHT_BORDER,
    },
    addressCardAccent: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 3,
        padding: 14,
        borderWidth: 1,
        borderColor: LIGHT_BORDER,
        borderLeftWidth: 3,
        borderLeftColor: GOLD,
    },
    addressHeading: {
        color: GOLD,
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: LIGHT_BORDER,
    },
    addressName: {
        color: DARK_TEXT,
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 3,
    },
    addressLine: {
        color: MUTED_TEXT,
        fontSize: 9,
        lineHeight: 1.5,
    },

    // ── Items Table ───────────────────────────────────────────────────────────
    tableContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: LIGHT_BORDER,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: WHITE,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: WARM_BG,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    tableHeaderText: {
        color: MUTED_TEXT,
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    tableRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: LIGHT_BORDER,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    tableRowAlt: {
        backgroundColor: '#FDFCFB',
    },

    // Column widths
    colProduct: { flex: 4 },
    colQty:     { flex: 1 },
    colUnit:    { flex: 2 },
    colTotal:   { flex: 2 },

    cellText:      { color: DARK_TEXT, fontSize: 9 },
    cellMuted:     { color: MUTED_TEXT, fontSize: 8, marginTop: 2 },
    cellGold:      { color: GOLD, fontSize: 9, fontFamily: 'Helvetica-Bold' },
    cellCenter:    { textAlign: 'center', color: MUTED_TEXT, fontSize: 9 },
    cellRight:     { textAlign: 'right' },

    // ── Totals ────────────────────────────────────────────────────────────────
    totalsContainer: {
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: LIGHT_BORDER,
        borderRadius: 3,
        padding: 14,
        marginBottom: 20,
    },
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    totalsLabel: { color: MUTED_TEXT, fontSize: 9 },
    totalsValue: { color: DARK_TEXT, fontSize: 9, fontFamily: 'Helvetica-Bold' },
    dividerGold: {
        borderTopWidth: 1,
        borderTopColor: GOLD,
        marginVertical: 8,
    },
    grandTotalLabel: { color: NEAR_BLACK, fontSize: 11, fontFamily: 'Helvetica-Bold' },
    grandTotalValue: { color: GOLD, fontSize: 14, fontFamily: 'Helvetica-Bold' },
    paidValue:       { color: GREEN, fontSize: 10, fontFamily: 'Helvetica-Bold' },
    unpaidValue:     { color: RED, fontSize: 10, fontFamily: 'Helvetica-Bold' },

    // ── Footer ────────────────────────────────────────────────────────────────
    footer: {
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingTop: 16,
        alignItems: 'center',
    },
    footerGoldLine: {
        width: 32,
        height: 1,
        backgroundColor: GOLD,
        marginBottom: 10,
    },
    footerBrand: {
        color: GOLD,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    footerText: {
        color: MUTED_TEXT,
        fontSize: 8,
        textAlign: 'center',
        lineHeight: 1.6,
    },
});

// ─── Invoice Document Component ───────────────────────────────────────────────
function InvoiceDocument({ data }) {
    const { order, customer, user, items, transaction } = data;

    const orderId   = String(order._id).slice(-8).toUpperCase();
    const orderDate = new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    const grandTotal   = transaction?.amount ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
    const formatINR    = (n) => `Rs. ${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const customerName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : customer?.customer_name || 'N/A';

    return (
        <Document title={`Zulu Jewels Invoice #${orderId}`} author="Zulu Jewels">
            <Page size="A4" style={styles.page}>

                {/* ── Header ─────────────────────────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.brandSection}>
                        <Text style={styles.brandName}>ZULU JEWELS</Text>
                        <Text style={styles.brandTagline}>CRAFTED WITH EXCELLENCE</Text>
                        <View style={styles.goldLine} />
                    </View>
                    <View style={styles.invoiceSection}>
                        <Text style={styles.invoiceLabel}>Tax Invoice</Text>
                        <Text style={styles.invoiceNumber}>#{orderId}</Text>
                        <Text style={styles.invoiceDate}>{invoiceDate}</Text>
                    </View>
                </View>

                {/* ── Meta Cards ─────────────────────────────────────────── */}
                <View style={styles.metaRow}>
                    <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Invoice No.</Text>
                        <Text style={styles.metaValueGold}>#{orderId}</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Order Date</Text>
                        <Text style={styles.metaValue}>{orderDate}</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Payment Method</Text>
                        <Text style={styles.metaValue}>{order.payment_method || 'N/A'}</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Payment Status</Text>
                        <Text style={order.is_paid ? styles.metaValueGreen : styles.metaValueRed}>
                            {order.is_paid ? 'PAID' : 'PENDING'}
                        </Text>
                    </View>
                </View>

                {/* ── Bill To / Ship To ──────────────────────────────────── */}
                <View style={styles.addressRow}>
                    <View style={styles.addressCardAccent}>
                        <Text style={styles.addressHeading}>Bill To</Text>
                        <Text style={styles.addressName}>{customerName}</Text>
                        <Text style={styles.addressLine}>{user?.email || 'N/A'}</Text>
                        <Text style={styles.addressLine}>{user?.phone || 'N/A'}</Text>
                    </View>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressHeading}>Ship To</Text>
                        <Text style={styles.addressName}>{customerName}</Text>
                        <Text style={styles.addressLine}>{order.shipping_address || customer?.location || 'N/A'}</Text>
                    </View>
                </View>

                {/* ── Items Table ────────────────────────────────────────── */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colProduct]}>Product</Text>
                        <Text style={[styles.tableHeaderText, styles.colQty, { textAlign: 'center' }]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, styles.colUnit, { textAlign: 'right' }]}>Unit Price</Text>
                        <Text style={[styles.tableHeaderText, styles.colTotal, { textAlign: 'right' }]}>Total</Text>
                    </View>

                    {items.map((item, idx) => (
                        <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                            <View style={styles.colProduct}>
                                <Text style={styles.cellText}>{item.product_name || 'Product'}</Text>
                                {item.variant_material ? (
                                    <Text style={styles.cellMuted}>{item.variant_material}</Text>
                                ) : null}
                            </View>
                            <Text style={[styles.cellCenter, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.cellText, styles.colUnit, styles.cellRight]}>
                                {formatINR(item.price)}
                            </Text>
                            <Text style={[styles.cellGold, styles.colTotal, styles.cellRight]}>
                                {formatINR(item.price * item.quantity)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ── Totals ─────────────────────────────────────────────── */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Subtotal</Text>
                        <Text style={styles.totalsValue}>{formatINR(grandTotal)}</Text>
                    </View>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Shipping</Text>
                        <Text style={[styles.totalsValue, { color: GREEN }]}>Included</Text>
                    </View>
                    <View style={styles.dividerGold} />
                    <View style={styles.totalsRow}>
                        <Text style={styles.grandTotalLabel}>Grand Total</Text>
                        <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
                    </View>
                    <View style={[styles.totalsRow, { marginTop: 5 }]}>
                        <Text style={styles.totalsLabel}>
                            {order.is_paid ? 'Amount Received' : 'Amount Due'}
                        </Text>
                        <Text style={order.is_paid ? styles.paidValue : styles.unpaidValue}>
                            {order.is_paid
                                ? `${formatINR(grandTotal)}  —  PAID`
                                : `${formatINR(grandTotal)}  —  DUE`}
                        </Text>
                    </View>
                </View>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <View style={styles.footer}>
                    <View style={styles.footerGoldLine} />
                    <Text style={styles.footerBrand}>Zulu Jewels</Text>
                    <Text style={styles.footerText}>
                        Thank you for your purchase. This is a computer-generated invoice.{'\n'}
                        For queries, contact us at {process.env.SMTP_USER || 'zulujewels@gmail.com'}
                    </Text>
                </View>

            </Page>
        </Document>
    );
}

/**
 * Generates a PDF invoice as a Buffer.
 * @param {object} data - { order, customer, user, items, transaction }
 * @returns {Promise<Buffer>}
 */
export async function generateInvoicePDF(data) {
    const doc = React.createElement(InvoiceDocument, { data });
    const buffer = await renderToBuffer(doc);
    return buffer;
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContentPage from "@/lib/models/ContentPage";

const DEFAULT_POLICIES = {
  terms: {
    page_name: "Terms & Conditions",
    slug: "terms",
    url: "/terms",
    content: `<h2>Terms & Conditions</h2>
<p>Welcome to Zulu Jewels. By accessing or using our website and purchasing our luxury fine jewelry, you agree to comply with and be bound by the following terms and conditions.</p>

<h3>1. General Overview</h3>
<p>Zulu Jewels operates this website to provide handcrafted, certified fine diamond jewelry. Throughout the site, the terms "we", "us" and "our" refer to Zulu Jewels.</p>

<h3>2. Product Authenticity & Certification</h3>
<p>Every diamond and piece of fine jewelry comes with genuine certification verifying authenticity, cut, clarity, and carat weight from accredited gemological institutes.</p>

<h3>3. Pricing & Payment</h3>
<p>All prices listed on our website are in INR (Indian Rupee) unless specified otherwise. We reserve the right to modify prices without prior notice. Payments are secured via verified payment gateways.</p>

<h3>4. Shipping & Insurance</h3>
<p>All orders are fully insured during transit. Delivery timelines may vary based on customization, hallmarking, and location.</p>

<h3>5. Returns & Exchange</h3>
<p>Please review our return policy for eligible products. Custom-designed and personalized jewelry pieces may have special return restrictions.</p>`,
    pdf_url: null,
    status: true,
    updated_at: new Date().toISOString(),
  },
  privacy: {
    page_name: "Privacy Policy",
    slug: "privacy",
    url: "/privacy",
    content: `<h2>Privacy Policy</h2>
<p>At Zulu Jewels, we are committed to safeguarding your personal information and respecting your privacy.</p>

<h3>1. Information We Collect</h3>
<p>We collect details you provide when placing an order, creating an account, or subscribing to our newsletter, including name, email address, shipping address, and phone number.</p>

<h3>2. How We Use Your Information</h3>
<p>Your data is used solely to process transactions, arrange secure insured delivery, provide customer support, and communicate exclusive collections with your consent.</p>

<h3>3. Data Protection & Security</h3>
<p>We employ enterprise-grade SSL encryption and secure databases to ensure your personal and payment information is strictly protected against unauthorized access.</p>

<h3>4. Third-Party Sharing</h3>
<p>We do not sell, trade, or transfer your personal data to outside parties, except trusted logistics and payment partners necessary to fulfill your order.</p>

<h3>5. Contact Us</h3>
<p>If you have any questions regarding this Privacy Policy, feel free to reach out to our concierge at support@zulujewels.com.</p>`,
    pdf_url: null,
    status: true,
    updated_at: new Date().toISOString(),
  }
};

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json({ success: false, message: "Slug is required" }, { status: 400 });
    }

    const policy = await ContentPage.findOne({
      $or: [{ slug }, { url: `/${slug}` }, { url: slug }],
      status: true
    });

    if (policy) {
      return NextResponse.json({ success: true, data: policy });
    }

    // If not found in DB or draft, check default fallback
    if (DEFAULT_POLICIES[slug]) {
      return NextResponse.json({ success: true, data: DEFAULT_POLICIES[slug] });
    }

    return NextResponse.json({ success: false, message: "Policy page not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching public policy:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

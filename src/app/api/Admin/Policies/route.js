import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContentPage from "@/lib/models/ContentPage";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { saveFile } from "@/lib/storage";

const DEFAULT_POLICIES = {
  terms: {
    page_name: "Terms & Conditions",
    slug: "terms",
    url: "/terms",
    content: `<h2>Terms & Conditions</h2>
<p>Welcome to Zulu Jewels. By accessing or using our website and purchasing our luxury jewelry, you agree to comply with and be bound by the following terms and conditions.</p>

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
  }
};

// GET: Fetch policy or both policies
export async function GET(req) {
  const auth = await verifyAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      let policy = await ContentPage.findOne({ 
        $or: [{ slug }, { url: `/${slug}` }, { url: slug }] 
      });

      if (!policy && DEFAULT_POLICIES[slug]) {
        policy = DEFAULT_POLICIES[slug];
      }

      return NextResponse.json({ success: true, policy });
    }

    // Fetch both terms and privacy
    const pages = await ContentPage.find({
      $or: [
        { slug: { $in: ['terms', 'privacy'] } },
        { url: { $in: ['/terms', '/privacy', 'terms', 'privacy'] } }
      ]
    });

    const result = {
      terms: pages.find(p => p.slug === 'terms' || p.url?.includes('terms')) || DEFAULT_POLICIES.terms,
      privacy: pages.find(p => p.slug === 'privacy' || p.url?.includes('privacy')) || DEFAULT_POLICIES.privacy,
    };

    return NextResponse.json({ success: true, policies: result });
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json({ success: false, message: "Error fetching policies" }, { status: 500 });
  }
}

// POST/PUT: Update or upload policy content & PDF
export async function POST(req) {
  const auth = await verifyAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  try {
    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let slug = "";
    let page_name = "";
    let content = "";
    let status = true;
    let removePdf = false;
    let uploadedPdfUrl = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      slug = formData.get("slug") || "";
      page_name = formData.get("page_name") || "";
      content = formData.get("content") || "";
      status = formData.get("status") === "true" || formData.get("status") === true;
      removePdf = formData.get("remove_pdf") === "true";

      const file = formData.get("pdf_file");
      if (file && typeof file === "object" && file.size > 0) {
        uploadedPdfUrl = await saveFile(file, "policies");
      }
    } else {
      const json = await req.json();
      slug = json.slug || "";
      page_name = json.page_name || "";
      content = json.content || "";
      status = json.status !== undefined ? json.status : true;
      removePdf = Boolean(json.remove_pdf);
      if (json.pdf_url) {
        uploadedPdfUrl = json.pdf_url;
      }
    }

    if (!slug) {
      return NextResponse.json({ success: false, message: "Policy slug is required ('terms' or 'privacy')" }, { status: 400 });
    }

    const defaultTitle = slug === "terms" ? "Terms & Conditions" : "Privacy Policy";
    const updateData = {
      page_name: page_name || defaultTitle,
      url: `/${slug}`,
      slug: slug,
      content: content,
      status: status,
    };

    if (uploadedPdfUrl) {
      updateData.pdf_url = uploadedPdfUrl;
    } else if (removePdf) {
      updateData.pdf_url = null;
    }

    const updated = await ContentPage.findOneAndUpdate(
      { $or: [{ slug }, { url: `/${slug}` }] },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `${updateData.page_name} updated successfully!`,
      policy: updated
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating policy:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update policy" }, { status: 500 });
  }
}

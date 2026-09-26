import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
export const metadata: Metadata = { title: "Refund policy" };
export default function RefundsPage() { return <LegalPage title="Refund policy" intro="Digital products are delivered immediately or on the stated release date. This policy explains when a refund is available." sections={[
  { title: "Delivered digital products", paragraphs: ["Because downloadable files cannot be returned, completed purchases are generally final once the download or access email has been delivered. This does not limit any refund or remedy required by applicable consumer law."] },
  { title: "When we will help", paragraphs: ["Contact us within seven days if you were charged more than once, received the wrong product, could not access a delivered file after reasonable troubleshooting, or believe the product was materially misdescribed. We may first replace the file, restore access, or correct the order; where that does not resolve the issue, we will issue an appropriate refund."] },
  { title: "Pre-orders", paragraphs: ["You may request cancellation of a pre-order before the product is delivered. After delivery, the rules for delivered digital products apply. If we cancel a planned release, affected pre-orders will be refunded."] },
  { title: "How refunds work", paragraphs: ["Approved refunds are returned through the original payment method. Processing time depends on Razorpay, the payment network, and your bank. We will email confirmation when the refund is initiated."] },
]} />; }

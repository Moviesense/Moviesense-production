import {
  LegalLayout,
  Section,
  P,
  Sub,
  List,
  Highlight,
  A,
  ContactCard,
  type TocItem,
} from "@/components/Legal/LegalPage";

const toc: TocItem[] = [
  { id: "s1", label: "Acceptance of Terms" },
  { id: "s2", label: "About Movie Sense" },
  { id: "s3", label: "Eligibility" },
  { id: "s4", label: "Accounts & Registration" },
  { id: "s5", label: "Free & Paid Access" },
  { id: "s6", label: "Subscriptions & Billing" },
  { id: "s7", label: "Cancellations & Refunds" },
  { id: "s8", label: "Acceptable Use" },
  { id: "s9", label: "Content & Intellectual Property" },
  { id: "s10", label: "Availability & Service Changes" },
  { id: "s11", label: "Disclaimers" },
  { id: "s12", label: "Limitation of Liability" },
  { id: "s13", label: "Governing Law" },
  { id: "s14", label: "Changes to These Terms" },
  { id: "s15", label: "Contact Us" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Operated by Vision Pictures PTY LTD"
      effective="Effective 2026 — Vision Pictures PTY LTD"
      toc={toc}
    >
      <Section number="Section 01" id="s1" title="Acceptance of Terms">
        <P>
          These Terms and Conditions (&quot;Terms&quot;) govern your access to and
          use of the Movie Sense platform, including our website, mobile
          applications, and any related services (collectively, the
          &quot;Service&quot;), operated by Vision Pictures PTY LTD
          (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
        </P>
        <P>
          By accessing or using Movie Sense in any way — including browsing the
          website, creating an account, or streaming content — you confirm that
          you have read, understood, and agree to be bound by these Terms.
        </P>
        <Highlight>
          If you do not agree to these Terms, please do not access or use Movie
          Sense.
        </Highlight>
      </Section>

      <Section number="Section 02" id="s2" title="About Movie Sense">
        <P>
          Movie Sense is a streaming platform that provides access to films,
          trailers, live streams, and related entertainment content across web,
          mobile, and connected devices. Content is curated for general audiences
          and includes family-friendly viewing options.
        </P>
        <P>
          Movie Sense is operated by Vision Pictures PTY LTD, a company registered
          in Australia. The platform serves users across Australia and
          internationally.
        </P>
      </Section>

      <Section number="Section 03" id="s3" title="Eligibility">
        <P>To use Movie Sense, you must:</P>
        <List
          items={[
            "Be at least 13 years of age, or the minimum age required by the laws of your country",
            "Have the legal capacity to enter into a binding agreement",
            "Not be prohibited from using the Service under applicable law",
          ]}
        />
        <P>
          If you are under 18, you confirm that a parent or guardian has reviewed
          and agreed to these Terms on your behalf. Parents and guardians are
          responsible for supervising minors&apos; use of the platform.
        </P>
      </Section>

      <Section number="Section 04" id="s4" title="Accounts & Registration">
        <P>
          To access certain features of Movie Sense, you will need to create an
          account. When registering, you agree to:
        </P>
        <List
          items={[
            "Provide accurate, current, and complete information",
            "Keep your account credentials confidential",
            "Notify us immediately of any unauthorised access to your account",
            "Be responsible for all activity that occurs under your account",
          ]}
        />
        <P>
          You may not share your account credentials with others or allow multiple
          users to access a single account simultaneously unless your subscription
          plan expressly permits this.
        </P>
        <P>
          We reserve the right to suspend or terminate accounts that violate these
          Terms, are inactive for an extended period, or are being used in a
          fraudulent or abusive manner.
        </P>
      </Section>

      <Section number="Section 05" id="s5" title="Free & Paid Access">
        <Sub>Free Tier</Sub>
        <P>
          Movie Sense offers a free tier that provides limited access to content
          on the platform. Free tier users may have access to selected films,
          trailers, and other content as determined by us from time to time. The
          availability and scope of free content may change without notice.
        </P>
        <Sub>Paid Subscriptions</Sub>
        <P>
          A paid subscription unlocks full access to the Movie Sense library,
          including all available films, live streams, and premium content.
          Subscription features and pricing are detailed on our Plans &amp;
          Pricing page.
        </P>
        <P>
          We reserve the right to modify what content is available under each tier
          at any time.
        </P>
      </Section>

      <Section number="Section 06" id="s6" title="Subscriptions & Billing">
        <P>
          Paid subscriptions are billed on a recurring basis (monthly or annually,
          depending on the plan selected) until cancelled. By subscribing, you
          authorise us to charge your chosen payment method at the applicable
          rate.
        </P>
        <List
          items={[
            "All prices are listed in Australian Dollars (AUD) unless otherwise stated",
            "International users may be subject to currency conversion fees charged by their payment provider",
            "Payments are processed securely through third-party providers including Stripe",
            "We do not store full credit card details on our servers",
          ]}
        />
        <P>
          If a payment fails, we may attempt to retry the charge. Continued failure
          to process payment may result in suspension of your access until the
          outstanding balance is resolved.
        </P>
        <P>
          We reserve the right to change subscription pricing. Any price changes
          will be communicated to you in advance and will apply from your next
          billing cycle.
        </P>
      </Section>

      <Section number="Section 07" id="s7" title="Cancellations & Refunds">
        <P>
          You may cancel your subscription at any time through your account
          settings or by contacting our support team. Upon cancellation:
        </P>
        <List
          items={[
            "Your access will continue until the end of the current billing period",
            "You will not be charged for subsequent billing periods",
            "No partial refunds are issued for unused time within a billing period",
          ]}
        />
        <Highlight>
          Subscriptions purchased through third-party platforms (such as the Apple
          App Store or Google Play) must be cancelled directly through that
          platform. Their refund policies will apply.
        </Highlight>
        <P>
          Refund requests are assessed on a case-by-case basis. If you believe you
          are entitled to a refund due to a technical issue or billing error,
          please contact us at{" "}
          <A href="mailto:developer@visionpictures.com.au">
            developer@visionpictures.com.au
          </A>
          .
        </P>
        <P>
          Australian consumers may have additional rights under the Australian
          Consumer Law (ACL) that cannot be excluded by these Terms.
        </P>
      </Section>

      <Section number="Section 08" id="s8" title="Acceptable Use">
        <P>
          You agree to use Movie Sense only for lawful purposes and in accordance
          with these Terms. You must not:
        </P>
        <List
          items={[
            "Reproduce, download, redistribute, or share content from the platform without written permission",
            "Use any automated tools, bots, scrapers, or scripts to access the Service",
            "Attempt to bypass, disable, or circumvent any digital rights management (DRM) or security features",
            "Impersonate another person or entity, or misrepresent your affiliation",
            "Transmit any harmful, offensive, or unlawful content through the platform",
            "Interfere with or disrupt the integrity or performance of the Service",
            "Use the Service for commercial purposes without prior written consent",
            "Access or attempt to access accounts, systems, or data that are not your own",
          ]}
        />
        <P>
          We reserve the right to terminate or restrict access for any user who
          violates these rules, with or without notice.
        </P>
      </Section>

      <Section
        number="Section 09"
        id="s9"
        title="Content & Intellectual Property"
      >
        <P>
          All content available on Movie Sense — including films, trailers,
          images, logos, text, and software — is the property of Vision Pictures
          PTY LTD or its content licensors, and is protected by Australian and
          international copyright, trademark, and intellectual property laws.
        </P>
        <P>
          Your subscription grants you a limited, non-exclusive, non-transferable,
          personal licence to stream content for private, non-commercial viewing
          only. This licence does not include any right to:
        </P>
        <List
          items={[
            "Download or permanently store content (unless expressly permitted)",
            "Copy, reproduce, or distribute content to others",
            "Modify, adapt, or create derivative works",
            "Use content for commercial or public performance purposes",
          ]}
        />
        <P>
          Any unauthorised use of our content may constitute an infringement of
          our intellectual property rights and may result in legal action.
        </P>
      </Section>

      <Section
        number="Section 10"
        id="s10"
        title="Availability & Service Changes"
      >
        <P>
          We strive to provide a reliable streaming experience, but we do not
          guarantee that Movie Sense will be available at all times without
          interruption. The Service may be temporarily unavailable due to:
        </P>
        <List
          items={[
            "Scheduled maintenance or upgrades",
            "Technical faults or outages beyond our control",
            "Changes to third-party services we rely upon",
          ]}
        />
        <P>
          We reserve the right to modify, suspend, or discontinue any part of the
          Service at any time. We may also add, remove, or change content in our
          library as licensing agreements change.
        </P>
        <P>
          We will make reasonable efforts to notify users of significant changes
          where possible.
        </P>
      </Section>

      <Section number="Section 11" id="s11" title="Disclaimers">
        <P>
          Movie Sense is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind, either express or
          implied, including but not limited to warranties of merchantability,
          fitness for a particular purpose, or non-infringement.
        </P>
        <P>We do not warrant that:</P>
        <List
          items={[
            "The Service will meet your specific requirements",
            "The Service will be uninterrupted, timely, secure, or error-free",
            "Any content will be accurate, complete, or up to date",
            "Defects in the Service will be corrected",
          ]}
        />
        <P>
          Nothing in these Terms limits any rights you may have under the
          Australian Consumer Law or other applicable consumer protection
          legislation.
        </P>
      </Section>

      <Section number="Section 12" id="s12" title="Limitation of Liability">
        <P>
          To the maximum extent permitted by applicable law, Vision Pictures PTY
          LTD and its directors, employees, partners, and licensors shall not be
          liable for any indirect, incidental, special, consequential, or punitive
          damages arising from:
        </P>
        <List
          items={[
            "Your use of or inability to use the Service",
            "Unauthorised access to or alteration of your data",
            "Any interruption or cessation of the Service",
            "Any bugs, viruses, or similar issues transmitted through the Service",
          ]}
        />
        <P>
          Our total liability to you for any claim arising from these Terms or your
          use of the Service shall not exceed the total amount paid by you to Movie
          Sense in the three months preceding the claim.
        </P>
        <P>
          Australian users retain rights under the Australian Consumer Law that
          cannot be excluded by contract, and these Terms do not seek to limit
          those rights.
        </P>
      </Section>

      <Section number="Section 13" id="s13" title="Governing Law">
        <P>
          These Terms are governed by and construed in accordance with the laws of
          Queensland, Australia, without regard to conflict of law principles.
        </P>
        <P>
          Any disputes arising from these Terms or your use of Movie Sense will be
          subject to the exclusive jurisdiction of the courts of Queensland,
          Australia, unless otherwise required by local consumer protection laws in
          your country of residence.
        </P>
        <P>
          If you are an international user, you may also have rights under the
          consumer protection laws of your own jurisdiction, which these Terms do
          not seek to override.
        </P>
      </Section>

      <Section number="Section 14" id="s14" title="Changes to These Terms">
        <P>
          We may update these Terms from time to time to reflect changes to our
          Service, legal requirements, or business practices. When we make material
          changes, we will notify you by:
        </P>
        <List
          items={[
            "Posting the updated Terms on this page with a new effective date",
            "Sending a notification to your registered email address where appropriate",
          ]}
        />
        <P>
          Your continued use of Movie Sense after updated Terms are posted
          constitutes your acceptance of the revised Terms. If you do not agree to
          the updated Terms, you should discontinue use of the Service.
        </P>
      </Section>

      <Section number="Section 15" id="s15" title="Contact Us">
        <P>
          If you have any questions about these Terms or wish to raise a concern,
          please contact us:
        </P>
        <ContactCard />
      </Section>
    </LegalLayout>
  );
}

import {
  LegalLayout,
  Section,
  P,
  Sub,
  List,
  Highlight,
  ContactCard,
  type TocItem,
} from "@/components/Legal/LegalPage";

const toc: TocItem[] = [
  { id: "s1", label: "Introduction" },
  { id: "s2", label: "Information We Collect" },
  { id: "s3", label: "How We Use Your Information" },
  { id: "s4", label: "Children's Privacy" },
  { id: "s5", label: "Sharing of Information" },
  { id: "s6", label: "Data Storage & Security" },
  { id: "s7", label: "International Data Transfers" },
  { id: "s8", label: "Your Rights & Choices" },
  { id: "s9", label: "Account Deletion" },
  { id: "s10", label: "Cookies & Tracking" },
  { id: "s11", label: "Third-Party Services" },
  { id: "s12", label: "Changes to This Policy" },
  { id: "s13", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Operated by Vision Pictures PTY LTD"
      effective="Effective 2026 — Vision Pictures PTY LTD"
      toc={toc}
    >
      <Section number="Section 01" id="s1" title="Introduction">
        <P>
          Welcome to Movie Sense (&quot;Movie Sense&quot;, &quot;we&quot;,
          &quot;our&quot;, or &quot;us&quot;), operated by Vision Pictures PTY
          LTD.
        </P>
        <P>
          Movie Sense is a streaming platform that allows users to discover,
          stream, and enjoy films, trailers, live streams, and related
          entertainment content across web, mobile, and connected devices.
        </P>
        <P>
          This Privacy Policy explains how we collect, use, disclose, and protect
          your information when you use:
        </P>
        <List
          items={[
            "The Movie Sense website",
            "The Movie Sense mobile applications",
            "Any related services, streaming platforms, or connected applications",
          ]}
        />
        <Highlight>
          By using Movie Sense, you agree to the collection and use of
          information in accordance with this Privacy Policy.
        </Highlight>
      </Section>

      <Section number="Section 02" id="s2" title="Information We Collect">
        <Sub>Account Information</Sub>
        <P>When you create an account, we may collect:</P>
        <List
          items={[
            "Name",
            "Email address",
            "Password (encrypted)",
            "Subscription status",
            "Account preferences",
            "Profile information",
          ]}
        />

        <Sub>Payment Information</Sub>
        <P>
          Subscriptions are processed securely through third-party payment
          providers such as Stripe. We do not store your full credit card details
          on our servers. Payment providers may collect:
        </P>
        <List
          items={[
            "Billing name",
            "Payment method details",
            "Billing address",
            "Transaction history",
          ]}
        />

        <Sub>Usage Information</Sub>
        <P>
          We may automatically collect information about how you use Movie Sense,
          including:
        </P>
        <List
          items={[
            "Videos watched and watch history",
            "Device type, app version, and browser type",
            "IP address and viewing duration",
            "App interactions, diagnostic and crash data",
          ]}
        />

        <Sub>Device Information</Sub>
        <P>We may collect information from your device, including:</P>
        <List
          items={[
            "Mobile device identifiers",
            "Operating system and device model",
            "Language settings",
            "Approximate geographic location based on IP address",
          ]}
        />

        <Sub>Analytics Information</Sub>
        <P>
          We may use analytics tools to better understand user behaviour and
          improve the service. Analytics may collect session activity, navigation
          patterns, performance metrics, and engagement statistics.
        </P>
      </Section>

      <Section number="Section 03" id="s3" title="How We Use Your Information">
        <P>We use collected information to:</P>
        <List
          items={[
            "Provide and operate the Movie Sense platform",
            "Authenticate users and process subscriptions and payments",
            "Stream video content",
            "Improve platform performance and reliability",
            "Personalise user experiences",
            "Provide customer support",
            "Detect fraud or unauthorised activity",
            "Send service-related notifications",
            "Comply with legal obligations",
          ]}
        />
        <Highlight>
          We do not sell your personal information to third parties.
        </Highlight>
      </Section>

      <Section number="Section 04" id="s4" title="Children's Privacy">
        <P>
          Movie Sense is designed to be suitable for general audiences and may
          include kid-friendly profiles and content. Parents or guardians are
          responsible for supervising children&apos;s use of the platform.
        </P>
        <P>
          We do not knowingly collect personal information from children under the
          age required by applicable law without appropriate parental consent.
        </P>
        <P>
          If you believe a child has provided personal information to us
          improperly, please contact us and we will take appropriate action.
        </P>
      </Section>

      <Section number="Section 05" id="s5" title="Sharing of Information">
        <P>
          We may share information with trusted third parties who help us operate
          our services, including:
        </P>
        <List
          items={[
            "Payment processors",
            "Cloud hosting providers",
            "Video streaming providers",
            "Analytics providers",
            "Customer support services",
          ]}
        />
        <P>
          These providers are only given access to information necessary to
          perform their services and are required to protect your data.
        </P>
        <P>
          We may also disclose information if required by law, to protect our
          rights or users, or in connection with a business transfer, merger, or
          acquisition.
        </P>
      </Section>

      <Section number="Section 06" id="s6" title="Data Storage & Security">
        <P>
          We use commercially reasonable safeguards to protect your information,
          including:
        </P>
        <List
          items={[
            "Encrypted connections (HTTPS)",
            "Secure authentication systems",
            "Restricted administrative access",
            "Monitoring and security controls",
          ]}
        />
        <P>
          However, no method of electronic storage or internet transmission is
          completely secure.
        </P>
      </Section>

      <Section number="Section 07" id="s7" title="International Data Transfers">
        <P>
          Your information may be stored and processed in countries outside your
          jurisdiction, including Australia, the United States, and other regions
          where our service providers operate.
        </P>
        <P>
          By using Movie Sense, you consent to these transfers where permitted by
          law.
        </P>
      </Section>

      <Section number="Section 08" id="s8" title="Your Rights & Choices">
        <P>Depending on your location, you may have rights to:</P>
        <List
          items={[
            "Access your personal information",
            "Correct inaccurate information",
            "Request deletion of your account",
            "Withdraw consent where applicable",
            "Request a copy of your data",
          ]}
        />
        <P>
          Users may request account deletion directly through the app or by
          contacting support. Please note that some information may be retained
          where legally required.
        </P>
      </Section>

      <Section number="Section 09" id="s9" title="Account Deletion">
        <P>
          You may delete your Movie Sense account at any time through the
          application settings or by contacting support. Deleting your account
          may:
        </P>
        <List
          items={[
            "Remove your access to subscriptions",
            "Delete viewing history and profiles",
            "Remove stored personal information, subject to legal retention requirements",
          ]}
        />
        <P>
          Subscription cancellations may need to be completed separately depending
          on the platform used for purchase.
        </P>
      </Section>

      <Section number="Section 10" id="s10" title="Cookies & Tracking Technologies">
        <P>Our website and apps may use cookies and similar technologies to:</P>
        <List
          items={[
            "Keep users signed in",
            "Remember preferences",
            "Improve performance",
            "Analyse usage trends",
          ]}
        />
        <P>
          You can control cookies through your browser settings where applicable.
        </P>
      </Section>

      <Section number="Section 11" id="s11" title="Third-Party Services">
        <P>
          Movie Sense may contain links or integrations with third-party
          services. We are not responsible for the privacy practices of
          third-party websites or services. Users should review the privacy
          policies of those providers separately.
        </P>
      </Section>

      <Section number="Section 12" id="s12" title="Changes to This Privacy Policy">
        <P>
          We may update this Privacy Policy from time to time. Changes become
          effective when posted on this page. Continued use of Movie Sense after
          changes are posted constitutes acceptance of the revised policy.
        </P>
      </Section>

      <Section number="Section 13" id="s13" title="Contact Us">
        <P>
          If you have questions about this Privacy Policy or your data, please
          contact us:
        </P>
        <ContactCard />
      </Section>
    </LegalLayout>
  );
}

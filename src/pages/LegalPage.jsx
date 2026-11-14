import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FileText, LifeBuoy, Mail, MessageCircle, ChevronRight } from "lucide-react";
import "./LegalPage.css";

const updated = "14 November 2026";

const content = {
  terms: {
    icon: FileText,
    title: "Terms & Conditions",
    intro: "These terms explain the rules for using HELMEnt. By creating an account or using the platform, you agree to follow them. If you do not agree, please do not use the service.",
    sections: [
      ["1. About HELMEnt", "HELMEnt is a task and referral rewards platform. It allows registered users to view available activities, submit eligible task evidence, invite other users and request a withdrawal when the stated requirements are met. HELMEnt is not a bank, investment product, savings scheme or promise of income."],
      ["2. Accounts and eligibility", "You must provide accurate registration information, keep your login credentials secure and use only one account unless HELMEnt expressly permits otherwise. You are responsible for activity carried out through your account. We may restrict or suspend accounts where information is false, activity is abusive or these terms are breached."],
      ["3. Tasks and rewards", "Task availability, instructions and reward amounts are shown on the platform and may change for future participation. A task reward is not earned merely by opening or submitting a task. Submissions may be reviewed, rejected or returned for correction. Rewards are credited only after the required review and approval. Duplicate, fabricated, misleading or automated submissions may be rejected."],
      ["4. Referrals", "Referral rewards apply only to genuine, eligible referrals who register through a valid referral link and satisfy the platform's verification requirements. Self-referrals, duplicate accounts, artificial sign-ups and attempts to manipulate the referral system are not eligible. Referral rewards are credited only after review and approval."],
      ["5. Withdrawals", "The current withdrawal range is ₦2,000 to ₦50,000 per request. To qualify, an account must satisfy the eligibility checks displayed on the platform, including the required approved tasks, valid referrals, social task and available balance. Every request is subject to review. The current process is manually reviewed and paid by the HELMEnt team; an automated payout service is not currently promised. Processing estimates are not guarantees and may be affected by verification, banking or operational delays. Incorrect bank details may delay or prevent payment."],
      ["6. Prohibited activity", "You must not create fake accounts, use bots, impersonate another person, submit false evidence, interfere with the platform, exploit technical errors or attempt to access another user's account or data. HELMEnt may reverse unearned rewards, reject submissions or suspend accounts where abuse is reasonably suspected."],
      ["7. Changes and availability", "We may update tasks, reward values, eligibility requirements, features or these terms. Changes will be published on the platform. We may temporarily suspend features for maintenance, security or operational reasons. We will not represent pending or unapproved rewards as guaranteed cash."],
      ["8. Limitation and responsibility", "The platform is provided on an availability basis. To the extent permitted by applicable law, HELMEnt is not responsible for indirect losses, third-party service interruptions, mobile network failures or delays outside its reasonable control. Nothing in these terms excludes rights or responsibilities that cannot lawfully be excluded."],
      ["9. Contact and governing rules", "Questions about these terms can be raised through the Help & Support page. These terms are intended to operate consistently with applicable laws of the Federal Republic of Nigeria. Any mandatory consumer or privacy rights remain unaffected."]
    ]
  },
  privacy: {
    icon: ShieldCheck,
    title: "Privacy Policy",
    intro: "This policy describes the personal information HELMEnt uses to operate accounts, review activities, manage referrals and process withdrawal requests.",
    sections: [
      ["1. Information we collect", "Depending on how you use HELMEnt, information may include your email address and account/profile details; referral codes and referral relationships; task selections, submissions and review outcomes; reward and withdrawal records; and bank name, account name and account number supplied when you request a withdrawal. Do not submit passwords, card PINs, OTPs or other secret banking credentials."],
      ["2. How we use information", "We use information to create and secure accounts, display balances and tasks, validate referrals, review task evidence, check withdrawal eligibility, process manual payouts, prevent fraud, respond to support requests and maintain platform security."],
      ["3. Service providers and sharing", "HELMEnt uses Supabase for database and authentication services and GitHub Pages for website hosting. Information may be processed by providers as needed to deliver those services. We do not sell personal information. We may disclose limited information where required by law, to protect users or the platform, or to complete a withdrawal through the relevant financial institution."],
      ["4. Bank information", "Bank details are requested only when you submit a withdrawal request and are used to identify the destination account for manual payment and to maintain withdrawal records. Never share your banking password, card PIN or one-time passcode with HELMEnt."],
      ["5. Security and retention", "We use access controls and database security rules intended to limit access to account information. No online service can guarantee absolute security. We retain information for as long as reasonably needed to operate the account, maintain reward and transaction records, resolve disputes, prevent abuse and meet legal obligations."],
      ["6. Your choices and rights", "You may contact HELMEnt through the Help & Support page to ask about the personal information associated with your account or request correction or deletion where applicable. Some records may need to be retained for security, accounting, dispute resolution or legal reasons."],
      ["7. Children and account accuracy", "The service is not designed for children under 18. Users must provide accurate information and must not use another person's identity or bank details without lawful authority."],
      ["8. Policy updates", "We may revise this policy when platform features or legal requirements change. The latest version and its update date will be shown on this page."]
    ]
  }
};

const supportFaqs = [
  ["I completed a task but did not receive a reward.", "Task rewards are credited after review and approval. Check the task status in your dashboard. If it remains pending or you believe an approved reward is missing, contact the HELMEnt team with your registered email and task details."],
  ["My referral has not been approved.", "A referral must be genuine and meet the platform's eligibility checks. Self-referrals, duplicate registrations and artificial sign-ups do not qualify. Referral rewards are credited after approval."],
  ["Why can't I withdraw yet?", "Your dashboard shows the current eligibility checks. You must meet the required approved task count, valid referral count, social task requirement and minimum available balance before requesting a withdrawal."],
  ["How are withdrawals paid?", "Withdrawal requests are reviewed by an administrator and paid manually. Make sure the bank details you enter are accurate. Automated payouts are not currently available."],
  ["I cannot log in or confirm my email.", "Check that you entered the email used to register, look in your spam folder for the confirmation message and use the password reset option if needed."]
];

export default function LegalPage({ page }) {
  const isSupport = page === "support";
  const data = content[page];
  const Icon = isSupport ? LifeBuoy : data.icon;
  return <main className="legal-shell">
    <div className="legal-top container">
      <Link to="/" className="legal-back"><ArrowLeft size={17}/> Back to HELMEnt</Link>
      <span className="legal-brand"><span className="legal-mark">H</span> HELMEnt</span>
    </div>
    <section className="legal-hero container">
      <div className="legal-icon"><Icon size={25}/></div>
      <p className="legal-kicker">HELMEnt · {isSupport ? "Help centre" : "Platform information"}</p>
      <h1>{isSupport ? "How can we help?" : data.title}</h1>
      <p className="legal-intro">{isSupport ? "Find answers to common questions about tasks, referrals, rewards and withdrawals." : data.intro}</p>
      <small>Last updated: {updated}</small>
    </section>
    <section className="legal-content container">
      {isSupport ? <>
        <div className="legal-section">
          <h2>Frequently asked questions</h2>
          {supportFaqs.map(([q,a])=><details className="support-item" key={q}><summary>{q}<ChevronRight size={18}/></summary><p>{a}</p></details>)}
        </div>
        <div className="support-contact">
          <MessageCircle size={23}/>
          <div><h2>Still need help?</h2><p>Use the official HELMEnt support channel shared by the platform administrator. Include your registered email, a short description of the issue and any relevant task or withdrawal reference. Never send your password, OTP or card PIN.</p></div>
        </div>
      </> : <>
        {data.sections.map(([heading,body])=><article className="legal-section" key={heading}><h2>{heading}</h2><p>{body}</p></article>)}
        <div className="legal-note"><ShieldCheck size={19}/><p>This page is a general platform policy summary, not legal advice. If you have a legal concern, seek advice from a qualified professional.</p></div>
      </>}
    </section>
    <footer className="legal-footer container"><span>© {new Date().getFullYear()} HELMEnt. All rights reserved.</span><nav><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/support">Support</Link></nav></footer>
  </main>;
}

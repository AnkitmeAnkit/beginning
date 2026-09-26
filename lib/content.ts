export type Playbook = {
  slug: string;
  title: string;
  shortTitle: string;
  promise: string;
  description: string;
  price: number;
  status: "available" | "preorder" | "waitlist";
  statusLabel: string;
  format: string;
  duration: string;
  includes: string[];
  accent: "blue" | "yellow" | "coral";
};

export const playbooks: Playbook[] = [
  {
    slug: "day-one-execution-system",
    title: "Day One Execution System",
    shortTitle: "Day One",
    promise: "Turn a vague goal into visible proof before the day ends.",
    description: "A bottom-to-top execution guide for choosing a finish line, removing drag, planning the first proof, and closing the loop without building a complicated productivity system.",
    price: 49900,
    status: "available",
    statusLabel: "Available now",
    format: "PDF + editable templates",
    duration: "One focused afternoon",
    includes: ["31-page practical guide", "Outcome-to-proof worksheet", "Friction audit", "Daily closing ritual", "Lifetime updates"],
    accent: "blue",
  },
  {
    slug: "founder-focus-sprint",
    title: "Founder Focus Sprint",
    shortTitle: "Focus Sprint",
    promise: "Protect one meaningful outcome across five noisy working days.",
    description: "A five-day operating rhythm for founders and independent builders who need to keep customer work, product decisions, and delivery moving without losing the week to reactive work.",
    price: 29900,
    status: "preorder",
    statusLabel: "Pre-order · ships 15 Oct",
    format: "PDF + sprint board",
    duration: "Five working days",
    includes: ["Five daily briefings", "Focus budget", "Interruption protocol", "Friday proof review", "Pre-order price lock"],
    accent: "yellow",
  },
  {
    slug: "ai-workday-os",
    title: "AI Workday OS",
    shortTitle: "AI Workday OS",
    promise: "Give AI the repeatable work. Keep judgment with the human.",
    description: "A practical operating system for mapping recurring work, assigning the right jobs to AI, reviewing outputs, and building a safer everyday automation habit.",
    price: 0,
    status: "waitlist",
    statusLabel: "Research waitlist",
    format: "Guide + prompt library",
    duration: "Coming soon",
    includes: ["Work mapping canvas", "Delegation decision tree", "Review checklist", "Reusable prompt patterns", "Launch pricing for waitlist members"],
    accent: "coral",
  },
];

export type Article = {
  slug: string;
  title: string;
  dek: string;
  readTime: string;
  published: string;
  category: string;
  body: { heading: string; paragraphs: string[] }[];
};

export const articles: Article[] = [
  {
    slug: "the-first-proof-rule",
    title: "The first-proof rule: make progress visible before making the plan bigger",
    dek: "A small piece of evidence beats a beautifully organised intention.",
    readTime: "6 min read",
    published: "24 September 2026",
    category: "Execution",
    body: [
      { heading: "Plans feel productive because they reduce uncertainty", paragraphs: ["Planning is useful until it becomes a way to avoid exposure. A plan can stay perfect because reality has not had a chance to disagree with it. The first proof is the smallest real-world result that can answer a meaningful question.", "For a writer, it may be the opening section sent to one reader. For a product team, it may be a working path through the riskiest screen. For a consultant, it may be a one-page diagnosis that a client can correct."] },
      { heading: "Choose evidence, not activity", paragraphs: ["“Work on the landing page” describes activity. “Publish one screen that lets a visitor understand the offer and join the waitlist” describes evidence. The second statement names what will exist, who can use it, and what it proves.", "Before adding another task, ask: what is the smallest thing I could finish today that would make the project more true?"] },
      { heading: "Close with a decision", paragraphs: ["Proof without review becomes clutter. At the end of the work block, write down what the proof changed: continue, revise, or stop. That decision is the bridge between one completed loop and the next."] },
    ],
  },
  {
    slug: "productivity-debt",
    title: "Productivity debt is the cost of keeping too many promises open",
    dek: "Every unfinished commitment quietly taxes attention. Here is how to close the account.",
    readTime: "5 min read",
    published: "18 September 2026",
    category: "Focus",
    body: [
      { heading: "Open promises consume working memory", paragraphs: ["A task list is not just a record. It is a collection of negotiations with your future self. When every item remains equally alive, your attention keeps paying interest.", "Productivity debt grows when commitments are captured faster than they are clarified, declined, delegated, or completed."] },
      { heading: "Run a promise audit", paragraphs: ["List every active promise. For each one, name the person affected, the next visible proof, and the date on which you will either deliver or renegotiate. If none of those fields can be named, the promise is not ready for your active list."] },
      { heading: "A shorter list is a stronger contract", paragraphs: ["Deleting work is not giving up. It is returning credibility to the commitments that remain. Keep the list small enough that each item can still mean something."] },
    ],
  },
  {
    slug: "ai-with-a-finish-line",
    title: "Use AI with a finish line, not an open-ended prompt",
    dek: "The quality of AI-assisted work improves when the review condition is decided first.",
    readTime: "7 min read",
    published: "10 September 2026",
    category: "AI at work",
    body: [
      { heading: "Define done before delegation", paragraphs: ["An open-ended prompt asks the model to decide both the destination and the route. That is rarely what you want for important work. State the audience, the decision the output should support, the evidence it may use, and the condition that makes the work acceptable."] },
      { heading: "Keep judgment outside the model", paragraphs: ["AI can draft, transform, compare, and inspect. The human should still own the trade-off, the claim, and the consequence. Review facts against primary sources and keep irreversible actions behind explicit approval."] },
      { heading: "Build a repeatable handoff", paragraphs: ["Save the brief, the acceptable examples, and the review checklist—not just the prompt. A reliable AI workflow is a small operating procedure with a clear finish line."] },
    ],
  },
];

export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}

// Self-test fixture: every guard in tests/unit must report each planted defect.
export const plantedContent = {
  profile: { headline: 'TODO: write headline' },
  notes: ['Lorem ipsum dolor sit amet', 'Value to CONFIRM with Vincent', 'Needs APPROVAL first'],
  emoji: {
    plain: 'Shipped \u{1F680}',
    heartWithSelector: 'Thanks ❤️',
    keycap: 'Step 1⃣',
    flag: 'Made in \u{1F1F5}\u{1F1ED}',
  },
  caseStudies: [{ slug: 'planted', title: 'Planted Client Co rollout', approved: false }],
};

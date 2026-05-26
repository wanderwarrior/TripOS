// Plain constants/types for proposal branding. Lives outside the
// `"use server"` action file because Next.js forbids server modules from
// exporting anything other than async functions.

export const PROPOSAL_THEMES = ["classic", "editorial", "minimal"] as const;
export const COVER_STYLES = ["photo", "gradient", "solid"] as const;

export type ProposalTheme = (typeof PROPOSAL_THEMES)[number];
export type ProposalCoverStyle = (typeof COVER_STYLES)[number];

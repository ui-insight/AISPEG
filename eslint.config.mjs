import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    // Agent worktrees created by Claude Code background agents — they
    // contain their own .next/ build output and we don't want to lint
    // sibling agents' artifacts in this checkout.
    // Test fixtures — committed copies of generated catalogs used by
    // scripts/governance-pr-summary.ts locally; linting them is noisy.
    ignores: [".claude/worktrees/**", ".test-governance/**"],
  },
  ...nextConfig,
  {
    rules: {
      // Enforce accessibility best practices as errors
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/anchor-is-valid": "warn",
    },
  },
];

export default eslintConfig;

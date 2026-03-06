import nextConfig from "eslint-config-next";

const eslintConfig = [
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

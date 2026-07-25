/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // /explore?view=map → strategic-plan map (per ADR 0003).
      // Match the query param explicitly so it wins over the catch-all below.
      {
        source: "/explore",
        has: [{ type: "query", key: "view", value: "map" }],
        destination: "/standards/strategic-plan/map",
        permanent: true,
      },
      // All other /explore traffic → /portfolio. The category filter on
      // /portfolio is the canonical substitute for the retired tiles view.
      {
        source: "/explore",
        destination: "/portfolio",
        permanent: true,
      },
      {
        source: "/explore/:path*",
        destination: "/portfolio",
        permanent: true,
      },
      // Process surfaces moved out of /standards into /coordination (Jul
      // 2026). /standards keeps the reference material — ledger, data
      // model, strategic plan. These four moved wholesale; preserve any
      // link already circulated.
      {
        source: "/standards/intake-crosswalk",
        destination: "/coordination/intake-crosswalk",
        permanent: true,
      },
      {
        source: "/standards/oit-pathway",
        destination: "/coordination/oit-pathway",
        permanent: true,
      },
      {
        source: "/standards/oit-portfolio",
        destination: "/coordination/oit-portfolio",
        permanent: true,
      },
      {
        source: "/standards/operational-excellence",
        destination: "/coordination/operational-excellence",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

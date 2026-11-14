/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the dev server be reached through 127.0.0.1 (e.g. `sbx ports` publishes on it).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

module.exports = nextConfig;

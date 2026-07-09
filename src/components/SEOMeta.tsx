// File: src/components/SEOMeta.tsx
// Usage: <SEOMeta title="..." description="..." />
// Install: npm install react-helmet-async
// Wrap App.tsx with: <HelmetProvider>

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEOMeta: React.FC<SEOMetaProps> = ({
  title = 'WorkSupport360 — Hire Verified MNC IT Experts India',
  description = 'Hire verified MNC IT engineers by the hour, day or month. React, Node.js, AWS, DevOps, Flutter & more. Identity safe. Pay after approval.',
  keywords = 'hire IT freelancer India, MNC engineer for hire, hire React developer India, AWS DevOps engineer, IT consultant on demand India',
  image = 'https://worksupport360.com/og-image.png',
  url = 'https://worksupport360.com',
  type = 'website',
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description"  content={description} />
    <meta name="keywords"     content={keywords} />
    <link rel="canonical"     href={url} />
    <meta property="og:title"       content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image"       content={image} />
    <meta property="og:url"         content={url} />
    <meta property="og:type"        content={type} />
    <meta name="twitter:title"       content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image"       content={image} />
  </Helmet>
);

// ── Page-specific SEO configs ──────────────────────────────────
export const PAGE_SEO = {
  home: {
    title: 'WorkSupport360 — Hire Verified MNC IT Experts | Freelance IT Work India',
    description: 'Hire verified MNC IT engineers for React, Node.js, AWS, DevOps, Flutter by the hour or day. Identity safe. Admin coordinated. Pay after approval. India.',
    keywords: 'hire IT freelancer india, MNC engineer hire, react developer india, aws devops freelancer, nodejs developer hourly india, flutter developer hire',
  },
  register: {
    title: 'Join WorkSupport360 — Register as IT Expert or Client',
    description: 'Register as a freelance IT expert and earn on your free time, or sign up as a client to hire verified MNC engineers. India\'s trusted IT platform.',
    keywords: 'register IT freelancer india, join worksupport360, hire IT expert india, freelance IT work india',
  },
  postRequirement: {
    title: 'Post IT Requirement — Hire MNC Expert Fast | WorkSupport360',
    description: 'Post your IT requirement and get matched with a verified MNC engineer. React, Node.js, AWS, DevOps, Flutter & more. Admin coordinates everything.',
    keywords: 'post IT requirement india, hire react developer, aws engineer on demand, devops consultant india',
  },
};

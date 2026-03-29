# Project Issue Tracker (Retroactive Archive)

This document serves as the official record of all tasks and reported bugs in the Industrialist project. Each point of the technical specification has been converted into a formal "Issue" with a unique ID for tracking in the Changelog.

## Section 1: Architecture and Infrastructure
- **#23 (1.1):** Architecture documentation (README)
- **#24 (1.2):** Technology versions overview
- **#25 (1.3):** Project directory structure
- **#26 (1.4):** Separation of logic from UI
- **#27 (1.5):** Separation of static files
- **#28 (1.6):** Production configuration template (.env.production.example)
- **#29 (1.7):** Protection of sensitive data in the repository

## Section 2: Dependencies and Packages
- **#30 (2.1-2.2):** Management of external libraries and versions
- **#32 (2.3):** Implementation of lock file (pnpm-lock.yaml)
- **#33 (2.4):** Regular checks for dependency updates
- **#34 (2.5):** Documentation of reasons for using libraries
- **#35 (2.6):** Audit and removal of unused libraries

## Section 3: API and Server
- **#33 (3.1):** Correct HTTP status codes (200, 400, 404, 500)
- **#34 (3.3):** Comprehensible error messages for the client
- **#35 (3.4):** Masking of internal server errors
- **#36 (3.6):** Input data validation (Zod)
- **#37 (3.7):** GZIP compression of server responses

## Section 4: Performance and Formats
- **#38 (4.1):** Image size optimization
- **#39 (4.2):** Conversion of textures to modern format (WebP)
- **#40 (4.3):** Purge of unused CSS/JS
- **#41 (4.5):** Analysis of HTTP request count
- **#42 (4.6):** Implementation of Lazy Loading for heavy components
- **#43 (4.7):** Vercel CDN configuration (assetPrefix)
- **#44 (4.9):** Lighthouse performance audit
- **#45 (4.10):** LCP (Largest Contentful Paint) optimization

## Section 5: Optimization and Cache
- **#46 (5.1-5.2):** Cache-Control headers for static files
- **#47 (5.3):** Verification of cache functionality
- **#48 (5.4):** Cache invalidation upon file changes (versioning)
- **#49 (5.5):** Explicit Edge CDN cache configuration

## Section 6: SEO and Accessibility
- **#50 (6.3):** Semantic heading structure (h1-h3)
- **#51 (6.4):** Alt attributes and aria-labels for visual elements
- **#52 (6.5):** Responsive design and mobile usability

## Section 7: Security
- **#54 (7.1):** User input validation (Auth/Save)
- **#55 (7.2):** Protection against XSS (Sanitization/CSP)
- **#56 (7.3):** Protection against CSRF (Origin check)
- **#57 (7.5):** Strict rejection of invalid data (400)
- **#58 (7.6):** Secure and HttpOnly attributes for session cookies
- **#59 (7.7):** OWASP Top 10 security audit

## Section 8: Testing
- **#60 (8.1-8.2):** Cross-browser and physical mobile testing
- **#61 (8.3):** Invalid input tests (API Rejection)
- **#62 (8.4):** Stress tests (Artillery/K6)
- **#63 (8.5):** Server performance tests
- **#64 (8.6):** Error recording in the issue tracker

## Section 9: Monitoring
- **#65 (9.2):** Log format standardization (Timestamp/Error Type)
- **#66 (9.3):** Log analysis tool integration (Sentry)
- **#94 (9.4):** Player count and game metrics monitoring (Implemented)
- **#68 (9.6):** Uptime monitoring (website availability)

## Section 10: Deployment
- **#69 (10.1-10.2):** Production deployment and public URL
- **#70 (10.3):** Deactivation of Debug mode in production
- **#71 (10.4):** CI/CD deployment procedure (GitHub Workflows)
- **#72 (10.5):** Zero-downtime deployment strategy

## Section 11-12: Management and Retrospective
- **#73 (11.1-11.2):** Audit of commit history and authorship
- **#74 (11.5):** Linking bug fixes with commits
- **#75 (12.1-12.7):** Team retrospective (Team Scrapes)

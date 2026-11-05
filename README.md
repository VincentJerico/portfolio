# Portfolio

Vincent Jerico Alcuran's QA portfolio (Next.js, Tailwind, Playwright). See `AGENTS.md` for the working rules.

## Contact form

The `/contact` page shows a "Send a message" form only when `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are all set (see `.env.example`). Messages are sent by
email and rate-limited to 5 per 10 minutes per IP; nothing is stored. Without the variables the form is hidden
and the page keeps its email and social links.

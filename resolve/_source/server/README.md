# ReSolve enquiry delivery

The shared frontend is `resolve/enquiry.js`. All 14 pages use it. Existing profile,
calculator, language and scientific content is unchanged.

The standalone PHP receiver is deployed separately at:

`https://antech.ie/resolve-enquiry.php`

Install `resolve-enquiry.php` next to the existing WordPress `wp-load.php` in
Antech's public document root. It uses the site's existing `wp_mail` transport.
GitHub Pages cannot execute PHP; the copy here is the maintained source, not the
runtime deployment. No WordPress core, theme or plugin file is changed.

## Behaviour

- GET with an allowed Origin returns a signed, short-lived submission token.
- GET without Origin is a read-only health check and returns no token.
- POST accepts only validated form fields and a valid signed token.
- The recipient is fixed to `info@antech.ie`. The visitor's email is Reply-To.
- Origin checks, a honeypot, size limits and rate limits constrain submissions.
- Token reuse deduplicates retries after an uncertain network result.
- A failed transport returns an error; the frontend keeps the visitor's details
  and provides an email link containing those details.
- Tokens and deduplication/rate-limit records expire. Form contents are not saved
  as WordPress posts or public files.

## Validation, 5 November 2026

- PHP 8.3 syntax check and JavaScript syntax check passed.
- 17 receiver checks passed using a local stub mail transport, including origin
  rejection, tampering, header injection, retry deduplication and mail failure.
- 22 browser checks passed on English desktop and Polish mobile, with all mail
  requests intercepted locally.
- One real candidate-form submission from the production origin returned a
  receipt. cPanel Track Delivery confirmed successful remote SMTP delivery to
  `antech-ie.mail.protection.outlook.com`, recipient `info@antech.ie`, result
  `Accepted`, mail server event `1xOwCu-0000000E9vT-46fV`.
- Mail-server acceptance is confirmed; it is not a claim that a colleague opened
  the message or that Microsoft placed it in a particular inbox folder.

## Deployment and rollback

Deploy and check the receiver first. Publish the static frontend only after the
receiver's live health, CORS and delivery checks pass. Keep both deployed versions
aligned when changing the endpoint contract.

To roll back the static change, revert its Git commit through the normal Pages
release process. After the frontend rollback, the standalone receiver can be
removed from the hosting document root. No shared WordPress settings need to be
reverted. The previous Web3Forms route was failing during the observed test.

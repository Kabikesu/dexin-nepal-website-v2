/**
 * Contact form handler
 *
 * Validates the form and opens the visitor's email application with the
 * submitted information. This does not send the email directly from the site.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");

  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    // Ask the browser to validate required fields before preparing the email.
    if (!form.reportValidity()) {
      status.textContent = "Please complete the required fields.";
      return;
    }

    const data = new FormData(form);
    const name = data.get("name").trim();
    const email = data.get("email").trim();
    const organisation = data.get("organisation").trim();
    const subject = data.get("subject").trim();
    const message = data.get("message").trim();

    // Build a readable email body from the submitted form fields.
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      organisation ? `Organisation: ${organisation}` : null,
      "",
      message
    ]
      .filter(Boolean)
      .join("\n");

    const href =
      "mailto:dexin_nepal@dxn2u.com,admin_nepal@dxn2u.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    status.textContent = "Opening your email application…";
    window.location.href = href;
  });
});

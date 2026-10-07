(() => {
  const DATA_URL = "data/vacancies.json";
  const list = document.getElementById("vacancy-list");
  const filters = [...document.querySelectorAll("[data-vacancy-filter]")];
  if (!list) return;

  let vacancies = [];
  let activeFilter = "all";

  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  const getEffectiveStatus = vacancy => {
    if (vacancy.status === "open" && vacancy.deadline) {
      const deadline = new Date(vacancy.deadline + "T23:59:59");
      const now = new Date();
      if (deadline < now) return "closed";
    }
    return vacancy.status || "open";
  };

  const isClosingSoon = vacancy => {
    if (getEffectiveStatus(vacancy) !== "open" || !vacancy.deadline) return false;
    const deadline = new Date(vacancy.deadline + "T23:59:59");
    const days = Math.ceil((deadline - new Date()) / 86400000);
    return days >= 0 && days <= 14;
  };

  const statusLabel = status => ({
    open: "OPEN POSITION",
    "closing-soon": "CLOSING SOON",
    closed: "APPLICATION CLOSED",
    selected: "SELECTION COMPLETED",
    fulfilled: "POSITION FILLED"
  }[status] || "OPEN POSITION");

  const formatDate = value => {
    if (!value) return "To be announced";
    const date = new Date(value + "T00:00:00");
    return Number.isNaN(date.getTime()) ? "To be announced" : new Intl.DateTimeFormat("en-GB", {
      day:"2-digit", month:"short", year:"numeric"
    }).format(date);
  };

  const processClass = status => status || "pending";
  const processLabel = status => ({
    pending: "Pending",
    active: "In progress",
    completed: "Completed",
    skipped: "Skipped"
  }[status] || "Pending");

  const matchesFilter = vacancy => {
    const status = getEffectiveStatus(vacancy);
    if (activeFilter === "all") return true;
    if (activeFilter === "open") return status === "open";
    if (activeFilter === "closing-soon") return isClosingSoon(vacancy);
    return ["closed","selected","fulfilled"].includes(status);
  };

  const render = () => {
    const visible = vacancies.filter(v => v.published !== false && matchesFilter(v));
    if (!visible.length) {
      list.innerHTML = '<div class="vacancy-empty"><strong>No vacancies in this view.</strong><p>Check the other filters or update the vacancy data when a new position becomes available.</p></div>';
      return;
    }

    list.innerHTML = visible.map(vacancy => {
      const status = getEffectiveStatus(vacancy);
      const displayStatus = isClosingSoon(vacancy) ? "closing-soon" : status;
      const process = Array.isArray(vacancy.selectionProcess) ? vacancy.selectionProcess : [];
      const subject = encodeURIComponent(`Application for ${vacancy.title} Position`);
      const canApply = status === "open";
      const action = canApply
        ? `<a class="button button-primary" href="mailto:${escapeHtml(vacancy.applicationEmail || "dexin_nepal@dxn2u.com")}?subject=${subject}">Apply Now <span>→</span></a>`
        : "";
      const currentStep = process.find(step => step.status === "active")
        || process.find(step => step.status === "pending")
        || process[process.length - 1]
        || null;
      const currentProcessMarkup = currentStep
        ? `<div class="vacancy-current-process">
            <span class="process-dot process-dot-${escapeHtml(processClass(currentStep.status))}" aria-hidden="true"></span>
            <span><strong>Current Process:</strong> ${escapeHtml(currentStep.name)}</span>
            <small>${escapeHtml(processLabel(currentStep.status))}</small>
          </div>`
        : "";

      return `<article class="vacancy-card reveal is-visible">
        <div class="vacancy-header">
          <div>
            <span class="vacancy-status vacancy-status-${escapeHtml(displayStatus)}">${escapeHtml(statusLabel(displayStatus))}</span>
            <h3>${escapeHtml(vacancy.title)}</h3>
            <p class="vacancy-meta">
              <span>${escapeHtml(vacancy.department)}</span>
              <span>${escapeHtml(vacancy.location || "Kapilvastu, Nepal")}</span>
              <span>${escapeHtml(vacancy.employment || "Full-time")}</span>
              ${vacancy.openings > 1 ? `<span>${escapeHtml(vacancy.openings)} openings</span>` : ""}
            </p>
          </div>
        </div>

        <div class="vacancy-summary">
          <div><span>Experience</span><strong>${escapeHtml(vacancy.experience || "As per role")}</strong></div>
          <div><span>Application Deadline</span><strong>${escapeHtml(formatDate(vacancy.deadline))}</strong></div>
        </div>

        <div class="vacancy-actions">
          <button class="button button-secondary vacancy-details-toggle" type="button" aria-expanded="false">View Details <span>+</span></button>
          ${canApply ? action : ""}
        </div>

        <div class="vacancy-details" hidden>
          <div class="vacancy-detail-section"><h4>Job Description</h4><p>${escapeHtml(vacancy.details?.jobDescription || "Detailed job description will be provided by HR for this position.")}</p></div>
          <div class="vacancy-detail-section"><h4>Job purpose:</h4><p>${escapeHtml(vacancy.details?.jobPurpose || "To effectively perform the responsibilities of this position and support the objectives of the relevant department.")}</p></div>
          <div class="vacancy-detail-section"><h4>Roles and Responsibilities:</h4>${Array.isArray(vacancy.details?.responsibilities) && vacancy.details.responsibilities.length ? `<ul>${vacancy.details.responsibilities.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>Role-specific responsibilities will be provided by HR.</p>"}</div>
          <div class="vacancy-detail-section"><h4>Education &amp; Experience</h4><p>${escapeHtml(vacancy.details?.educationExperience || vacancy.experience || "As per role requirements.")}</p></div>
          <div class="vacancy-detail-section"><h4>Skills and Competencies:</h4>${Array.isArray(vacancy.details?.skills) && vacancy.details.skills.length ? `<ul>${vacancy.details.skills.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>Role-specific skills and competencies will be provided by HR.</p>"}</div>
          <div class="vacancy-detail-section vacancy-additional-info"><h4>Additional Information</h4><p>Any telephone enquiries/and or attempts to apply undue influence will result disqualification of candidates. Only short-listed candidates will be contacted for the selection process. Dexin Manufacturing Nepal reserves the right to reject any or all applications without assigning any reasons.</p></div>
        </div>

        ${canApply ? `<div class="vacancy-current-process-wrap">${currentProcessMarkup}</div>` : ""}
      </article>`;
    }).join("");
  };

  const load = async () => {
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error("Unable to load vacancy data");
      const data = await response.json();
      vacancies = Array.isArray(data.vacancies) ? data.vacancies : [];
      const defaultEmail = data.settings?.applicationEmail || "dexin_nepal@dxn2u.com";
      vacancies = vacancies.map(v => ({...v, applicationEmail: v.applicationEmail || defaultEmail}));
      render();
    } catch (error) {
      list.innerHTML = '<div class="vacancy-empty"><strong>Vacancies could not be loaded.</strong><p>Please try again later or contact Dexin Manufacturing Nepal.</p></div>';
      console.error("Careers vacancy data:", error);
    }
  };

  list.addEventListener("click", event => {
    const button = event.target.closest(".vacancy-details-toggle");
    if (!button) return;
    const card = button.closest(".vacancy-card");
    const details = card?.querySelector(".vacancy-details");
    if (!details) return;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    details.hidden = expanded;
    button.innerHTML = expanded ? "View Details <span>+</span>" : "Hide Details <span>−</span>";
  });

  filters.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.vacancyFilter || "all";
      filters.forEach(item => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  load();
})();

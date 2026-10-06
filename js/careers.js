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
      const completedCount = process.filter(step => step.status === "completed").length;
      const progressText = process.length ? `${completedCount}/${process.length} stages completed` : "Process to be updated";
      const subject = encodeURIComponent(`Application for ${vacancy.title} Position`);
      const canApply = status === "open";
      const action = canApply
        ? `<a class="button button-primary" href="mailto:${escapeHtml(vacancy.applicationEmail || "dexin_nepal@dxn2u.com")}?subject=${subject}">Apply Now <span>→</span></a>`
        : "";
      const processMarkup = process.length
        ? process.map(step => `<li class="process-step process-${escapeHtml(processClass(step.status))}">
            <span class="process-dot" aria-hidden="true"></span>
            <span>${escapeHtml(step.name)}</span>
            <small>${escapeHtml(processLabel(step.status))}</small>
          </li>`).join("")
        : '<li class="process-step"><span>Selection process will be updated by HR.</span></li>';

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
          ${action}
        </div>

        <div class="vacancy-summary">
          <div><span>Experience</span><strong>${escapeHtml(vacancy.experience || "As per role")}</strong></div>
          <div><span>Application Deadline</span><strong>${escapeHtml(formatDate(vacancy.deadline))}</strong></div>
          <div><span>Selection Progress</span><strong>${escapeHtml(progressText)}</strong></div>
        </div>

        <div class="vacancy-grid">
          <div>
            <h4>Position Details</h4>
            <p>${escapeHtml(vacancy.remarks || "Please refer to the role requirements during the application process.")}</p>
          </div>
          <div>
            <h4>Selection Process</h4>
            <ol class="selection-process">${processMarkup}</ol>
          </div>
        </div>

        ${canApply ? `<div class="vacancy-apply">
          <div>
            <strong>Interested in joining Dexin?</strong>
            <p>Please send your updated CV and a brief cover letter for consideration.</p>
          </div>
          <a class="button button-secondary" href="mailto:${escapeHtml(vacancy.applicationEmail || "dexin_nepal@dxn2u.com")}?subject=${subject}">Send Application <span>→</span></a>
        </div>` : ""}
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

  filters.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.vacancyFilter || "all";
      filters.forEach(item => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  load();
})();

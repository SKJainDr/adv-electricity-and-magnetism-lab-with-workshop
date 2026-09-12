/*
 * Renders a course's teacher-maintained "Notes & Suggested Links" section.
 *
 * The teacher maintains their OWN folder per course at:
 *     /teacher-notes/<COURSE_CODE>/
 * containing:
 *     links.txt   - one web link (or plain note) per line, see format below
 *     files/      - any actual files to share (PDF, DOCX, PPTX, images...) -
 *                   just add/remove files here, nothing else to edit
 *
 * A teacher only ever needs to touch their OWN course's folder - no other
 * file on the site needs to change, and nothing needs to be rebuilt. This
 * script re-reads both live every time the course page is opened.
 *
 * links.txt FORMAT (one resource per line):
 *     Title of the resource | https://full-url-here
 * - Lines starting with "#" are comments/instructions and are ignored.
 * - Blank lines are ignored.
 * - A line with a title but no "| URL" part is shown as a plain note
 *   (useful for "See me in office hours for the scanned copy" type entries).
 * - Links can point anywhere, including a GitHub Pages site the teacher
 *   maintains separately.
 *
 * files/ folder: every file the teacher uploads there is listed
 * automatically as a downloadable resource, using the GitHub API to list
 * the folder's contents (this only works once the site is served from its
 * real GitHub repo - see GITHUB_OWNER/GITHUB_REPO below; when opened
 * locally, or if the API request fails for any reason such as rate
 * limiting, the file list is simply skipped and the links still show).
 */
(function () {
  // Update these two if the repository is ever renamed or moved.
  var GITHUB_OWNER = "SKJainDr";
  var GITHUB_REPO = "DrSKJain-course-contents-2026-27";

  var FILE_ICONS = {
    pdf: "📕", doc: "📘", docx: "📘", ppt: "📙", pptx: "📙",
    xls: "📗", xlsx: "📗", csv: "📊",
    png: "🖼️", jpg: "🖼️", jpeg: "🖼️", gif: "🖼️", webp: "🖼️", svg: "🖼️",
    zip: "🗜️", rar: "🗜️", "7z": "🗜️",
    txt: "📄", md: "📄"
  };

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function iconFor(filename) {
    var ext = (filename.split(".").pop() || "").toLowerCase();
    return FILE_ICONS[ext] || "📎";
  }

  function linkCardHtml(title, url) {
    var safeUrl = url.replace(/"/g, "%22");
    return (
      '<a class="res-card" href="' + safeUrl + '" target="_blank" rel="noopener">' +
      '<div class="icon">🔗</div><div class="label">' + escapeHtml(title) + "</div>" +
      '<div class="dl">Open &rarr;</div></a>'
    );
  }

  function noteCardHtml(title) {
    return (
      '<div class="res-card" style="cursor:default;">' +
      '<div class="icon">📌</div><div class="label">' + escapeHtml(title) + "</div></div>"
    );
  }

  function fileCardHtml(name, downloadUrl) {
    return (
      '<a class="res-card" href="' + downloadUrl + '" download="' + escapeHtml(name) + '" target="_blank" rel="noopener">' +
      '<div class="icon">' + iconFor(name) + '</div><div class="label">' + escapeHtml(name) + "</div>" +
      '<div class="dl">Download &rarr;</div></a>'
    );
  }

  function parseLinksTxt(text) {
    var lines = text
      .split(/\r?\n/)
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l && l[0] !== "#"; });

    return lines.map(function (line) {
      var bar = line.indexOf("|");
      var title = (bar === -1 ? line : line.slice(0, bar)).trim();
      var url = bar === -1 ? "" : line.slice(bar + 1).trim();
      return { title: title, url: url };
    }).filter(function (r) { return r.title; });
  }

  function render(course, mountId, pathToRoot) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = '<p class="sub">Loading&hellip;</p>';

    var linksPromise = fetch(pathToRoot + "teacher-notes/" + course + "/links.txt", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("not found"); return r.text(); })
      .then(parseLinksTxt)
      .catch(function () { return []; });

    var filesPromise = fetch(
      "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO +
        "/contents/teacher-notes/" + course + "/files",
      { cache: "no-store" }
    )
      .then(function (r) { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list)) return [];
        return list.filter(function (item) {
          return item.type === "file" && item.name.toLowerCase() !== "readme.md";
        });
      })
      .catch(function () { return []; });

    Promise.all([linksPromise, filesPromise]).then(function (results) {
      var links = results[0];
      var files = results[1];

      if (links.length === 0 && files.length === 0) {
        mount.innerHTML =
          '<p class="sub">No additional notes, links or files have been posted for this course yet.</p>';
        return;
      }

      var html = '<div class="resource-grid">';
      links.forEach(function (r) {
        html += r.url ? linkCardHtml(r.title, r.url) : noteCardHtml(r.title);
      });
      files.forEach(function (f) {
        html += fileCardHtml(f.name, f.download_url || f.html_url);
      });
      html += "</div>";
      mount.innerHTML = html;
    });
  }

  window.renderTeacherNotes = render;
})();

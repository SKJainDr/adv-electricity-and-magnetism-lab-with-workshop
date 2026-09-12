/*
 * loadTaskSettings(url)
 * ---------------------
 * Loads a small teacher-editable JSON file of game/workshop target values
 * from the /task-settings/ folder, so a teacher can change what a game or
 * workshop asks students to hit WITHOUT touching any game code - just
 * editing a plain-text JSON file on GitHub.
 *
 * HOW A TEACHER EDITS A TARGET:
 *   1. Open the relevant file in /task-settings/ on GitHub (e.g.
 *      task-settings/mpy351-game2.json).
 *   2. Click the pencil (edit) icon, change a number, commit.
 *   3. Reload the game page - the new target is live immediately. No
 *      rebuild, no other file needs to be touched.
 *   See /task-settings/README.md for the full list of files and what each
 *   value controls.
 *
 * This uses a synchronous XMLHttpRequest (a few KB of JSON, so the
 * blocking read is not noticeable) so the settings are guaranteed to be
 * ready before the rest of a page's inline script runs - no restructuring
 * of existing game logic into callbacks is needed. If the file is
 * missing, unreachable, or contains invalid JSON, an empty object is
 * returned and the game/workshop simply falls back to its own built-in
 * default values - nothing breaks if a settings file hasn't been added
 * or was deleted by mistake.
 */
function loadTaskSettings(url) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // synchronous - intentional, see header above
    xhr.send(null);
    if (xhr.status === 200 || xhr.status === 0) {
      var parsed = JSON.parse(xhr.responseText);
      return parsed && typeof parsed === 'object' ? parsed : {};
    }
  } catch (e) {
    /* missing file, blocked request, or invalid JSON - use defaults */
  }
  return {};
}

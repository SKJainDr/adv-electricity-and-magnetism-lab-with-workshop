/*
 * Graph paste-to-overlay feature.
 *
 * Lets a student paste (Ctrl+V) a screenshot/photo of their camera, CRO or
 * DSO trace directly onto a graph's grid area, so they can line it up with
 * the printed axes and trace the curve by hand. Everything happens in the
 * browser only - no upload, no server, no PDF/subscription service of any
 * kind is involved.
 *
 * Works on every ".graph-canvas-wrap" element produced for each experiment's
 * graph grid (see hooks.py / the experiment markdown files).
 */
(function () {
  function setupGraphWrap(wrap) {
    const canvasWrap = wrap.querySelector(".graph-canvas-wrap");
    const opacitySlider = wrap.querySelector(".graph-opacity");
    const clearBtn = wrap.querySelector(".graph-clear-btn");
    if (!canvasWrap) return;

    canvasWrap.style.position = "relative";
    canvasWrap.style.overflow = "hidden";

    let overlay = null;

    function makeOverlay(src) {
      if (overlay) overlay.remove();
      overlay = document.createElement("img");
      overlay.src = src;
      overlay.className = "graph-pasted-overlay";
      overlay.alt = "Pasted camera/CRO/DSO image (overlaid on the grid)";
      overlay.style.position = "absolute";
      overlay.style.left = "5%";
      overlay.style.top = "5%";
      overlay.style.width = "60%";
      overlay.style.height = "auto";
      overlay.style.opacity = (opacitySlider ? opacitySlider.value : 65) / 100;
      overlay.style.cursor = "move";
      overlay.style.touchAction = "none";
      overlay.style.border = "1px dashed #a8452f";
      overlay.draggable = false;
      canvasWrap.appendChild(overlay);
      makeDraggableAndResizable(overlay, canvasWrap);
    }

    function makeDraggableAndResizable(img, container) {
      let mode = null, startX, startY, startLeft, startTop, startW, startH;

      function onDown(e) {
        const rect = img.getBoundingClientRect();
        const nearRightEdge = e.clientX > rect.right - 18;
        const nearBottomEdge = e.clientY > rect.bottom - 18;
        mode = (nearRightEdge && nearBottomEdge) ? "resize" : "move";
        startX = e.clientX; startY = e.clientY;
        startLeft = img.offsetLeft; startTop = img.offsetTop;
        startW = img.offsetWidth; startH = img.offsetHeight;
        e.preventDefault();
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      }
      function onMove(e) {
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (mode === "move") {
          img.style.left = (startLeft + dx) + "px";
          img.style.top = (startTop + dy) + "px";
        } else if (mode === "resize") {
          img.style.width = Math.max(40, startW + dx) + "px";
          img.style.height = "auto";
        }
      }
      function onUp() {
        mode = null;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      img.addEventListener("mousedown", onDown);
    }

    canvasWrap.addEventListener("paste", function (e) {
      const items = (e.clipboardData || window.clipboardData).items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = function (ev) { makeOverlay(ev.target.result); };
          reader.readAsDataURL(blob);
          e.preventDefault();
          break;
        }
      }
    });

    if (opacitySlider) {
      opacitySlider.addEventListener("input", function () {
        if (overlay) overlay.style.opacity = opacitySlider.value / 100;
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (overlay) { overlay.remove(); overlay = null; }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".graph-wrap").forEach(setupGraphWrap);
  });
})();

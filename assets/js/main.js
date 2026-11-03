document.documentElement.classList.add("js");

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.getElementById("menu-panel");
  var root = document.documentElement;

  /* ---------------- header state ---------------- */

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------- mobile menu ---------------- */

  var isOpen = false;

  function setMenu(open, returnFocus) {
    if (!toggle || !panel) return;
    isOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-open", open);
    root.classList.toggle("menu-open", open);

    if (open) {
      panel.hidden = false;
    } else {
      panel.hidden = true;
      if (returnFocus !== false) toggle.focus();
    }
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      setMenu(!isOpen);
    });

    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!isOpen || event.key !== "Tab") return;
      var focusable = [toggle].concat(
        Array.prototype.slice.call(panel.querySelectorAll("a, button"))
      );
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var desktop = window.matchMedia("(min-width: 900px)");
    var onChange = function (event) {
      if (event.matches && isOpen) setMenu(false, false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else desktop.addListener(onChange);
  }

  /* ---------------- scroll reveal ---------------- */

  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------------- active section in nav ---------------- */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-desktop a")
  );
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );

  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    var setActive = function (id) {
      navLinks.forEach(function (link) {
        var match = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", match);
        if (match) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------------- mailto composer ---------------- */

  var form = document.getElementById("enquiry");
  var send = document.getElementById("send-mail");

  if (form && send) {
    var base = form.getAttribute("data-mailto");
    var subject = form.getAttribute("data-subject") || "";

    var updateMailto = function () {
      var first = form.elements.first ? form.elements.first.value.trim() : "";
      var last = form.elements.last ? form.elements.last.value.trim() : "";
      var email = form.elements.email ? form.elements.email.value.trim() : "";
      var message = form.elements.message
        ? form.elements.message.value.trim()
        : "";

      var name = [first, last].filter(Boolean).join(" ");
      var body = [name, email, message].filter(Boolean).join("\n\n");
      var href = base + "?subject=" + encodeURIComponent(subject);

      if (body) href += "&body=" + encodeURIComponent(body);
      send.setAttribute("href", href);
    };

    form.addEventListener("input", updateMailto);
    updateMailto();

    send.addEventListener("click", function (event) {
      var email = form.elements.email;
      if (email && email.value.trim() && !email.checkValidity()) {
        event.preventDefault();
        email.reportValidity();
        email.focus();
      }
    });
  }

  /* ---------------- copy email ---------------- */

  var copyButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-copy]")
  );
  var status = document.getElementById("copy-status");

  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy");
      var label = button.getAttribute("data-copied-label") || "Copied";

      var done = function (ok) {
        if (!ok) {
          window.location.href = "mailto:" + value;
          return;
        }
        var original = button.textContent;
        button.textContent = label;
        if (status) status.textContent = label;
        window.setTimeout(function () {
          button.textContent = original;
          if (status) status.textContent = "";
        }, 2200);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(
          function () {
            done(true);
          },
          function () {
            done(false);
          }
        );
      } else {
        var area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (error) {
          ok = false;
        }
        document.body.removeChild(area);
        done(ok);
      }
    });
  });
})();

/* =========================================================
   Ghost Builder — Core App
   Version: 1.0.0
   ========================================================= */

"use strict";

/* =========================================================
   Storage Keys
   ========================================================= */

const GB_KEYS = {
  projects: "ghost_builder_projects",
  currentProject: "ghost_builder_current_project",
  settings: "ghost_builder_settings",
  media: "ghost_builder_media",
  support: "ghost_builder_support",
  published: "ghost_builder_published_",
  selectedMedia: "ghost_builder_selected_media"
};

/* =========================================================
   Storage Helpers
   ========================================================= */

function gbGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.warn("Ghost Builder storage read error:", error);
    return fallback;
  }
}

function gbSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Ghost Builder storage write error:", error);
    gbToast("فضای ذخیره‌سازی مرورگر پر شده است.", "danger");
    return false;
  }
}

function gbRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Ghost Builder storage remove error:", error);
  }
}

/* =========================================================
   Projects
   ========================================================= */

function gbGetProjects() {
  return gbGet(GB_KEYS.projects, []);
}

function gbSaveProjects(projects) {
  return gbSet(GB_KEYS.projects, projects);
}

function gbGetCurrentProject() {
  return gbGet(GB_KEYS.currentProject, null);
}

function gbSetCurrentProject(project) {
  return gbSet(GB_KEYS.currentProject, project);
}

function gbFindProject(id) {
  const projects = gbGetProjects();

  return projects.find(
    project => String(project.id) === String(id)
  ) || null;
}

function gbCreateProject(options = {}) {
  const type = options.type || "website";

  const project = {
    id: Date.now(),
    name: options.name || "پروژه جدید",
    type,
    title: options.title || "پروژه جدید",
    description:
      options.description ||
      "پروژه خود را با Ghost Builder بسازید.",
    button: options.button || "شروع کنید",

    background:
      options.background ||
      "#ffffff",

    primary:
      options.primary ||
      "#7c5cff",

    radius:
      options.radius ??
      18,

    width:
      options.width ||
      390,

    height:
      options.height ||
      700,

    quality:
      options.quality ||
      "Medium",

    resolution:
      options.resolution ||
      "720p",

    elements:
      Array.isArray(options.elements)
        ? options.elements
        : [],

    createdAt:
      options.createdAt ||
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  const projects = gbGetProjects();

  projects.unshift(project);

  gbSaveProjects(projects);
  gbSetCurrentProject(project);

  return project;
}

function gbUpdateProject(project) {
  if (!project || !project.id) {
    return false;
  }

  project.updatedAt = new Date().toISOString();

  const projects = gbGetProjects();

  const index = projects.findIndex(
    item => String(item.id) === String(project.id)
  );

  if (index === -1) {
    projects.unshift(project);
  } else {
    projects[index] = project;
  }

  gbSaveProjects(projects);
  gbSetCurrentProject(project);

  return true;
}

function gbDeleteProject(id) {
  const projects = gbGetProjects();

  const filtered = projects.filter(
    project => String(project.id) !== String(id)
  );

  gbSaveProjects(filtered);

  const current = gbGetCurrentProject();

  if (
    current &&
    String(current.id) === String(id)
  ) {
    gbRemove(GB_KEYS.currentProject);
  }

  return true;
}

function gbDuplicateProject(id) {
  const original = gbFindProject(id);

  if (!original) {
    return null;
  }

  const copy = {
    ...original,
    id: Date.now(),
    name: `${original.name} - کپی`,
    title: `${original.title}`,
    elements: Array.isArray(original.elements)
      ? JSON.parse(JSON.stringify(original.elements))
      : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const projects = gbGetProjects();

  projects.unshift(copy);

  gbSaveProjects(projects);
  gbSetCurrentProject(copy);

  return copy;
}

/* =========================================================
   URL Helpers
   ========================================================= */

function gbParam(name) {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get(name);
}

function gbGo(page, params = {}) {
  const query = new URLSearchParams();

  Object.keys(params).forEach(key => {
    if (
      params[key] !== undefined &&
      params[key] !== null &&
      params[key] !== ""
    ) {
      query.set(key, params[key]);
    }
  });

  const queryString = query.toString();

  window.location.href =
    page +
    (queryString ? "?" + queryString : "");
}

function gbBuilder(id) {
  if (id) {
    gbGo("builder.html", {
      project: id
    });
  } else {
    gbGo("builder.html");
  }
}

function gbPreview(id) {
  if (id) {
    gbGo("preview.html", {
      project: id
    });
  } else {
    gbGo("preview.html");
  }
}

function gbPublish(id, type = "web") {
  const params = {
    type
  };

  if (id) {
    params.project = id;
  }

  gbGo("publish.html", params);
}

/* =========================================================
   Project Type
   ========================================================= */

function gbProjectTypeLabel(type) {
  const labels = {
    website: "وب‌سایت",
    app: "اپلیکیشن",
    game2d: "بازی 2D",
    game3d: "بازی 3D"
  };

  return labels[type] || "پروژه";
}

function gbProjectTypeIcon(type) {
  const icons = {
    website: "🌐",
    app: "📱",
    game2d: "🎮",
    game3d: "🕹️"
  };

  return icons[type] || "📁";
}

/* =========================================================
   Settings
   ========================================================= */

function gbDefaultSettings() {
  return {
    language: "fa",
    unit: "px",

    autosave: true,
    notifications: true,

    quality: "Medium",
    resolution: "720p",

    grid: true,
    snap: true,
    livePreview: true,

    theme: "dark",
    primaryColor: "#7c5cff",
    backgroundColor: "#0b0d14",

    creatorName: "کاربر نمونه",

    confirmDelete: true
  };
}

function gbGetSettings() {
  const saved = gbGet(
    GB_KEYS.settings,
    {}
  );

  return {
    ...gbDefaultSettings(),
    ...saved
  };
}

function gbSaveSettings(settings) {
  return gbSet(
    GB_KEYS.settings,
    settings
  );
}

/* =========================================================
   Theme
   ========================================================= */

function gbApplyTheme() {
  const settings = gbGetSettings();

  const theme = settings.theme;

  document.body.classList.remove("light");

  if (theme === "light") {
    document.body.classList.add("light");
  }

  if (theme === "system") {
    const dark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    if (!dark) {
      document.body.classList.add("light");
    }
  }

  document.documentElement.style.setProperty(
    "--primary",
    settings.primaryColor
  );

  document.documentElement.style.setProperty(
    "--bg",
    settings.backgroundColor
  );
}

function gbSetTheme(theme) {
  const settings = gbGetSettings();

  settings.theme = theme;

  gbSaveSettings(settings);
  gbApplyTheme();
}

/* =========================================================
   Toast
   ========================================================= */

function gbToast(
  message,
  type = "info",
  duration = 2800
) {
  let container =
    document.querySelector(
      ".toast-container"
    );

  if (!container) {
    container =
      document.createElement("div");

    container.className =
      "toast-container";

    document.body.appendChild(
      container
    );
  }

  const toast =
    document.createElement("div");

  toast.className = "toast";

  if (type === "success") {
    toast.style.borderColor =
      "rgba(50,213,131,.35)";
  }

  if (type === "danger") {
    toast.style.borderColor =
      "rgba(255,92,108,.35)";
  }

  if (type === "warning") {
    toast.style.borderColor =
      "rgba(255,176,32,.35)";
  }

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform =
      "translateY(8px)";

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, duration);
}

/* =========================================================
   Confirm
   ========================================================= */

function gbConfirm(
  message,
  callback
) {
  const settings =
    gbGetSettings();

  if (
    settings.confirmDelete === false
  ) {
    callback(true);
    return;
  }

  const result =
    window.confirm(message);

  callback(result);
}

/* =========================================================
   Clipboard
   ========================================================= */

async function gbCopy(
  text,
  successMessage = "کپی شد."
) {
  try {
    await navigator.clipboard.writeText(
      text
    );

    gbToast(
      successMessage,
      "success"
    );

    return true;
  } catch (error) {
    try {
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value = text;
      textarea.style.position =
        "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(
        textarea
      );

      textarea.select();

      document.execCommand("copy");

      textarea.remove();

      gbToast(
        successMessage,
        "success"
      );

      return true;
    } catch (err) {
      gbToast(
        "کپی کردن انجام نشد.",
        "danger"
      );

      return false;
    }
  }
}

/* =========================================================
   Date
   ========================================================= */

function gbFormatDate(date) {
  if (!date) {
    return "نامشخص";
  }

  try {
    return new Date(date)
      .toLocaleDateString(
        "fa-IR",
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      );
  } catch {
    return "نامشخص";
  }
}

/* =========================================================
   ID
   ========================================================= */

function gbId(prefix = "element") {
  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}

/* =========================================================
   Elements
   ========================================================= */

function gbCreateElement(
  type,
  data = {}
) {
  const base = {
    id: gbId(type),
    type,
    x: data.x || 0,
    y: data.y || 0,
    width: data.width || "auto",
    height: data.height || "auto"
  };

  const defaults = {
    text: {
      text: "متن جدید",
      fontSize: 20,
      color: "#111111"
    },

    button: {
      text: "دکمه",
      color: "#7c5cff",
      textColor: "#ffffff"
    },

    card: {
      title: "کارت جدید",
      description:
        "توضیحات کارت خود را اینجا بنویسید."
    },

    image: {
      src: "",
      alt: "تصویر"
    },

    input: {
      placeholder:
        "متن خود را وارد کنید..."
    },

    section: {
      background: "#f0f2f7"
    }
  };

  return {
    ...base,
    ...(defaults[type] || {}),
    ...data
  };
}

/* =========================================================
   Media
   ========================================================= */

function gbGetMedia() {
  return gbGet(
    GB_KEYS.media,
    []
  );
}

function gbSaveMedia(media) {
  return gbSet(
    GB_KEYS.media,
    media
  );
}

function gbAddMedia(item) {
  const media =
    gbGetMedia();

  media.unshift(item);

  gbSaveMedia(media);

  return item;
}

function gbDeleteMedia(id) {
  const media =
    gbGetMedia();

  const filtered =
    media.filter(
      item =>
        String(item.id) !==
        String(id)
    );

  gbSaveMedia(filtered);

  return true;
}

/* =========================================================
   File Helpers
   ========================================================= */

function gbFileToDataURL(file) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}

function gbFormatBytes(bytes) {
  if (!bytes) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  return (
    Math.round(
      bytes /
        Math.pow(
          1024,
          index
        ) *
        100
    ) / 100
  ) +
    " " +
    units[index]
}

/* =========================================================
   Project Link
   ========================================================= */

function gbProjectPreviewUrl(id) {
  const base =
    window.location.href
      .split("/")
      .slice(0, -1)
      .join("/");

  return (
    base +
    "/preview.html?project=" +
    encodeURIComponent(id)
  );
}

/* =========================================================
   Publishing State
   ========================================================= */

function gbSetPublished(
  projectId,
  state = true
) {
  gbSet(
    GB_KEYS.published +
      projectId,
    {
      published: state,
      date:
        new Date().toISOString()
    }
  );
}

function gbIsPublished(projectId) {
  const data =
    gbGet(
      GB_KEYS.published +
        projectId,
      null
    );

  return !!(
    data &&
    data.published
  );
}

/* =========================================================
   Navigation
   ========================================================= */

function gbSetupNavigation() {
  const current =
    location.pathname
      .split("/")
      .pop();

  document
    .querySelectorAll(
      "[data-page]"
    )
    .forEach(link => {
      const page =
        link.getAttribute(
          "data-page"
        );

      if (
        page &&
        current === page
      ) {
        link.classList.add(
          "active"
        );
      }
    });
}

/* =========================================================
   Auto Save
   ========================================================= */

let gbAutoSaveTimer = null;

function gbEnableAutoSave(
  callback,
  delay = 1000
) {
  const settings =
    gbGetSettings();

  if (
    settings.autosave === false
  ) {
    return;
  }

  clearTimeout(
    gbAutoSaveTimer
  );

  gbAutoSaveTimer =
    setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.warn(
          "Auto save error:",
          error
        );
      }
    }, delay);
}

/* =========================================================
   Search Helper
   ========================================================= */

function gbSearchItems(
  items,
  query,
  fields = []
) {
  const q =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!q) {
    return items;
  }

  return items.filter(item =>
    fields.some(field => {
      const value =
        item[field];

      return String(
        value || ""
      )
        .toLowerCase()
        .includes(q);
    })
  );
}

/* =========================================================
   Escape HTML
   ========================================================= */

function gbEscapeHTML(value) {
  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

/* =========================================================
   Statistics
   ========================================================= */

function gbGetStats() {
  const projects =
    gbGetProjects();

  return {
    total: projects.length,

    websites:
      projects.filter(
        p =>
          p.type ===
          "website"
      ).length,

    apps:
      projects.filter(
        p =>
          p.type === "app"
      ).length,

    games:
      projects.filter(
        p =>
          p.type === "game2d" ||
          p.type === "game3d"
      ).length
  };
}

/* =========================================================
   Reset
   ========================================================= */

function gbResetAllData() {
  Object.keys(
    localStorage
  ).forEach(key => {
    if (
      key.startsWith(
        "ghost_builder_"
      )
    ) {
      localStorage.removeItem(
        key
      );
    }
  });

  gbToast(
    "اطلاعات Ghost Builder پاک شد.",
    "success"
  );
}

/* =========================================================
   Keyboard Shortcuts
   ========================================================= */

function gbKeyboardShortcuts() {
  document.addEventListener(
    "keydown",
    event => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
          "s"
      ) {
        event.preventDefault();

        document
          .querySelector(
            "[data-save-project]"
          )
          ?.click();

        gbToast(
          "پروژه ذخیره شد.",
          "success"
        );
      }
    }
  );
}

/* =========================================================
   Global Startup
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    gbApplyTheme();
    gbSetupNavigation();
    gbKeyboardShortcuts();

    window.GhostBuilder = {
      getProjects:
        gbGetProjects,

      getCurrentProject:
        gbGetCurrentProject,

      findProject:
        gbFindProject,

      createProject:
        gbCreateProject,

      updateProject:
        gbUpdateProject,

      deleteProject:
        gbDeleteProject,

      duplicateProject:
        gbDuplicateProject,

      createElement:
        gbCreateElement,

      getMedia:
        gbGetMedia,

      addMedia:
        gbAddMedia,

      deleteMedia:
        gbDeleteMedia,

      getSettings:
        gbGetSettings,

      saveSettings:
        gbSaveSettings,

      setTheme:
        gbSetTheme,

      toast:
        gbToast,

      copy:
        gbCopy,

      preview:
        gbPreview,

      builder:
        gbBuilder,

      publish:
        gbPublish,

      projectUrl:
        gbProjectPreviewUrl,

      isPublished:
        gbIsPublished,

      setPublished:
        gbSetPublished
    };
  }
);

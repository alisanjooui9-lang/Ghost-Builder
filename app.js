/* =========================================================
   GHOST BUILDER
   Core Application Engine
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const GB_KEYS = {

  projects:
    "ghost_builder_projects",

  currentProject:
    "ghost_builder_current_project",

  settings:
    "ghost_builder_settings",

  media:
    "ghost_builder_media",

  support:
    "ghost_builder_support",

  published:
    "ghost_builder_published",

  selectedMedia:
    "ghost_builder_selected_media"

};


/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

const GB_DEFAULT_SETTINGS = {

  language: "fa",

  creatorName:
    "کاربر نمونه",

  autoSave: true,

  notifications: true,

  defaultQuality:
    "Medium",

  defaultResolution:
    "720p",

  showGrid: true,

  snap: true,

  livePreview: true,

  theme: "dark",

  primaryColor:
    "#7c5cff",

  backgroundColor:
    "#0b0d14"

};


/* =========================================================
   STORAGE
   ========================================================= */

function gbGet(
  key,
  fallback = null
) {

  try {

    const value =
      localStorage.getItem(key);

    if (
      value === null ||
      value === undefined
    ) {

      return fallback;

    }

    return JSON.parse(value);

  } catch (error) {

    console.warn(
      "Ghost Builder storage read error:",
      error
    );

    return fallback;

  }

}


function gbSet(
  key,
  value
) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {

    console.warn(
      "Ghost Builder storage write error:",
      error
    );

    gbToast(
      "ذخیره اطلاعات انجام نشد.",
      "error"
    );

    return false;

  }

}


function gbRemove(
  key
) {

  try {

    localStorage.removeItem(key);

    return true;

  } catch (error) {

    return false;

  }

}


/* =========================================================
   ID GENERATOR
   ========================================================= */

function gbId(
  prefix = "gb"
) {

  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(2,9)
  );

}


/* =========================================================
   PROJECTS
   ========================================================= */

function gbGetProjects() {

  const projects =
    gbGet(
      GB_KEYS.projects,
      []
    );

  return Array.isArray(projects)
    ? projects
    : [];

}


function gbSaveProjects(
  projects
) {

  return gbSet(
    GB_KEYS.projects,
    Array.isArray(projects)
      ? projects
      : []
  );

}


function gbGetCurrentProject() {

  const currentId =
    gbGet(
      GB_KEYS.currentProject,
      null
    );


  if (!currentId) {
    return null;
  }


  return gbFindProject(
    currentId
  );

}


function gbSetCurrentProject(
  projectOrId
) {

  const id =
    typeof projectOrId === "object"
      ? projectOrId?.id
      : projectOrId;


  if (!id) {
    return false;
  }


  return gbSet(
    GB_KEYS.currentProject,
    id
  );

}


function gbFindProject(
  id
) {

  if (!id) {
    return null;
  }


  return (
    gbGetProjects()
      .find(
        project =>
          String(project.id) ===
          String(id)
      ) ||
    null
  );

}


/* =========================================================
   CREATE PROJECT
   ========================================================= */

function gbCreateProject(
  data = {}
) {

  const now =
    new Date().toISOString();


  const project = {

    id:
      data.id ||
      gbId("project"),

    name:
      data.name ||
      "پروژه جدید",

    type:
      data.type ||
      "website",

    title:
      data.title ||
      data.name ||
      "پروژه جدید",

    description:
      data.description ||
      "",

    button:
      data.button ||
      "شروع کنید",

    primary:
      data.primary ||
      "#7c5cff",

    background:
      data.background ||
      "#ffffff",

    textColor:
      data.textColor ||
      "#111111",

    quality:
      data.quality ||
      "Medium",

    resolution:
      data.resolution ||
      "720p",

    width:
      data.width ||
      390,

    height:
      data.height ||
      720,

    elements:
      Array.isArray(data.elements)
        ? data.elements
        : [],

    template:
      data.template ||
      null,

    createdAt:
      data.createdAt ||
      now,

    updatedAt:
      now

  };


  const projects =
    gbGetProjects();


  projects.unshift(
    project
  );


  gbSaveProjects(
    projects
  );


  gbSetCurrentProject(
    project.id
  );


  return project;

}


/* =========================================================
   UPDATE PROJECT
   ========================================================= */

function gbUpdateProject(
  id,
  updates = {}
) {

  const projects =
    gbGetProjects();


  const index =
    projects.findIndex(
      project =>
        String(project.id) ===
        String(id)
    );


  if (index === -1) {

    return null;

  }


  projects[index] = {

    ...projects[index],

    ...updates,

    updatedAt:
      new Date().toISOString()

  };


  gbSaveProjects(
    projects
  );


  if (
    String(
      gbGet(
        GB_KEYS.currentProject,
        ""
      )
    ) ===
    String(id)
  ) {

    gbSetCurrentProject(
      projects[index].id
    );

  }


  return projects[index];

}


/* =========================================================
   DELETE PROJECT
   ========================================================= */

function gbDeleteProject(
  id
) {

  const projects =
    gbGetProjects();


  const filtered =
    projects.filter(
      project =>
        String(project.id) !==
        String(id)
    );


  if (
    filtered.length ===
    projects.length
  ) {

    return false;

  }


  gbSaveProjects(
    filtered
  );


  const current =
    gbGet(
      GB_KEYS.currentProject,
      null
    );


  if (
    String(current) ===
    String(id)
  ) {

    if (filtered[0]) {

      gbSetCurrentProject(
        filtered[0].id
      );

    } else {

      gbRemove(
        GB_KEYS.currentProject
      );

    }

  }


  return true;

}


/* =========================================================
   DUPLICATE PROJECT
   ========================================================= */

function gbDuplicateProject(
  id
) {

  const original =
    gbFindProject(id);


  if (!original) {
    return null;
  }


  const copy =
    JSON.parse(
      JSON.stringify(
        original
      )
    );


  copy.id =
    gbId("project");


  copy.name =
    original.name +
    " — کپی";


  copy.createdAt =
    new Date().toISOString();


  copy.updatedAt =
    new Date().toISOString();


  const projects =
    gbGetProjects();


  projects.unshift(
    copy
  );


  gbSaveProjects(
    projects
  );


  gbSetCurrentProject(
    copy.id
  );


  return copy;

}


/* =========================================================
   SETTINGS
   ========================================================= */

function gbGetSettings() {

  return {

    ...GB_DEFAULT_SETTINGS,

    ...gbGet(
      GB_KEYS.settings,
      {}
    )

  };

}


function gbSaveSettings(
  settings = {}
) {

  const merged = {

    ...gbGetSettings(),

    ...settings

  };


  const result =
    gbSet(
      GB_KEYS.settings,
      merged
    );


  if (
    merged.theme
  ) {

    gbApplyTheme(
      merged.theme
    );

  }


  return result;

}


/* =========================================================
   THEME
   ========================================================= */

function gbApplyTheme(
  theme
) {

  const body =
    document.body;


  if (!body) {
    return;
  }


  body.classList.remove(
    "light"
  );


  if (
    theme ===
    "light"
  ) {

    body.classList.add(
      "light"
    );

  }


  if (
    theme ===
    "system"
  ) {

    const prefersLight =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;


    if (prefersLight) {

      body.classList.add(
        "light"
      );

    }

  }


  const settings =
    gbGetSettings();


  if (
    settings.primaryColor
  ) {

    document.documentElement
      .style.setProperty(
        "--primary",
        settings.primaryColor
      );

  }


  if (
    settings.backgroundColor
  ) {

    document.documentElement
      .style.setProperty(
        "--bg",
        settings.backgroundColor
      );

  }

}


function gbSetTheme(
  theme
) {

  const settings =
    gbGetSettings();


  settings.theme =
    theme;


  gbSaveSettings(
    settings
  );

}


/* =========================================================
   PROJECT TYPES
   ========================================================= */

function gbProjectTypeLabel(
  type
) {

  const labels = {

    website:
      "Website",

    app:
      "App",

    game2d:
      "Game 2D",

    game3d:
      "Game 3D"

  };


  return (
    labels[type] ||
    "Project"
  );

}


function gbProjectTypeIcon(
  type
) {

  const icons = {

    website:
      "🌐",

    app:
      "📱",

    game2d:
      "🎮",

    game3d:
      "🧊"

  };


  return (
    icons[type] ||
    "📦"
  );

}


/* =========================================================
   URL / NAVIGATION
   ========================================================= */

function gbParam(
  name
) {

  try {

    return new URLSearchParams(
      location.search
    ).get(name);

  } catch (error) {

    return null;

  }

}


function gbGo(
  url
) {

  window.location.href =
    url;

}


function gbBuilder(
  projectId
) {

  if (projectId) {

    return (
      "builder.html?project=" +
      encodeURIComponent(
        projectId
      )
    );

  }


  return "builder.html";

}


function gbPreview(
  projectId
) {

  if (projectId) {

    return (
      "preview.html?project=" +
      encodeURIComponent(
        projectId
      )
    );

  }


  return "preview.html";

}


function gbPublish(
  projectId
) {

  if (projectId) {

    return (
      "publish.html?project=" +
      encodeURIComponent(
        projectId
      )
    );

  }


  return "publish.html";

}


/* =========================================================
   ELEMENT CREATOR
   ========================================================= */

function gbCreateElement(
  type,
  data = {}
) {

  const defaults = {

    text: {

      text:
        "متن جدید",

      align:
        "center",

      size:
        22,

      color:
        "#111111"

    },

    button: {

      text:
        "دکمه",

      color:
        "#7c5cff",

      textColor:
        "#ffffff"

    },

    card: {

      title:
        "عنوان کارت",

      description:
        "توضیحات کارت"

    },

    image: {

      src:
        "",

      alt:
        "تصویر"

    },

    input: {

      placeholder:
        "متن خود را وارد کنید"

    },

    section: {

      title:
        "بخش جدید",

      background:
        "#f5f5f5"

    }

  };


  return {

    id:
      gbId("element"),

    type,

    ...(
      defaults[type] ||
      {}
    ),

    ...data

  };

}


/* =========================================================
   MEDIA
   ========================================================= */

function gbGetMedia() {

  const media =
    gbGet(
      GB_KEYS.media,
      []
    );


  return Array.isArray(media)
    ? media
    : [];

}


function gbSaveMedia(
  media
) {

  return gbSet(
    GB_KEYS.media,
    media
  );

}


function gbAddMedia(
  media
) {

  const list =
    gbGetMedia();


  const item = {

    id:
      media.id ||
      gbId("media"),

    name:
      media.name ||
      "فایل",

    type:
      media.type ||
      "other",

    size:
      Number(
        media.size || 0
      ),

    data:
      media.data ||
      null,

    url:
      media.url ||
      null,

    createdAt:
      media.createdAt ||
      new Date().toISOString()

  };


  list.unshift(
    item
  );


  gbSaveMedia(
    list
  );


  return item;

}


function gbDeleteMedia(
  id
) {

  const media =
    gbGetMedia();


  const filtered =
    media.filter(
      item =>
        String(item.id) !==
        String(id)
    );


  gbSaveMedia(
    filtered
  );


  return true;

}


function gbSetSelectedMedia(
  media
) {

  return gbSet(
    GB_KEYS.selectedMedia,
    media
  );

}


function gbGetSelectedMedia() {

  return gbGet(
    GB_KEYS.selectedMedia,
    null
  );

}


/* =========================================================
   FILE HELPERS
   ========================================================= */

function gbFileToDataURL(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        () =>
          resolve(
            reader.result
          );


      reader.onerror =
        reject;


      reader.readAsDataURL(
        file
      );

    }
  );

}


function gbFormatBytes(
  bytes
) {

  bytes =
    Number(bytes) || 0;


  if (
    bytes < 1024
  ) {

    return (
      bytes +
      " B"
    );

  }


  if (
    bytes < 1024 * 1024
  ) {

    return (
      (bytes / 1024)
        .toFixed(1) +
      " KB"
    );

  }


  if (
    bytes <
    1024 * 1024 * 1024
  ) {

    return (
      (bytes /
        (1024 * 1024)
      ).toFixed(1) +
      " MB"
    );

  }


  return (
    (
      bytes /
      (1024 * 1024 * 1024)
    ).toFixed(1) +
    " GB"
  );

}


/* =========================================================
   PROJECT PREVIEW URL
   ========================================================= */

function gbProjectPreviewURL(
  project
) {

  if (!project) {
    return "";
  }


  const base =
    location.href
      .split("/")
      .slice(
        0,
        -1
      )
      .join("/") +
    "/";


  return (
    base +
    "preview.html?project=" +
    encodeURIComponent(
      project.id
    )
  );

}


/* =========================================================
   PUBLISHING
   ========================================================= */

function gbGetPublished() {

  return gbGet(
    GB_KEYS.published,
    {}
  );

}


function gbPublishProject(
  id
) {

  const project =
    gbFindProject(id);


  if (!project) {
    return null;
  }


  const published =
    gbGetPublished();


  published[id] = {

    published:
      true,

    publishedAt:
      new Date().toISOString(),

    url:
      gbProjectPreviewURL(
        project
      )

  };


  gbSet(
    GB_KEYS.published,
    published
  );


  return published[id];

}


function gbIsPublished(
  id
) {

  const published =
    gbGetPublished();


  return !!(
    published[id] &&
    published[id].published
  );

}


/* =========================================================
   TOAST
   ========================================================= */

function gbToast(
  message,
  type = "info",
  duration = 2800
) {

  let container =
    document.getElementById(
      "gbToastContainer"
    );


  if (!container) {

    container =
      document.createElement(
        "div"
      );

    container.id =
      "gbToastContainer";

    document.body.appendChild(
      container
    );

  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "gb-toast " +
    type;


  toast.textContent =
    message;


  container.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.style.opacity =
        "0";

      toast.style.transform =
        "translateY(8px)";

      toast.style.transition =
        ".2s";


      setTimeout(
        () =>
          toast.remove(),
        220
      );

    },
    duration
  );

}


/* =========================================================
   CONFIRM
   ========================================================= */

function gbConfirm(
  message,
  callback
) {

  const result =
    window.confirm(
      message
    );


  if (
    result &&
    typeof callback ===
    "function"
  ) {

    callback();

  }


  return result;

}


/* =========================================================
   CLIPBOARD
   ========================================================= */

async function gbCopy(
  text
) {

  try {

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {

      await navigator.clipboard.writeText(
        String(text)
      );

    } else {

      const input =
        document.createElement(
          "textarea"
        );

      input.value =
        String(text);

      input.style.position =
        "fixed";

      input.style.opacity =
        "0";

      document.body.appendChild(
        input
      );

      input.select();

      document.execCommand(
        "copy"
      );

      input.remove();

    }


    gbToast(
      "کپی شد.",
      "success"
    );


    return true;

  } catch (error) {

    gbToast(
      "کپی انجام نشد.",
      "error"
    );


    return false;

  }

}


/* =========================================================
   DATE
   ========================================================= */

function gbFormatDate(
  date
) {

  if (!date) {
    return "—";
  }


  try {

    return new Intl.DateTimeFormat(
      "fa-IR",
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit"
      }
    ).format(
      new Date(date)
    );

  } catch (error) {

    return String(date);

  }

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function gbEscapeHTML(
  value
) {

  return String(
    value ?? ""
  )
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
   SEARCH
   ========================================================= */

function gbSearch(
  items,
  query,
  fields = []
) {

  if (!Array.isArray(items)) {
    return [];
  }


  query =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();


  if (!query) {
    return items;
  }


  return items.filter(
    item => {

      if (
        !fields.length
      ) {

        return JSON.stringify(
          item
        )
          .toLowerCase()
          .includes(
            query
          );

      }


      return fields.some(
        field =>
          String(
            item[field] ?? ""
          )
            .toLowerCase()
            .includes(
              query
            )
      );

    }
  );

}


/* =========================================================
   STATS
   ========================================================= */

function gbGetStats() {

  const projects =
    gbGetProjects();


  return {

    total:
      projects.length,

    websites:
      projects.filter(
        p =>
          p.type ===
          "website"
      ).length,

    apps:
      projects.filter(
        p =>
          p.type ===
          "app"
      ).length,

    games:
      projects.filter(
        p =>
          p.type ===
          "game2d" ||
          p.type ===
          "game3d"
      ).length,

    game2d:
      projects.filter(
        p =>
          p.type ===
          "game2d"
      ).length,

    game3d:
      projects.filter(
        p =>
          p.type ===
          "game3d"
      ).length

  };

}


/* =========================================================
   RESET
   ========================================================= */

function gbResetAll() {

  Object.values(
    GB_KEYS
  ).forEach(
    key =>
      gbRemove(key)
  );


  return true;

}


/* =========================================================
   AUTO SAVE
   ========================================================= */

function gbEnableAutoSave(
  callback,
  delay = 700
) {

  let timer =
    null;


  return function () {

    clearTimeout(
      timer
    );


    timer =
      setTimeout(
        () => {

          if (
            typeof callback ===
            "function"
          ) {

            callback();

          }

        },
        delay
      );

  };

}


/* =========================================================
   NAV ACTIVE
   ========================================================= */

function gbSetActiveNav() {

  const page =
    location.pathname
      .split("/")
      .pop() ||
    "index.html";


  document
    .querySelectorAll(
      "[data-nav]"
    )
    .forEach(
      link => {

        const target =
          link.getAttribute(
            "data-nav"
          );


        link.classList.toggle(
          "active",
          target ===
          page
        );

      }
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function gbKeyboardShortcuts() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        event.key.toLowerCase() ===
        "s"
      ) {

        event.preventDefault();


        const button =
          document.querySelector(
            '[data-action="save"]'
          );


        if (button) {

          button.click();

        } else {

          gbToast(
            "تغییرات ذخیره شدند.",
            "success"
          );

        }

      }

    }
  );

}


/* =========================================================
   INITIAL THEME
   ========================================================= */

function gbInitTheme() {

  const settings =
    gbGetSettings();


  gbApplyTheme(
    settings.theme
  );

}


/* =========================================================
   SAMPLE DATA
   ========================================================= */

function gbEnsureDemoProject() {

  const projects =
    gbGetProjects();


  if (
    projects.length > 0
  ) {

    return;

  }


  const demo =
    gbCreateProject({

      name:
        "Ghost Demo",

      type:
        "website",

      title:
        "Ghost Builder",

      description:
        "پروژه نمونه Ghost Builder",

      button:
        "شروع کنید",

      primary:
        "#7c5cff",

      background:
        "#ffffff",

      elements: [

        gbCreateElement(
          "text",
          {
            text:
              "به Ghost Builder خوش آمدید",

            size:
              25
          }
        ),

        gbCreateElement(
          "button",
          {
            text:
              "شروع ساخت"
          }
        ),

        gbCreateElement(
          "card",
          {
            title:
              "ساخت آسان",

            description:
              "سایت، اپلیکیشن و بازی خود را بسازید."
          }
        )

      ]

    });


  gbSetCurrentProject(
    demo.id
  );

}


/* =========================================================
   CURRENT PROJECT HELPER
   ========================================================= */

function gbRequireCurrentProject() {

  const project =
    gbGetCurrentProject();


  if (!project) {

    gbToast(
      "ابتدا یک پروژه انتخاب کنید.",
      "warning"
    );


    return null;

  }


  return project;

}


/* =========================================================
   SAFE JSON EXPORT
   ========================================================= */

function gbExportProject(
  id
) {

  const project =
    gbFindProject(id);


  if (!project) {

    gbToast(
      "پروژه پیدا نشد.",
      "error"
    );

    return null;

  }


  const blob =
    new Blob(
      [
        JSON.stringify(
          project,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;

  a.download =
    (
      project.name ||
      "ghost-project"
    )
      .replace(
        /[^a-zA-Z0-9\u0600-\u06FF_-]/g,
        "_"
      ) +
    ".json";


  document.body.appendChild(
    a
  );

  a.click();

  a.remove();


  URL.revokeObjectURL(
    url
  );


  return true;

}


/* =========================================================
   IMPORT PROJECT
   ========================================================= */

function gbImportProject(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        event => {

          try {

            const data =
              JSON.parse(
                event.target.result
              );


            data.id =
              gbId("project");


            data.createdAt =
              new Date().toISOString();


            data.updatedAt =
              new Date().toISOString();


            const projects =
              gbGetProjects();


            projects.unshift(
              data
            );


            gbSaveProjects(
              projects
            );


            gbSetCurrentProject(
              data.id
            );


            gbToast(
              "پروژه وارد شد.",
              "success"
            );


            resolve(
              data
            );

          } catch (error) {

            gbToast(
              "فایل پروژه معتبر نیست.",
              "error"
            );


            reject(
              error
            );

          }

        };


      reader.onerror =
        reject;


      reader.readAsText(
        file
      );

    }
  );

}


/* =========================================================
   GLOBAL API
   ========================================================= */

window.GhostBuilder = {

  keys:
    GB_KEYS,

  get:
    gbGet,

  set:
    gbSet,

  remove:
    gbRemove,

  id:
    gbId,

  getProjects:
    gbGetProjects,

  createProject:
    gbCreateProject,

  updateProject:
    gbUpdateProject,

  deleteProject:
    gbDeleteProject,

  duplicateProject:
    gbDuplicateProject,

  findProject:
    gbFindProject,

  getCurrentProject:
    gbGetCurrentProject,

  setCurrentProject:
    gbSetCurrentProject,

  getSettings:
    gbGetSettings,

  saveSettings:
    gbSaveSettings,

  createElement:
    gbCreateElement,

  getMedia:
    gbGetMedia,

  addMedia:
    gbAddMedia,

  deleteMedia:
    gbDeleteMedia,

  getStats:
    gbGetStats,

  preview:
    gbPreview,

  publish:
    gbPublish,

  toast:
    gbToast,

  copy:
    gbCopy,

  formatDate:
    gbFormatDate,

  exportProject:
    gbExportProject,

  importProject:
    gbImportProject

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    gbInitTheme();

    gbSetActiveNav();

    gbKeyboardShortcuts();

  }
);

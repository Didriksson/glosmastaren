import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";

// --- DEBUG-KOD FÖR ATT HITTA FELET ---
window.onerror = function (message, source, lineno, colno, error) {
  const errorBox = document.createElement("div");
  errorBox.style.position = "fixed";
  errorBox.style.top = "0";
  errorBox.style.left = "0";
  errorBox.style.width = "100%";
  errorBox.style.backgroundColor = "red";
  errorBox.style.color = "white";
  errorBox.style.padding = "20px";
  errorBox.style.zIndex = "9999";
  errorBox.innerText = `CRASH: ${message}\nSource: ${source}:${lineno}`;
  document.body.appendChild(errorBox);
};

const app = createApp(App);

app.config.errorHandler = (err) => {
  console.error(err);
  const errorBox = document.createElement("div");
  errorBox.style.position = "fixed";
  errorBox.style.bottom = "0";
  errorBox.style.left = "0";
  errorBox.style.width = "100%";
  errorBox.style.backgroundColor = "orange";
  errorBox.style.color = "black";
  errorBox.style.padding = "20px";
  errorBox.style.zIndex = "9999";
  errorBox.innerText = `VUE ERROR: ${err}`;
  document.body.appendChild(errorBox);
};
// -------------------------------------

app.use(createPinia());
app.mount("#app");

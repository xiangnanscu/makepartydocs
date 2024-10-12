import { createApp } from "vue";
import PrimeVue from "primevue/config";
import "primevue/resources/themes/aura-light-cyan/theme.css";
import "primeicons/primeicons.css";
import primelocale from "primelocale/zh-CN.json";
import "primeflex/primeflex.css";
import router from "./router";
import App from "./App.vue";
import { Model } from "~/lib/model";
import { BaseField } from "~/lib/model/field.mjs";
import { request } from "~/lib/Http";

Model.request = request;
BaseField.request = request;
const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
  inputStyle: "filled",
  ripple: true,
  locale: primelocale["zh-CN"],
});

app.mount("#app");
app.config.errorHandler = (err, instance, info) => {
  if (typeof err == "object") {
    if (err.message !== "") {
      // Http.post抛出的错误是空字符串,暂时不展示
      console.error(`${err.response?.data || err.message || "未知错误"}`);
    }
  }
};

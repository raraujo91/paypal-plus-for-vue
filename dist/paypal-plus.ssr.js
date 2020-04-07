'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}var triggerbus=_interopDefault(require('triggerbus'));var pppBus = triggerbus();
var script = {
  name: "PaypalPlus",
  // vue component name
  props: {
    mode: {
      //sandbox or live
      type: String,
      default: "live",
      required: false,
      validator: function validator(value) {
        return ["sandbox", "live"].indexOf(value) !== -1;
      }
    },
    approvalUrl: {
      // required
      type: String,
      required: true
    },
    email: {
      // required
      type: String,
      required: true
    },
    firstName: {
      // required
      type: String,
      required: true
    },
    lastName: {
      // required
      type: String,
      required: true
    },
    country: {
      // US, BR, MX
      type: String,
      required: false,
      validator: function validator(value) {
        return ["US", "BR", "MX"].indexOf(value) !== -1;
      }
    },
    taxId: {
      // required for Brazil - if MX/US value is ""
      type: String,
      default: "",
      required: false
    },
    domName: {
      // required
      type: String,
      default: "ppplus-vue",
      required: false
    },
    iframeHeight: {
      type: String,
      default: "550",
      required: false
    },
    mxDebitCards: {
      type: Boolean,
      default: false,
      required: false
    },
    collectBillingAddress: {
      type: Boolean,
      default: false,
      required: false
    },
    phone: {
      // no seller protection applied if blank
      type: String,
      default: "",
      required: false
    },
    language: {
      type: String,
      default: "",
      required: false
    },
    buttonId: {
      type: String,
      default: "",
      required: false
    },
    rememberCards: {
      // disable option to remember cards
      type: Boolean,
      default: false,
      required: false
    },
    rememberedCards: {
      type: String,
      default: "",
      required: false
    },
    installmentTerm: {
      type: Number,
      default: 0,
      required: false
    },
    blockInstallment: {
      type: Boolean,
      default: false,
      required: false
    },
    noScript: {
      type: Boolean,
      default: false,
      required: false
    },
    pppDebug: {
      type: Boolean,
      default: false
    }
  },
  data: function data() {
    return {
      payload: {
        iframeHeight: this.iframeHeight,
        approvalUrl: this.approvalUrl,
        placeholder: this.domName,
        mode: this.mode,
        payerEmail: this.email,
        payerFirstName: this.firstName,
        payerLastName: this.lastName,
        payerTaxId: this.taxId,
        enableContinue: this.buttonId,
        disableContinue: this.buttonId,
        payerPhone: this.phone,
        country: this.country,
        disallowRememberedCards: !this.rememberCards,
        rememberedCards: this.rememberedCards
      }
    };
  },
  methods: {
    loadLib: function loadLib(uri) {
      return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = uri;
        script.async = true;

        script.onload = function () {
          resolve();
        };

        document.head.appendChild(script);
      });
    },
    startMessageListener: function startMessageListener() {
      if (window.addEventListener) {
        window.addEventListener("message", this.messageListener, false);
        console.log("addEventListener successful");
      } else if (window.attachEvent) {
        window.attachEvent("onmessage", this.messageListener);
        console.log("attachEvent successful");
      } else {
        console.log("Could not attach message listener");
        throw new Error("Can't attach message listener");
      }
    },
    messageListener: function messageListener(event) {
      if (typeof event.data === "string") {
        var data = JSON.parse(event.data);

        if (this.pppDebug) {
          console.log(data);
        }

        var result = data.result || data.cause;

        if (data.action === "checkout") {
          this.$emit("checkout", result);
        } else if (data.action === "onError") {
          this.$emit("error", result);
        }
      }
    },
    pppContinue: function pppContinue() {
      this.pppInit.doContinue();
    }
  },
  computed: {
    pppValidation: function pppValidation(_ref) {
      var payload = _ref.payload;
      var taxIdValidator = true;
      var country = payload.country;

      switch (country) {
        case "BR":
          if (payload.payerTaxId === "") {
            taxIdValidator = false;
            throw new Error("CPF/CNPJ (taxId) não informado. Favor corrigir.");
          }

          payload.language = "pt_BR";
          payload.merchantInstallmentSelection = this.installmentTerm;
          payload.merchantInstallmentSelectionOptional = !this.blockInstallment;
          payload.payerTaxIdType = payload.payerTaxId.length > 11 ? "BR_CNPJ" : "BR_CPF";
          break;

        case "MX":
          payload.language = "es_MX";
          payload.hideMxDebitCards = this.mxDebitCards; // hide debitcards (only MX)

          break;

        default:
          payload.language = "en_US";
          payload.collectBillingAddress = true; // recommended to use if US

          break;
      }

      return taxIdValidator;
    },
    pppInit: function pppInit(_ref2) {
      var payload = _ref2.payload;
      this.startMessageListener();

      if (this.pppValidation) {
        return PAYPAL.apps.PPP(payload);
      }
    }
  },
  mounted: function mounted() {
    var _this = this;

    pppBus.on('pppContinue', function () {
      return _this.pppContinue();
    });

    if (this.noScript === false) {
      this.loadLib("https://www.paypalobjects.com/webstatic/ppplusdcc/ppplusdcc.min.js").then(function () {
        return _this.pppInit;
      });
    } else {
      return this.pppInit;
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', [_vm._ssrNode("<div" + _vm._ssrAttr("id", _vm.payload.placeholder) + "></div>")]);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = "data-v-ec02b94a";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);// Import vue component

var install = function installPaypalPlus(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('PaypalPlus', __vue_component__);
}; // Create module definition for Vue.use()


var plugin = {
  install: install
}; // To auto-install when vue is found
// eslint-disable-next-line no-redeclare

/* global window, global */

var GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
} // Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()


__vue_component__.install = install; // Export component by default
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
exports.default=__vue_component__;
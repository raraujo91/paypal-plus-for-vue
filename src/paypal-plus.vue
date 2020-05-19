<script>

export default {
  name: "PaypalPlus", // vue component name
  props: {
    mode: {
      //sandbox or live
      type: String,
      default: "live",
      required: false,
      validator: function(value) {
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
      validator: function(value) {
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
    mxDebitCards: {
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
  data() {
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
    loadLib(uri) {
      return new Promise((resolve, reject) => {
        var script = document.createElement("script");
        script.src = uri;
        script.async = true;
        script.onload = () => {
          resolve();
        };
        document.head.appendChild(script);
      });
    },
    startMessageListener() {
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
    messageListener(event) {
      if (typeof event.data === "string") {
        let data = JSON.parse(event.data);
        if(this.pppDebug) { console.log(data) }
        let result = data.result || data.cause;

        if (data.action === "checkout") {
          this.$emit("checkout", result);
        } else if (data.action === "onError") {
          this.$emit("error", result);
        }
      }
    },
    pppContinue() {
      this.pppInit.doContinue();
    },
  },
  computed: {
    pppValidation({ payload }) {
      let taxIdValidator = true;
      let country = payload.country;
      switch (country) {
        case "BR":
          if (payload.payerTaxId === "") {
            taxIdValidator = false;
            throw new Error("CPF/CNPJ (taxId) não informado. Favor corrigir.");
          }
          payload.language = "pt_BR";
          payload.merchantInstallmentSelection = this.installmentTerm;
          payload.merchantInstallmentSelectionOptional = !this.blockInstallment;
          payload.payerTaxIdType =
            payload.payerTaxId.length > 11 ? "BR_CNPJ" : "BR_CPF";
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
    pppInit({ payload }) {
      this.startMessageListener();

      if (this.pppValidation) {
        return PAYPAL.apps.PPP(payload);
      }
    }
  },

  mounted() {
    if (this.noScript === false) {
      this.loadLib(
        "https://www.paypalobjects.com/webstatic/ppplusdcc/ppplusdcc.min.js"
      ).then(() => {
        return this.pppInit;
      });
    } else {
      return this.pppInit;
    }
  }
};
</script>

<template>
  <div>
    <div :id="payload.placeholder"></div>
  </div>
</template>

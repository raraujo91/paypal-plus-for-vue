<script>
import Vue from "vue";
import CompButton from '@/comp-button.vue'
import PaypalPlus from "@/paypal-plus.vue";
import axios from "axios";

export default Vue.extend({
  name: "ServeDev",
  data() {
    return {
      componentKey: 0,
      approvalUrl: "",
      paymentId: "",
      success: false
    };
  },
  methods: {
    onContinue(data) {
      this.success = true
    },
    onError(data) {},
  },
  components: {
    PaypalPlus,
    CompButton
  },
  created() {
    try {
      axios
        .post("https://untitled-912w7bu2o4fz.runkit.sh/create/BRL")
        .then(r => {
          this.approvalUrl = r.data.links[1].href;
          this.paymentId = r.data.id;
        });
    } catch (e) {
      console.error(e);
    }
  },
  computed: {
    noApprovalUrl() {
      return this.approvalUrl === "";
    }
  }
});
</script>

<style>
  button {
  background-color: #4caf50;
  border: 1px #000000;
  color: #ffffff;
  text-align: center;
  font-size: 16px;
  display: inline-block;
  padding: 15px 32px;
}

#paymentStatus {
  color: #4caf50;
  padding: 15px 32px;
  border: 1px #4caf50;
  border-radius: 10px;
}
</style>

<template>
  <div id="app" v-if="!noApprovalUrl">
    <PaypalPlus
      :key="componentKey"
      mode="sandbox"
      iframeHeight="430"
      firstName="Renan"
      lastName="Araujo"
      country="BR"
      taxId="27374114087"
      email="renan9379@sandboxpaypal.com"
      buttonId="continueButton"
      :approvalUrl="approvalUrl"
      @checkout="onContinue"
      @error="onError"
    />
    <CompButton/>
    <div id="paymentStatus" v-if="success">
      <center>Pagamento efetuado com sucesso!</center>
    </div>
  </div>
</template>

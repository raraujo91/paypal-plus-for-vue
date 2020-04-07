<template>
  <center>
    <button id="continueButton" @click="executePayment">Pagar</button>
  </center>
</template>

<script>
import { pppBus } from '@/paypal-plus.vue'
export default {
  methods: {
    executePayment() {
     pppBus.trigger('pppContinue')
    }
  }
};
</script>

<style scoped>
button {
  background-color: #4caf50;
  border: 1px #000000;
  color: #ffffff;
  text-align: center;
  font-size: 16px;
  display: inline-block;
  padding: 15px 32px;
  cursor: pointer;
}

button:disabled {
  background-color: gray;
  color: rgb(80, 80, 80)
}
</style>


<script setup>
import { ethers } from 'ethers';
import { ref, onMounted } from 'vue';


import trustFundJson from './abis/mumbai/TrustFund.json';
import {validateDate} from "./utils/utils";

const date = new Date();

const tab = ref('deposit');

const month = ref(date.getMonth());
const day = ref(date.getDate());
const year = ref(date.getFullYear());

const beneficiaryAddress = ref('');

const depositAmount = ref(0);

const balance = ref(0);
const withdrawalDate = ref('');

const errorMessage = ref('');
const infoMessage = ref('');
const successMessage = ref('');


console.log(date / 1000);


const withdrawalAddress = ref('');

onMounted(async () => {
  console.log(window.ethereum);

  if (window.ethereum) {
    setAddress();

    window.ethereum.on('accountsChanged', async (accounts) => {
      setAddress();
    })
  } else {
    errorMessage.value = 'Please install Metamask to use this app.';
  }
});

const setAddress = async (address) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  withdrawalAddress.value = await signer.getAddress();
}

const setTab = (t) => {
  tab.value = t;
}

const setErrorMessage = (message) => {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
}

const setInfoMessage = (message) => {
  infoMessage.value = message;
  setTimeout(() => {
    infoMessage.value = '';
  }, 5000);
}

const setSuccessMessage = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
}

const validateAddress = () => {
  if (beneficiaryAddress.value.length !== 42) {
    setErrorMessage('Invalid address');
    throw new Error('Invalid address');
  }
}

const isWithdrawDateToday = () => {
  const today = new Date();
  const withdrawalDate = new Date(year.value, month.value, day.value);

  return today.getFullYear() === withdrawalDate.getFullYear() &&
      today.getMonth() === withdrawalDate.getMonth() &&
      today.getDate() === withdrawalDate.getDate();
}

const onSubmitBeneficiary = async () => {
  console.log(beneficiaryAddress);
  console.log(month, day, year);


  console.log(ethers.BrowserProvider);

  validateAddress();
  const errorMessage = validateDate(month.value, day.value, year.value);
  if (errorMessage) {
    setErrorMessage(errorMessage);
    throw new Error(errorMessage);
  }


  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
      trustFundJson.address,
      trustFundJson.abi,
      signer,
  );

  // create a timestamp from the day month and year

  let timestamp = Math.round(new Date(year.value, month.value, day.value).getTime() / 1000);
  if (isWithdrawDateToday()) {
    timestamp = Math.round((new Date()).getTime() / 1000 + 60); // add 60 seconds to the current time so that the user can withdraw immediately
  }


  console.log(timestamp);

  const txn = await contract.depositFunds(beneficiaryAddress.value, timestamp, {
    value: ethers.parseEther(depositAmount.value.toString()),
  });

  console.log(txn);

  setSuccessMessage('Transaction sent!');

  const receipt = await txn.wait();

  console.log(receipt);

  setSuccessMessage('Transaction confirmed!');
}

const onGetBalance = async () => {
  validateAddress();

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
        trustFundJson.address,
        trustFundJson.abi,
        signer,
    );

    const txn = await contract.getFundsAmount(beneficiaryAddress.value);

    console.log(txn);

    const ethValue = ethers.formatEther(txn);

    console.log(ethValue);

    if (ethValue === '0.0') {
      balance.value = 0;
      withdrawalDate.value = '';
      return setInfoMessage('No funds deposited');
    }

    balance.value = ethValue;

    const txn2 = await contract.getFundsWithdrawalDate(beneficiaryAddress.value);

    console.log(txn2);

    const date = new Date(parseInt(txn2) * 1000);

    console.log(date);

    withdrawalDate.value = date.toDateString();
  } catch (e) {
    console.log(e);
    setErrorMessage(e.message);
  }
}


const onWithdrawBalance = async () => {
  validateAddress();

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
        trustFundJson.address,
        trustFundJson.abi,
        signer,
    );

    const txn = await contract.withdrawFunds();

    console.log(txn);

    const receipt = await txn.wait();

    console.log(receipt);
  } catch (e) {
    console.log(e);

    if (e.message.includes('No funds available')) {
      return setErrorMessage('No funds available');
    }

    setErrorMessage(e.message);
  }





}


</script>


<template>
  <div class="flex flex-col items-center w-[380px] m-auto">

    <h1 class="text-4xl text-gray-900 mb-12 mt-12">Trust Fund Mumbai</h1>


    <div class="border-b border-b-gray-200 pb-2 mb-8 w-full flex flex-row justify-center">
      <button @click="setTab('deposit')" :class="[tab === 'deposit' ? 'text-gray-900' : 'text-gray-400', 'font-bold mx-4']">
        Deposit
      </button>
      <button @click="setTab('withdraw')" :class="[tab === 'withdraw' ? 'text-gray-900' : 'text-gray-400', 'font-bold mx-4']">
        Withdraw
      </button>
      <button @click="setTab('view-balance')" :class="[tab === 'view-balance' ? 'text-gray-900' : 'text-gray-400', 'font-bold mx-4']">
        View Balance
      </button>
    </div>


    <div v-if="errorMessage" class="mb-6 text-red-900 px-5 py-2 border border-red-500 bg-red-200 rounded-md w-full">
      <div>{{ errorMessage }}</div>
    </div>
    <div v-if="infoMessage" class="mb-6 text-gray-900 px-5 py-2 border border-gray-500 bg-gray-200 rounded-md w-full">
      <div>{{ infoMessage }}</div>
    </div>
    <div v-if="successMessage" class="mb-6 text-green-900 px-5 py-2 border border-green-500 bg-green-200 rounded-md w-full">
      <div>{{ successMessage }}</div>
    </div>


    <div v-if="tab === 'deposit'" class="w-full">
      <div class="flex flex-col">
        <div class="flex flex-col mb-4">
          <div class="text-gray-900 font-bold mb-2">Beneficiary Address</div>
          <input class="border rounded-md border-gray-900 px-3 py-1 text-gray-800" v-model="beneficiaryAddress" />
        </div>

        <div class="text-gray-900 font-bold mb-1">Withdrawal Date</div>

        <div class="flex mb-4">
          <div class="flex flex-col w-20">
            <div class="text-gray-900">Month</div>
            <input class="border rounded-md border-gray-900 px-3 py-1 text-gray-800 w-full" v-model="month" />
          </div>

          <div class="flex flex-col ml-2 w-20">
            <div class="text-gray-900">Day</div>
            <input class="border rounded-md border-gray-900 px-3 py-1 text-gray-800 w-full" v-model="day" />
          </div>

          <div class="flex flex-col ml-2 flex-1">
            <div class="text-gray-900">Year</div>
            <input class="border rounded-md border-gray-900 px-3 py-1 text-gray-800 w-full" v-model="year" />
          </div>
        </div>

        <div class="flex flex-col mb-4">
          <div class="text-gray-900 font-bold mb-2">Deposit Amount</div>
          <div class="relative">
            <input class="w-full border rounded-md border-gray-900 px-3 py-1 text-gray-800" v-model="depositAmount" />
            <div class="absolute top-[4px] right-4 text-gray-400">ETH</div>
          </div>
        </div>

        <button class="rounded-md bg-black text-white px-4 py-1" type="button" @click="onSubmitBeneficiary">
          Deposit
        </button>
      </div>
    </div>

    <div v-if="tab === 'withdraw'" class="w-full">
      <div class="flex flex-col">
        <div class="flex flex-col mb-4">
          <div class="text-gray-900 font-bold mb-2">Withdrawal Address</div>
          <input class="border rounded-md border-gray-900 px-3 py-1 text-gray-400" v-model="withdrawalAddress" disabled />
          <div class="text-sm mt-1 text-gray-400">To withdraw to a different address than the one seen here. Connect a different account in metamask.</div>

          <button class="rounded-md bg-black text-white px-4 py-1 mt-4" type="button" @click="onWithdrawBalance">
            Withdraw Full Balance
          </button>
        </div>
      </div>
    </div>

    <div v-if="tab === 'view-balance'" class="w-full">
      <div class="flex flex-col">
        <div class="flex flex-col mb-4">
          <div class="text-gray-900 font-bold mb-2">Beneficiary Address</div>
          <input class="border rounded-md border-gray-900 px-3 py-1 text-gray-800" v-model="beneficiaryAddress" />

          <div class="bg-gray-50 border border-gray-400 rounded mt-4 px-3 py-2" v-if="balance && withdrawalDate">
            <div class="text-gray-800">Balance: {{ balance }}</div>
            <div class="mt-1 text-gray-800">Withdrawal Date: {{ withdrawalDate }}</div>
          </div>

          <button class="rounded-md bg-black text-white px-4 py-1 mt-4" type="button" @click="onGetBalance">
            Get Balance
          </button>


        </div>
      </div>
    </div>


  </div>
</template>


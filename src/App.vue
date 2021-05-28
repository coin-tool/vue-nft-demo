<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <div>
      <button class="enableEthereumButton" @click="requestAccounts">获取账户信息</button>
      <p>连接状态：{{connectStatus ? '已连接' : '未连接'}}</p>
      <p>网络：{{network}}</p>
      <p>钱包地址：{{account}}</p>
      <p>合约地址：{{contractAddress}}</p>
      <p>合约创建者：{{contractOwner}}</p>
    </div>
    <div v-if="showMint" class="mint-box">
      <p>铸造NFT</p>
      <input type="text" v-model="mintAddress" placeholder="address"/>
      <input type="text" v-model="tokenURI" placeholder="tokenURI"/>
      <button @click="mint">铸造</button>
      <span>{{mintStatus}}</span>
    </div>
    <div class="nft-box">
      <p>NFT列表</p>
      <input type="text" v-model="nftId" placeholder="id"/>
      <button @click="search">查询</button>

      <div v-if="showNFT">
        <span :style="nftStyle"></span>
        <p>拥有者：{{nftOwner}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { networkMap } from '@/const/index'
import { getWeb3 } from '@/utils/index'
import contractOptions from '@/contract/TokenERC721.json'

const { web3, ethereum } = getWeb3();

export default {
  name: 'app',
  data() {
    return {
      connectStatus: '',
      network: '',
      account: '',
      contractAddress: contractOptions.address,
      contractOwner: '',
      showMint: false,
      mintAddress: '',
      tokenURI: '',
      mintStatus: '',
      showNFT: false,
      nftId: '',
      nftOwner: '',
      nftStyle: {
        display: 'inline-block',
        width: '100px',
        height: '100px',
        backgroundColor: ''
      }
    }
  },
  components: {},
  methods: {
    initEvent() {
      ethereum.on('chainChanged', (chainId) => {
        this.handleChainChanged(chainId)
      });
      ethereum.on('accountsChanged', (accounts) => {
        this.account = accounts[0];
      });
    },
    handleChainChanged(chainId) {
      this.network = networkMap[chainId]
    },
    async requestAccounts() {
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      this.handleChainChanged(chainId);
    },
    async initContract() {
      this.contract = new web3.eth.Contract(contractOptions.abi, this.contractAddress)
      this.contractOwner = await this.contract.methods.owner().call();
      if (this.account === this.contractOwner) {
        this.showMint = true
      }
    },
    async mint() {
      this.mintStatus = '铸造中';
      await this.contract.methods.awardItem(this.mintAddress, this.tokenURI).send({
        from: this.account
      });
      this.mintStatus = '铸造完成';
      this.mintAddress = '';
      this.tokenURI = '';
    },
    async search() {
      const owner = await this.contract.methods.ownerOf(this.nftId).call();
      const uri = await this.contract.methods.tokenURI(this.nftId).call();
      const metaData = await fetch(uri).then(function(response) {
        return response.json();
      })
      this.nftStyle.backgroundColor = metaData.color;
      this.nftOwner = owner;
      this.showNFT = true;
    }
  },
  async mounted() {
    this.connectStatus = ethereum.isConnected();
    this.initEvent();
    if (this.connectStatus) {
      await this.requestAccounts()
      await this.initContract()
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.mint-box {
  border: 1px solid #00ff22;
}
.nft-box {
  border: 1px solid #00ff22;
}
</style>

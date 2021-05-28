import Web3 from "web3";

let web3, ethereum;
if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
  // use MetaMask's provider
  web3 = new Web3(window.ethereum);
  ethereum = window.ethereum;
} else {
  // eslint-disable-next-line
  console.warn(
    "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
  );
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  web3 = new Web3(
    new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
  );
}

export function getWeb3() {
  return { web3, ethereum }
}
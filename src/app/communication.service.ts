import { Injectable } from '@angular/core';
import Web3 from 'web3';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  public web3: Web3 | null = null;
  public tokenContractAddresses: any = { "arbGoerli": "0x91CCb03f4c965831399F1915c178cb5853FfAD6e" };
  public accessContractAddresses:any = { "arbGoerli": "0xF29284Ac9F9a0f381E08D8907B8CA90683E421ed"};
  private web3Providers: any = { "arbGoerli": "https://goerli-rollup.arbitrum.io/rpc" };
  
  public availableNetworks = [
    {
      "name": "Arbitrum Goerli",
      "key": "arbGoerli",
      "currency": "ETH",
      "feePerMB": 0.0002
    }
  ];

  constructor() { }

  public async initWeb3(net:string) {

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.web3Providers[net]));
  }
  public getNetwork(key:string) {
    for (let n of this.availableNetworks) {
      if (n.key == key) {
        return n;
      }
    }
    return null;
  }
  public async enableMetamask() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      } catch (error) {
        console.log("error: ", error);
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }
  public async switchNetwork(key: string) {
    let network: any;
    if (key == "ethGoerli") {
      network = {
        chainId: '0x5',
        chainName: 'Ethereum Goerli',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH'
        },
        blockExplorerUrls: ['https://goerli.etherscan.io/'],
        rpcUrls: ['https://eth-goerli.public.blastapi.io'],
      };
    }
    else if (key == "arbGoerli") {
      network = {
        chainId: '0x66EED',
        chainName: 'Arbitrum Goerli',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH'
        },
        blockExplorerUrls: ['https://goerli.arbiscan.io'],
        rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
      };
    }
    else {
      console.error("invalid network: ", key);
      return;
    }
    try {
      // check if the chain to connect to is installed
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }], // chainId must be in hexadecimal numbers
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              network
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  }
}

import { Injectable } from '@angular/core';
import Web3 from 'web3';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  public web3: Web3 | null = null;
  public tokenContractAddresses: any = { 
    "arbGoerli": "0x91CCb03f4c965831399F1915c178cb5853FfAD6e",
    "optGoerli": "0x5e41CcC3599785AA5F66dfc3da6cD1f9C8e64D63",
    "goerli": "0xFD6FaF04156D9392EB1D05f092c2D00A9FA5E63F",
    "sphinx": "0x7d57b63596d347fcc0801b1ce3fc5c1e8d82324d",
    "mumbai": "0x5e41CcC3599785AA5F66dfc3da6cD1f9C8e64D63",
   };
  public accessContractAddresses:any = { 
    "arbGoerli": "0xF29284Ac9F9a0f381E08D8907B8CA90683E421ed",
    "optGoerli": "0x2bE78D8befea0D091b144C60CCcBb224D435A4c2",
    "goerli": "0x37fe0aC287B8c061cf1cb3a886E1BF17b89a658A",
    "sphinx": "0x5e41ccc3599785aa5f66dfc3da6cd1f9c8e64d63",
    "mumbai": "0x2bE78D8befea0D091b144C60CCcBb224D435A4c2"
  };
  private web3Providers: any = { 
    "arbGoerli": "https://goerli-rollup.arbitrum.io/rpc",
    "optGoerli": "https://goerli.optimism.io",
    "goerli": "https://eth-goerli.public.blastapi.io",
    "sphinx": "https://sphinx.shardeum.org/",
    "mumbai": "https://rpc-mumbai.maticvigil.com",
   };
  
  public availableNetworks = [
    {
      "name": "Arbitrum Goerli",
      "key": "arbGoerli",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "chainId": 421613,
      "enabled": true
    },
    {
      "name": "Optimism Goerli",
      "key": "optGoerli",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "chainId": 420,
      "enabled": true
    },
    {
      "name": "Ethereum Goerli",
      "key": "goerli",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "chainId": 5,
      "enabled": true
    },
    {
      "name": "Shardeum Sphinx",
      "key": "sphinx",
      "currency": "SHM",
      "feePerMB": 0.0002,
      "chainId": 8082,
      "enabled": true
    },
    {
      "name": "Polygon Mumbai",
      "key": "mumbai",
      "currency": "MATIC",
      "feePerMB": 5,
      "chainId": 80001,
      "enabled": true
    },
    {
      "name": "Ethereum",
      "key": "eth",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "chainId": 1,
      "enabled": false
    },
    {
      "name": "Polygon",
      "key": "matic",
      "currency": "MATIC",
      "feePerMB": 5,
      "chainId": 137,
      "enabled": false
    },
    {
      "name": "Optimism",
      "key": "optimism",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "chainId": 10,
      "enabled": false
    },
    {
      "name": "Arbitrum One",
      "key": "arbitrumone",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "chainId": 42161,
      "enabled": false
    },
  ];
  public resolveChainId(i:any) {
    for (let d of this.availableNetworks) {
      if (d.chainId == i) {
        return d.key;
      }
    }
    return "";
  }
  getBlockchainLink(hash:string, blockchain:string) {
    if (blockchain == "arbGoerli") {
      return "https://goerli.arbiscan.io/tx/" + hash;
    }
    else if (blockchain == "optGoerli") {
      return "https://goerli-optimism.etherscan.io/tx/" + hash;
    }
    else if (blockchain == "goerli") {
      return "https://goerli.etherscan.io/tx/" + hash;
    }
    else if (blockchain == "sphinx") {
      return "https://explorer-sphinx.shardeum.org/tx/" + hash;
    }
    else if (blockchain == "mumbai") {
      return "https://mumbai.polygonscan.com/tx/" + hash;
    }
    return "";
  }
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
    if (key == "goerli") {
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
    else if (key == "optGoerli") {
      network = {
        chainId: '0x1A4',
        chainName: 'Optimism Goerli',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH'
        },
        blockExplorerUrls: ['https://goerli-optimism.etherscan.io'],
        rpcUrls: ['https://goerli.optimism.io'],
      };
    }
    else if (key == "sphinx") {
      network = {
        chainId: '0x1F92',
        chainName: 'Shardeum Sphinx 1.X',
        nativeCurrency: {
          symbol: 'SHM',
          decimals: 18,
          name: 'SHM'
        },
        blockExplorerUrls: ['https://explorer-sphinx.shardeum.org/'],
        rpcUrls: ['https://sphinx.shardeum.org/'],
      };
    }
    else if (key == "mumbai") {
      network = {
        chainId: '0x13881',
        chainName: 'Mumbai Testnet',
        nativeCurrency: {
          symbol: 'MATIC',
          decimals: 18,
          name: 'MATIC'
        },
        blockExplorerUrls: ['https://polygonscan.com/'],
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
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

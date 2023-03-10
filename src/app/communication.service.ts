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
    "baseGoerli": "0x5e41CcC3599785AA5F66dfc3da6cD1f9C8e64D63",
    "polygon": "0x5e41CcC3599785AA5F66dfc3da6cD1f9C8e64D63",
    "arbitrum": "0x5e41CcC3599785AA5F66dfc3da6cD1f9C8e64D63",
    "optimism": "0x5e41CcC3599785AA5F66dfc3da6cD1f9C8e64D63",
    "ethereum": ""
   };
  public accessContractAddresses:any = { 
    "arbGoerli": "0xF29284Ac9F9a0f381E08D8907B8CA90683E421ed",
    "optGoerli": "0x2bE78D8befea0D091b144C60CCcBb224D435A4c2",
    "goerli": "0x37fe0aC287B8c061cf1cb3a886E1BF17b89a658A",
    "sphinx": "0x5e41ccc3599785aa5f66dfc3da6cd1f9c8e64d63",
    "mumbai": "0x2bE78D8befea0D091b144C60CCcBb224D435A4c2",
    "baseGoerli": "0x2bE78D8befea0D091b144C60CCcBb224D435A4c2",
    "polygon": "0x37fe0aC287B8c061cf1cb3a886E1BF17b89a658A",
    "arbitrum": "0x2bE78D8befea0D091b144C60CCcBb224D435A4c2",
    "optimism": "0x2bE78D8befea0D091b144C60CCcBb224D435A4c2",
    "ethereum": ""
  };
  private web3Providers: any = { 
    "arbGoerli": "https://goerli-rollup.arbitrum.io/rpc",
    "optGoerli": "https://goerli.optimism.io",
    "goerli": "https://eth-goerli.public.blastapi.io",
    "sphinx": "https://sphinx.shardeum.org/",
    "mumbai": "https://rpc-mumbai.maticvigil.com",
    "baseGoerli": "https://goerli.base.org",
    "polygon": "https://polygon-rpc.com/",
    "arbitrum": "https://arb1.arbitrum.io/rpc",
    "optimism": "https://mainnet.optimism.io",
    "ethereum": "https://mainnet.infura.io/v3/"
   };
  
  public availableNetworks = [
    {
      "name": "Arbitrum Goerli",
      "key": "arbGoerli",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "minPrice": 0.005,
      "freeFileFee": 0.005,
      "chainId": 421613,
      "enabled": true,
      "testnet": true
    },
    {
      "name": "Optimism Goerli",
      "key": "optGoerli",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "minPrice": 0.005,
      "freeFileFee": 0.005,
      "chainId": 420,
      "enabled": true,
      "testnet": true
    },
    {
      "name": "Ethereum Goerli",
      "key": "goerli",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "minPrice": 0.005,
      "freeFileFee": 0.005,
      "chainId": 5,
      "enabled": true,
      "testnet": true
    },
    {
      "name": "Shardeum Sphinx",
      "key": "sphinx",
      "currency": "SHM",
      "feePerMB": 0.0002,
      "minPrice": 0.005,
      "freeFileFee": 0.005,
      "chainId": 8082,
      "enabled": true,
      "testnet": true
    },
    {
      "name": "Polygon Mumbai",
      "key": "mumbai",
      "currency": "MATIC",
      "feePerMB": 5,
      "minPrice": 0.5,
      "freeFileFee": 0.005,
      "chainId": 80001,
      "enabled": true,
      "testnet": true
    },
    {
      "name": "Base Goerli",
      "key": "baseGoerli",
      "currency": "ETH",

    },
    {
      "name": "Ethereum",
      "key": "eth",
      "currency": "ETH",
      "feePerMB": 0.00002,
      "minPrice": 0.005,
      "freeFileFee": 0.005,
      "chainId": 1,
      "enabled": false,
      "testnet": false
    },
    {
      "name": "Polygon",
      "key": "polygon",
      "currency": "MATIC",
      "feePerMB": 0.001,
      "minPrice": 0.5,
      "freeFileFee": 2,
      "chainId": 137,
      "enabled": true,
      "testnet": false
    },
    {
      "name": "Optimism",
      "key": "optimism",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "freeFileFee": 0.005,
      "chainId": 10,
      "enabled": true,
      "testnet": false
    },
    {
      "name": "Arbitrum One",
      "key": "arbitrum",
      "currency": "ETH",
      "feePerMB": 0.0002,
      "minPrice": 0.005,
      "freeFileFee": 0.005,
      "chainId": 42161,
      "enabled": true,
      "testnet": false
    },
  ];
  public enableTestnets() {
    localStorage.setItem("testnets","true");
    window.location.reload();
  }
  public testnetsEnabled() {
    if (localStorage.getItem("testnets")=="true") {
      return true;
    }
    return false;
  }
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
    else if (blockchain == "baseGoerli") {
      return "https://goerli.basescan.org/tx/" + hash;
    }
    else if (blockchain == "polygon") {
      return "https://polygonscan.com/tx/" + hash;
    }
    else if (blockchain == "arbitrum") {
      return "https://arbiscan.io/tx/" + hash;
    }
    else if (blockchain == "optimism") {
      return "https://optimistic.etherscan.io/tx/" + hash;
    }
    else if (blockchain == "ethereum") {
      return "https://etherscan.io/tx/" + hash;
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
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
      };
    }
    else if (key == "baseGoerli") {
      network = {
        chainId: '0x14A33',
        chainName: 'Base Goerli',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH'
        },
        blockExplorerUrls: ['https://goerli.basescan.org'],
        rpcUrls: ['https://goerli.base.org'],
      };
    }
    else if (key == "polygon") {
      network = {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: {
          symbol: 'MATIC',
          decimals: 18,
          name: 'MATIC'
        },
        blockExplorerUrls: ['https://polygonscan.com/'],
        rpcUrls: ['https://polygon-rpc.com/'],
      };
    }
    else if (key == "arbitrum") {
      network = {
        chainId: '0xA4B1',
        chainName: 'Arbitrum One',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH'
        },
        blockExplorerUrls: ['https://arbiscan.io'],
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      };
    }
    else if (key == "optimism") {
      network = {
        chainId: '0xA',
        chainName: 'Optimism',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH'
        },
        blockExplorerUrls: ['https://optimistic.etherscan.io/'],
        rpcUrls: ['https://mainnet.optimism.io'],
      };
    }
    else if (key == "ethereum") {
      network = {
        chainId: '0x1',
        chainName: 'Ethereum',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
          name: 'ETH'
        },
        blockExplorerUrls: ['https://etherscan.io/'],
        rpcUrls: ['https://mainnet.infura.io/v3/'],
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

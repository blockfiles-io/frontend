import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Web3 from 'web3';

declare var window: any;
declare var ethereum: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public addresses = 0;
  private tokenContractAddresses: any = { "arbGoerli": "0xDf5D8e7380f9f8aD4038C5b07c156C3E103fe5D7" };
  private net = "arbGoerli";
  public ethAddresses = 0;
  public polygonAddresses = 0;
  public sentNotifications = 0;
  public messages: any[] = [];
  public mintReady = false;
  public entries = [
    {
      "address": "",
      "email": "",
      "loading": false,
      "sent": false,
      "message": "",
      "network": "ethereum",
      "error": false
    }
  ]

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {

  }

  fileUploaded = false;
  fileUploading = false;
  priceInfo = false;
  priceMessage = "";
  price = "";
  file = {
    "key": "",
    "loading": false,
    "network": "arbGoerli",
    "feeCurrency": "ETH",
    "royaltyFee": 0,
    "maxHolders": 0,
    "transactionTx": "",
    "expectedPayment": 0,
    "name": "",
    "storage": "s3"
  };
  availableNetworks = [
    {
      "name": "Arbitrum Goerli",
      "key": "arbGoerli",
      "currency": "ETH",
      "feePerMB": 0.0002
    }
  ];
  availableCurrencies: any = {
    "arbGoerli": ["ETH"]
  }
  fileStats: any;
  etherPrice = 0;
  updatePrice() {
    let n: any;
    for (let net of this.availableNetworks) {
      if (net.key == this.file.network) {
        n = net;
        break;
      }
    }
    let p = n.feePerMB * this.fileStats.sizeInMb;

    if (this.file.royaltyFee == 0) {
      p = p + 0.005;
      this.priceInfo = true;
      this.priceMessage = "Free downloads have a small upcharge.";
    }
    else {
      this.priceInfo = false;
    }
    this.etherPrice = p;
    this.price = p + " " + n.currency;
    if (this.etherPrice>0) {
      this.mintReady = true;
    }
    this.cd.detectChanges();
  }

  handleUploadChange(event: any) {
    if (event.target.files) {
      this.fileUploading = true;
      this.fileUploaded = false;
      this.cd.detectChanges();
      const file = event.target.files[0];
      console.log("d: ", event.target);
      //    const fileLink = URL.createObjectURL(file);       
      this.http.get<any>('http://localhost:8080/v1/uploads/signedUrl').subscribe(r => {
        console.log("R: ", r);
        this.http.put<any>(r.url, file).subscribe(d => {
          this.http.post<any>("http://localhost:8080/v1/uploads/check", {
            "key": r.key
          }).subscribe(d => {
            this.file.key = r.key;
            this.fileStats = d;
            this.fileUploading = false;
            this.fileUploaded = true;
            this.cd.detectChanges();
            this.updatePrice();
          })
        })
      })
    }

  }
  async enableMetamask() {
    if (window.ethereum) {
      try {
        await ethereum.enable();
      } catch (error) {
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
  private async switchNetwork(key: string) {
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
  mintLoading = false;
  contract:any;
  async mintFile() {
    if (this.mintLoading) {
      return;
    }
    this.mintLoading = true;
    this.cd.detectChanges();
    await this.enableMetamask();
    console.log("D: ", this.file.network);
    await this.switchNetwork(this.file.network);
    console.log("final amount: ", this.etherPrice);
    let ethA = Web3.utils.toWei('' + this.etherPrice, "ether");
    var weiAmount = Web3.utils.numberToHex(ethA);
    console.log('wei: ', weiAmount, ethA);
    let w = new Web3();
    this.contract = await new w.eth.Contract([{
      "inputs": [
        {
          "internalType": "uint256",
          "name": "sizeInMB",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxHolders",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "royaltyFee",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }]
      , this.tokenContractAddresses[this.net]);

      this.file.expectedPayment = this.etherPrice;
    const transactionParameters = {
      value: weiAmount,
      gas: Web3.utils.toHex(985000),
      maxPriorityFeePerGas: null,
      maxFeePerGas: null,
      to: this.tokenContractAddresses[this.net], // Required except during contract publications.
      from: window.ethereum.selectedAddress, // must match user's active address.
      data: this.contract.methods
        .mint(this.fileStats.sizeInMb, window.ethereum.selectedAddress, this.file.maxHolders,  Web3.utils.toWei('' + this.file.royaltyFee, "ether"))
        .encodeABI(),
    };
    console.log('params: ', transactionParameters);

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters]
      });
      this.file.transactionTx = txHash;
      this.http.post<any>('http://localhost:8080/v1/uploads/process', this.file).subscribe(r => {
        this.router.navigateByUrl('/file/' + this.file.key);
        this.mintLoading = true;
      });
    } catch (error: any) {
      this.mintLoading = false;
      alert("😥 Something went wrong: " + error.message);
    }
  }

  ngOnInit() {
    /* this.http.get<any>('https://api.blockfiles.io/v1/stats').subscribe(r => {
       for (const d of r.addresses) {
         if (d.network == "ethereum") {
           this.ethAddresses = d.count;
         }
         else if (d.network == "polygon") {
           this.polygonAddresses = d.count;
         }
       }
       this.sentNotifications = r.notifications;
       this.addresses = this.ethAddresses + this.polygonAddresses;
     })*/
  }
}

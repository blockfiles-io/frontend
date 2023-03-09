import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Web3 from 'web3';
import { CommunicationService } from '../communication.service';

declare var window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public addresses = 0;
  public ethAddresses = 0;
  public polygonAddresses = 0;
  public sentNotifications = 0;
  public messages: any[] = [];
  public mintReady = false;
  public advanced = false;
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
    private com: CommunicationService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.availableNetworks = this.com.availableNetworks;
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
    "web3only": false,
    "password": "",
    "expectedPayment": 0,
    "name": "",
    "storage": "s3"
  };
  availableNetworks:any[] = [];
  web3:Web3|null = null;
  availableCurrencies: any = {
    "arbGoerli": ["ETH"],
    "optGoerli": ["ETH"],
    "goerli": ["ETH"],
    "sphinx": ["SHM"],
    
  }
  fileStats: any;
  etherPrice = "";
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
    this.etherPrice = p.toFixed(10);
    this.price = this.etherPrice + " " + n.currency;
    if (+this.etherPrice > 0) {
      this.mintReady = true;
    }
    this.cd.detectChanges();
  }
  openAdvanced() {
    this.advanced = true;
    this.cd.detectChanges();
  }

  handleUploadChange(event: any) {
    if (event.target.files) {
      this.fileUploading = true;
      this.fileUploaded = false;
      this.cd.detectChanges();
      const file = event.target.files[0];
      
      //    const fileLink = URL.createObjectURL(file);       
      this.http.get<any>('/api/uploads/signedUrl').subscribe(r => {
        this.http.put<any>(r.url, file).subscribe(d => {
          this.http.post<any>("/api/uploads/check", {
            "key": r.key
          }).subscribe(d => {
            this.file.key = r.key;
            this.file.name = file.name;
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
 
  
  mintLoading = false;
  contract: any;
  async test() {
    
    let _gasPrice = await this.web3!.eth.getGasPrice();
    console.log("gasprice: ", _gasPrice);



  }
  async getExtraGas(network: string, data: any) {
    if (network == "arbGoerli") {
      let arbContract = await new this.web3!.eth.Contract([{ "inputs": [], "name": "getPricesInWei", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }], "0x000000000000000000000000000000000000006C");
      let extraL1Gas = await arbContract.methods.getPricesInWei().call();
      return extraL1Gas[1] * data.length;
    }
    return 0;
  }
  async mintFile() {
    if (this.mintLoading) {
      return;
    }
    this.mintLoading = true;
    this.cd.detectChanges();
    await this.com.initWeb3(this.file.network);
    await this.com.enableMetamask();
    await this.com.switchNetwork(this.file.network);
    this.web3 = this.com.web3;
    console.log("final amount: ", this.etherPrice);
    let ethA = Web3.utils.toWei('' + this.etherPrice, "ether");
    var weiAmount = Web3.utils.numberToHex(ethA);
    console.log('wei: ', weiAmount, ethA);
    this.contract = await new this.web3!.eth.Contract([{
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
      , this.com.tokenContractAddresses[this.file.network]);

    this.file.expectedPayment = +this.etherPrice;

    let gasEstimate = await this.contract.methods
      .mint(this.fileStats.sizeInMb, window.ethereum.selectedAddress, this.file.maxHolders, Web3.utils.toWei('' + this.file.royaltyFee, "ether")).estimateGas(
        {
          value: weiAmount
        }
      );
    let data = this.contract.methods
      .mint(this.fileStats.sizeInMb, window.ethereum.selectedAddress, this.file.maxHolders, Web3.utils.toWei('' + this.file.royaltyFee, "ether"))
      .encodeABI();

    let extraGas = await this.getExtraGas(this.file.network, data);
    let finalGas = gasEstimate + extraGas;
    console.log("gas estimates: ", gasEstimate, extraGas, finalGas);
    const transactionParameters = {
      value: weiAmount,
      gas: Web3.utils.toHex(gasEstimate),
      maxPriorityFeePerGas: null,
      maxFeePerGas: null,
      to: this.com.tokenContractAddresses[this.file.network], // Required except during contract publications.
      from: window.ethereum.selectedAddress, // must match user's active address.
      data: data,
    };
    console.log('params: ', transactionParameters);

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters]
      });
      this.file.transactionTx = txHash;
      this.http.post<any>('/api/uploads/process', this.file).subscribe(r => {
        this.router.navigateByUrl('/uploads/' + this.com.getNetwork(this.file.network)?.shortIndex + "/" + this.file.key);
        this.mintLoading = true;
        this.cd.detectChanges();
      });
    } catch (error: any) {
      this.mintLoading = false;
      alert("😥 Something went wrong: " + error.message);
      this.cd.detectChanges();
    }
  }

  ngOnInit() {

  }
}

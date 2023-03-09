import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
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
  public uploadPercentage = 0;

  constructor(
    private http: HttpClient,
    private com: CommunicationService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.availableNetworks = [];
    for (let n of this.com.availableNetworks) {
      if (n.enabled) {
        this.availableNetworks.push(n);
      }
    }
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
    "size": 0,
    "status": 0,
    "storage": "s3"
  };
  availableNetworks: any[] = [];
  web3: Web3 | null = null;
  availableCurrencies: any = {
    "arbGoerli": ["ETH"],
    "optGoerli": ["ETH"],
    "goerli": ["ETH"],
    "sphinx": ["SHM"],
    "baseGoerli": ["ETH"],
    "polygon": ["MATIC"],
    "ethereum": ["ETH"],
    "arbitrum": ["ETH"],
    "optimism": ["ETH"]

  }
  etherPrice = "";
  sizeInMb = 0;
  updatePrice() {
    let n: any;
    for (let net of this.availableNetworks) {
      if (net.key == this.file.network) {
        n = net;
        break;
      }
    }
    this.sizeInMb = Math.round(this.nativeFile.size / 1000000);
    let p = n.feePerMB * this.sizeInMb;

    if (this.file.royaltyFee == 0) {
      p = p + n.freeFileFee;
      this.priceInfo = true;
      this.priceMessage = "Free downloads have a small upcharge.";
    }
    else {
      this.priceInfo = false;
    }
    console.log("P: ", p);
    this.etherPrice = p.toFixed(10);
    if (this.etherPrice < n.minPrice) {
      this.etherPrice = n.minPrice.toFixed(10);
    }
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

  public nativeFile: any;

  handleUploadChange(event: any) {
    if (event.target.files) {
      this.nativeFile = event.target.files[0];
      console.log("file: ", this.nativeFile.size);
      this.updatePrice();

      //    const fileLink = URL.createObjectURL(file);       

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
      .mint(this.sizeInMb, window.ethereum.selectedAddress, this.file.maxHolders, Web3.utils.toWei('' + this.file.royaltyFee, "ether")).estimateGas(
        {
          value: weiAmount
        }
      );
    let data = this.contract.methods
      .mint(this.sizeInMb, window.ethereum.selectedAddress, this.file.maxHolders, Web3.utils.toWei('' + this.file.royaltyFee, "ether"))
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
      this.file.name = this.nativeFile.name;
      this.file.size = this.nativeFile.size;
      this.cd.detectChanges();

      this.http.post<any>('/api/uploads/process', this.file).subscribe(r => {
        this.file.key = r.key;

        this.uploadCheck();



      });
    } catch (error: any) {
      this.mintLoading = false;
      alert("😥 Something went wrong: " + error.message);
      this.cd.detectChanges();
    }
  }
  getBlockchainLink() {
    if (!this.file) {
      return "";
    }
    return this.com.getBlockchainLink(this.file.transactionTx, this.file.network);
  }

  uploadCheck() {
    this.fileUploading = true;
    this.fileUploaded = false;

    this.http.get<any>("/api/uploads/validate/" + this.file.key).subscribe(d => {
      if (d.blockchainConfirmed) {
        this.file.status = 1;
        this.cd.detectChanges();
        const req = new HttpRequest('PUT', d.url, this.nativeFile, {
          reportProgress: true
        });
        this.http.request(req).subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            let t = event.total;
            if (t == undefined) {
              t = 1;
            }
            this.uploadPercentage = Math.round(100 * event.loaded / t);
            console.log(`File is ${this.uploadPercentage}% uploaded.`);
            this.cd.detectChanges();
          } else if (event instanceof HttpResponse) {
            console.log('File is completely uploaded!');

            this.fileUploading = false;
            this.fileUploaded = true;
            this.cd.detectChanges();
            this.router.navigateByUrl('/uploads/' + this.com.getNetwork(this.file.network)?.chainId + "/" + this.file.key);
            this.mintLoading = true;
            this.cd.detectChanges();

          }
        });
      }
      else {
        let self = this;
        setTimeout(() => {
          self.uploadCheck();
        }, 1000);
      }
    })
  }

  ngOnInit() {

  }
}

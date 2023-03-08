import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Web3 from 'web3';
import { CommunicationService } from '../communication.service';

declare var window: any;

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent implements OnInit {
  public file: any;
  public loading = true;
  public free = false;
  public downloading = false;
  public buying = false;
  public error = "";
  private web3:Web3|null = null;
  private contract:any;
  public transactionTx = "";

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private com: CommunicationService,
    private route: ActivatedRoute
  ) {

  }
  async download() {
    this.downloading = true;
    await this.com.initWeb3(this.file.blockchain);
    await this.com.enableMetamask();
    await this.com.switchNetwork(this.file.blockchain);
    this.web3 = this.com.web3;
    let t = new Date().getTime();
    let message = "Hi from blockfiles.io!\n\nYou sign this message so we can authenticate your address.\n\n\nTime:" + (t);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    const signature = await window.ethereum.request({ method: 'personal_sign', params: [message, account] });
    this.http.get<any>('/api/files/download/3?sign='+signature+'&t='+t).subscribe(async res => {
      if (res.url) {

      }
      else {
        if (res.canBuy) {
          if (this.buying) {
            await this.checkDownload();
          }
          else {
            await this.buy();
          }
        }
        else {
          this.downloading = false;
          this.error = 'noMoreDownloads';
        }
      }
    });

  }
  async buy() {
    
    let ethA = Web3.utils.toWei('' + this.file.royaltyFee, "ether");
    var weiAmount = Web3.utils.numberToHex(ethA);
    console.log('wei: ', weiAmount, ethA);
    this.contract = await new this.web3!.eth.Contract([{
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "mintAccess",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }]
      , this.com.accessContractAddresses[this.file.blockchain]);

    let funct = this.contract.methods.mintAccess(this.file.tokenId, window.ethereum.selectedAddress);
    let gasEstimate = await funct.estimateGas(
        {
          value: weiAmount
        }
      );
    let data = funct
      .encodeABI();

    let extraGas = await this.getExtraGas(this.file.blockchain, data);
    let finalGas = gasEstimate + extraGas;
    console.log("gas estimates: ", gasEstimate, extraGas, finalGas);
    const transactionParameters = {
      value: weiAmount,
      gas: Web3.utils.toHex(gasEstimate),
      maxPriorityFeePerGas: null,
      maxFeePerGas: null,
      to: this.com.accessContractAddresses[this.file.blockchain], // Required except during contract publications.
      from: window.ethereum.selectedAddress, // must match user's active address.
      data: data,
    };
    console.log('params: ', transactionParameters);

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters]
      });
      this.transactionTx = txHash;
      
      await this.checkDownload();
    } catch (error: any) {
      this.downloading = false;
      alert("😥 Something went wrong: " + error.message);
    }
  }
  checkingTransaction = false;
  async checkDownload() {
    this.checkingTransaction = true;
    this.http.get<any>('/api/files/checkPurchase/'+this.transactionTx+"/"+this.file.tokenId).subscribe(async r => {
      console.log("r: ", r);
      if (r.success == false) {
        let self = this;
        setTimeout(()=> {
          self.checkDownload();
        },1000);
      }
      else {
        await this.buy();
      }
    });
  }
  async getExtraGas(network: string, data: any) {
    if (network == "arbGoerli") {
      let arbContract = await new this.web3!.eth.Contract([{ "inputs": [], "name": "getPricesInWei", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }], "0x000000000000000000000000000000000000006C");
      let extraL1Gas = await arbContract.methods.getPricesInWei().call();
      return extraL1Gas[1] * data.length;
    }
    return 0;
  }
  getPrice() {
    if (!this.file) {
      return "";
    }
    if (this.file.royaltyFee == 0) {
      this.free = true;
      return "free";
    }
    else {
      return this.file.royaltyFee + " " + this.com.getNetwork(this.file.blockchain)?.currency;
    }
  }

  getBlockchain() {

    if (!this.file) {
      return "";
    }
    if (this.file.blockchain == "arbGoerli") {
      return "Arbitrum (Goerli)";
    }
    return "";
  }
  getBlockchainLink() {
    if (!this.file) {
      return "";
    }
    if (this.file.blockchain == "arbGoerli") {
      return "https://goerli.arbiscan.io/tx/" + this.file.transactionTx;
    }
    return "";
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.cd.detectChanges();
    this.http.get<any>('/api/files/' + this.route.snapshot.params["id"]).subscribe(r => {
      this.file = r;
      this.loading = false;
      console.log("file: ", this.file);
      this.cd.detectChanges();

    });
  }
}

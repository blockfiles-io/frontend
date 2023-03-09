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
  public password = "";
  public downloading = false;
  public buying = false;
  public error = "";
  private web3: Web3 | null = null;
  private contract: any;
  public transactionTx = "";

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private com: CommunicationService,
    private route: ActivatedRoute
  ) {

  }
  private async processResponse(res:any) {
    this.error = "";
      if (res.url) {
        this.downloading = false;
        this.cd.detectChanges();
        window.location.href = res.url;
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
          this.cd.detectChanges();
        }
      }
    
  }
  async download() {
    if (this.downloading) {
      return;
    }
    this.downloading = true;
    if (this.file.royaltyFee == 0 && this.file.web3only == 0) {
      if (this.file.hasPassword) {
        this.http.post<any>('/api/files/download/' + this.route.snapshot.params["id"] + "?blockchain=" + this.com.resolveShortIndex(this.route.snapshot.params["shortIndex"]), {"password": this.password}).subscribe(async res => { this.processResponse(res)}, error => {
          this.error = 'password';
          this.downloading = false;
          this.cd.detectChanges();
        });
      
      }
      else {
        this.http.get<any>('/api/files/download/' + this.route.snapshot.params["id"] + "?blockchain=" + this.com.resolveShortIndex(this.route.snapshot.params["shortIndex"])).subscribe(async res => { this.processResponse(res)});
      }
    }
    else {
      try {
        await this.com.initWeb3(this.file.blockchain);
        await this.com.enableMetamask();
        await this.com.switchNetwork(this.file.blockchain);
        this.web3 = this.com.web3;
        let t = new Date().getTime();
        let message = "Hi from blockfiles.io!\n\nYou sign this message so we can authenticate your address.\n\n\nTime:" + (t);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const signature = await window.ethereum.request({ method: 'personal_sign', params: [message, account] });
        
        this.http.get<any>('/api/files/download/' + this.route.snapshot.params["id"] + '?sign=' + signature + '&t=' + t + "&blockchain=" + this.com.resolveShortIndex(this.route.snapshot.params["shortIndex"])).subscribe(async res => { this.processResponse(res)});
      }
      catch (error) {
        console.log("error: ", error);
        this.downloading = true;
        this.cd.detectChanges();
      }
    }



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
    this.http.get<any>('/api/files/checkPurchase/' + this.transactionTx + "/" + this.file.tokenId + "?blockchain=" + this.com.resolveShortIndex(this.route.snapshot.params["shortIndex"])).subscribe(async r => {
      console.log("r: ", r);
      if (r.success == false) {
        let self = this;
        setTimeout(() => {
          self.checkDownload();
        }, 1000);
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
    return this.com.getNetwork(this.file.blockchain)!.name;
  }
  getBlockchainLink() {
    if (!this.file) {
      return "";
    }
    return this.com.getBlockchainLink(this.file.transactionTx, this.file.blockchain);
  }
  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.cd.detectChanges();
    this.http.get<any>('/api/files/' + this.route.snapshot.params["id"] + "?blockchain=" + this.com.resolveShortIndex(this.route.snapshot.params["shortIndex"])).subscribe(r => {
      this.file = r;
      this.loading = false;
      console.log("file: ", this.file);
      this.cd.detectChanges();

    });
  }
}

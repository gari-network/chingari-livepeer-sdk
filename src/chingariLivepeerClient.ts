import {
  NODE_URL,
  APTOS_ADRESS,
} from "./constants";
import {
  AptosClient,
  CoinClient,
  getAddressFromAccountOrAddress,
} from "aptos";
import ed25519 from "ed25519";

export class ChingariLivepeer {
  private aptosClient: AptosClient;
  private coinClient: CoinClient
  constructor() {
    this.aptosClient = new AptosClient(NODE_URL);
    this.coinClient = new CoinClient(this.aptosClient)
  }

  /**
   * 
   * @param privateKey : string
   * @param message : string
   * @returns signature: string
   */
  createSignature = async (privateKey: string, message: string) => {
    const signature = ed25519.Sign(
      Buffer.from(message, "utf8"),
      Buffer.from(privateKey, "hex")
    );
    console.log("signature", signature);
    return signature.toString('hex');
  };

  /**
   * 
   * @param publicKey :string
   * @param signature :string
   * @param message : string
   * @returns boolean
   */
  web3Auth = async (
    publicKey: string,
    signature: string,
    message: string
  ) => {
    if (
      ed25519.Verify(
        Buffer.from(message, "utf8"),
        Buffer.from(signature, "hex"),
        Buffer.from(publicKey, "hex")
      )
    ) {
      console.log("Signature valid");
      return true;
    } else {
      console.log("Signature NOT valid");
      return false;
    }
  };

  /**
   * 
   * @param account : string
   * @param minimumBalance : number
   * @param extraArgs : { @param coinType: string }
   * @returns boolean
   */
  isSufficientBalance = async (
    account: string,
    minimumBalance: number,
    extraArgs?: {
      // The coin type to use, defaults to 0x1::aptos_coin::AptosCoin
      coinType?: string;
    },
  ) => {
    //fetch coin balance
    try {
      const coinType = extraArgs?.coinType ?? APTOS_ADRESS;
      const address = getAddressFromAccountOrAddress(account);

      const balance = await this.coinClient.checkBalance(address, { coinType: coinType })
      if (balance < minimumBalance) {
        console.log("not enough balance");
        return false;
      } else {
        console.log("sufficient balance");
        return true;
      }
    } catch (err) {
      return { status: false, message: err.message }
    }
  };

}
